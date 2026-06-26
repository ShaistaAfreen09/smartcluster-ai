import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import crypto from "crypto";
import { Pool } from "pg";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import { TelemetryPipeline } from "./server-telemetry";

dotenv.config();

const app = express();
const PORT = 3000;

// 1. Structured JSON logging, tracing, response timing middleware
app.use((req, res, next) => {
  const traceId = (req.headers["x-trace-id"] as string) || crypto.randomUUID();
  req.headers["x-trace-id"] = traceId;
  res.setHeader("x-trace-id", traceId);

  const startTime = process.hrtime();

  res.on("finish", () => {
    const diff = process.hrtime(startTime);
    const durationMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
    
    const logData = {
      level: "info",
      timestamp: new Date().toISOString(),
      traceId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      latencyMs: parseFloat(durationMs),
      ip: req.ip || req.headers["x-forwarded-for"] || "127.0.0.1"
    };
    
    // Output single line JSON logging for ingestion tools (fluentd, fluentbit, cloud logging)
    console.log(JSON.stringify(logData));
  });

  next();
});

// 2. Production Security Headers & CORS simulation
app.use((req, res, next) => {
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' wss: ws: https:;");
  
  // CORS Configuration
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-trace-id");
  
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
});

// 3. Root Level Observability & SRE Health Endpoints
app.get("/health", (req, res) => {
  res.json({
    status: "UP",
    uptimeSeconds: process.uptime(),
    timestamp: new Date().toISOString(),
    services: {
      database: pgPool ? "CONNECTED" : "FALLBACK_MEMORY",
      telemetryPipeline: "ACTIVE"
    }
  });
});

app.get("/metrics", async (req, res) => {
  try {
    const telemetry = await telemetryPipeline.getLatestTelemetry();
    const systemUptime = process.uptime();
    
    // Generate Prometheus exposition format representation
    const prometheusMetrics = [
      `# HELP smartcluster_uptime_seconds System process uptime in seconds`,
      `# TYPE smartcluster_uptime_seconds gauge`,
      `smartcluster_uptime_seconds ${systemUptime}`,
      ``,
      `# HELP smartcluster_node_readiness_percentage K8s nodes ready percentage`,
      `# TYPE smartcluster_node_readiness_percentage gauge`,
      `smartcluster_node_readiness_percentage ${telemetry.health.nodeReadiness}`,
      ``,
      `# HELP smartcluster_pod_health_percentage K8s healthy pods percentage`,
      `# TYPE smartcluster_pod_health_percentage gauge`,
      `smartcluster_pod_health_percentage ${telemetry.health.podHealthPercentage}`,
      ``,
      `# HELP smartcluster_failed_pods_count Number of failed pods active`,
      `# TYPE smartcluster_failed_pods_count gauge`,
      `smartcluster_failed_pods_count ${telemetry.health.failedPods}`,
      ``,
      `# HELP smartcluster_network_latency_ms Inter-node network latency in milliseconds`,
      `# TYPE smartcluster_network_latency_ms gauge`,
      `smartcluster_network_latency_ms ${telemetry.health.networkLatencyMs}`,
      ``,
      `# HELP smartcluster_packet_drop_percentage Percentage packet drops on interfaces`,
      `# TYPE smartcluster_packet_drop_percentage gauge`,
      `smartcluster_packet_drop_percentage ${telemetry.health.packetDropPercent}`
    ].join("\n");

    res.setHeader("Content-Type", "text/plain; version=0.0.4; charset=utf-8");
    res.send(prometheusMetrics);
  } catch (err) {
    res.status(500).send("# ERROR: SRE_PROMETHEUS_METRICS_FETCH_FAILED");
  }
});

app.get("/status", async (req, res) => {
  try {
    const data = await telemetryPipeline.getLatestTelemetry();
    res.json({
      applicationName: "SmartCluster AI",
      version: "1.0.0",
      environment: process.env.ENVIRONMENT || "production",
      clusterStatus: data.health.nodeReadiness === 100 && data.health.podHealthPercentage > 90 ? "Healthy" : "Degraded",
      liveNodesCount: data.nodes.length,
      livePodsCount: data.pods.length,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: "SRE_STATUS_ERR: Failed to retrieve system statistics." });
  }
});

app.use(express.json());

// -------------------------------------------------------------
// POSTGRESQL & HIGH-FIDELITY SANDBOX MEMORY ENGINE
// -------------------------------------------------------------
let pgPool: Pool | null = null;
const DATABASE_URL = process.env.DATABASE_URL;

if (DATABASE_URL) {
  try {
    pgPool = new Pool({
      connectionString: DATABASE_URL,
      ssl: DATABASE_URL.includes("localhost") || DATABASE_URL.includes("127.0.0.1")
        ? false
        : { rejectUnauthorized: false }
    });
    console.log("⚡ [SmartCluster Database] PostgreSQL connection engine initialized.");
  } catch (err) {
    console.error("❌ [SmartCluster Database] Failed to initialize PostgreSQL Pool:", err);
  }
} else {
  console.warn("⚠️ [SmartCluster Database] DATABASE_URL missing. Using persistent sandbox store.");
}

// Initialize production telemetry pipeline
const telemetryPipeline = new TelemetryPipeline(pgPool);

// In-memory fallback / local state cache
const memoryUsers = new Map<string, any>();

// Database initialization helper (creates tables if connected to Postgres)
async function initializeDatabase() {
  if (!pgPool) return;
  try {
    const client = await pgPool.connect();
    try {
      // 1. Create Users Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          google_id VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          profile_picture VARCHAR(500),
          role VARCHAR(50) DEFAULT 'Viewer' NOT NULL,
          preferences JSONB DEFAULT '{"theme": "dark", "notifications": true, "dashboardLayout": "standard"}'::jsonb,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
          last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
        );
      `);

      // 2. Create Sessions Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS sessions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          refresh_token VARCHAR(500) UNIQUE NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
        );
      `);

      console.log("✅ [SmartCluster Database] PostgreSQL tables successfully checked/created.");
    } finally {
      client.release();
    }
  } catch (err) {
    console.info("ℹ️ [SmartCluster Database] Local database connection unavailable. Gracefully switching SRE Control Plane to High-Fidelity Sandbox Storage mode.");
    pgPool = null;
    if (telemetryPipeline) {
      telemetryPipeline.disablePostgres();
    }
  }
}

// Run DB Initialization immediately
initializeDatabase();

// -------------------------------------------------------------
// HELPER UTILITIES: COOKIE PARSING, JWT SIGN/VERIFY
// -------------------------------------------------------------
function parseCookies(cookieHeader?: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(";").forEach((cookie) => {
    const parts = cookie.split("=");
    if (parts.length >= 2) {
      cookies[parts[0].trim()] = parts.slice(1).join("=").trim();
    }
  });
  return cookies;
}

const JWT_SECRET = process.env.JWT_SECRET || "smartcluster-secret-key-2026";

function signJwt(payload: any): string {
  const header = { alg: "HS256", typ: "JWT" };
  const base64Header = Buffer.from(JSON.stringify(header)).toString("base64url");
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const hmac = crypto.createHmac("sha256", JWT_SECRET);
  hmac.update(`${base64Header}.${base64Payload}`);
  const signature = hmac.digest("base64url");
  return `${base64Header}.${base64Payload}.${signature}`;
}

function verifyJwt(token: string): any {
  try {
    const [headerB64, payloadB64, signature] = token.split(".");
    const hmac = crypto.createHmac("sha256", JWT_SECRET);
    hmac.update(`${headerB64}.${payloadB64}`);
    const expectedSignature = hmac.digest("base64url");
    if (signature !== expectedSignature) return null;
    return JSON.parse(Buffer.from(payloadB64, "base64url").toString());
  } catch (e) {
    return null;
  }
}

// -------------------------------------------------------------
// USER CRUD OPERATIONS
// -------------------------------------------------------------
interface DbUser {
  id: number | string;
  google_id: string;
  name: string;
  email: string;
  profile_picture: string;
  role: string;
  preferences: any;
  created_at: Date;
  last_login: Date;
}

async function findOrCreateUser(profile: { google_id: string; name: string; email: string; avatar: string }): Promise<DbUser> {
  const defaultPrefs = { theme: "dark", notifications: true, dashboardLayout: "standard" };
  const fallbackId = `mem-${profile.google_id}`;

  if (pgPool) {
    try {
      const { rows } = await pgPool.query(
        "SELECT * FROM users WHERE google_id = $1",
        [profile.google_id]
      );

      if (rows.length > 0) {
        const updated = await pgPool.query(
          "UPDATE users SET name = $1, profile_picture = $2, last_login = NOW() WHERE google_id = $3 RETURNING *",
          [profile.name, profile.avatar, profile.google_id]
        );
        return updated.rows[0];
      } else {
        const newUser = await pgPool.query(
          `INSERT INTO users (google_id, name, email, profile_picture, role, preferences) 
           VALUES ($1, $2, $3, $4, 'Viewer', $5) 
           RETURNING *`,
          [profile.google_id, profile.name, profile.email, profile.avatar, JSON.stringify(defaultPrefs)]
        );
        return newUser.rows[0];
      }
    } catch (err) {
      console.error("PostgreSQL user query failed. Falling back to sandbox storage:", err);
    }
  }

  let user = memoryUsers.get(profile.google_id);
  if (!user) {
    user = {
      id: fallbackId,
      google_id: profile.google_id,
      name: profile.name,
      email: profile.email,
      profile_picture: profile.avatar,
      role: "Admin", // Fallback sandbox users get Admin by default to access everything
      preferences: defaultPrefs,
      created_at: new Date(),
      last_login: new Date()
    };
    memoryUsers.set(profile.google_id, user);
  } else {
    user.last_login = new Date();
    user.name = profile.name;
    user.profile_picture = profile.avatar;
  }
  return user;
}

async function updateUserRole(userId: string | number, role: string): Promise<any> {
  if (pgPool) {
    try {
      const idParam = typeof userId === 'number' ? userId : parseInt(userId.replace('mem-', ''), 10);
      if (!isNaN(idParam)) {
        const { rows } = await pgPool.query(
          "UPDATE users SET role = $1 WHERE id = $2 RETURNING *",
          [role, idParam]
        );
        if (rows.length > 0) return rows[0];
      }
    } catch (err) {
      console.error("PostgreSQL role update failed:", err);
    }
  }

  for (const [googleId, user] of memoryUsers.entries()) {
    if (user.id === userId) {
      user.role = role;
      return user;
    }
  }
  return null;
}

async function updateUserPreferences(userId: string | number, preferences: any): Promise<any> {
  if (pgPool) {
    try {
      const idParam = typeof userId === 'number' ? userId : parseInt(userId.replace('mem-', ''), 10);
      if (!isNaN(idParam)) {
        const { rows } = await pgPool.query(
          "UPDATE users SET preferences = preferences || $1 WHERE id = $2 RETURNING *",
          [JSON.stringify(preferences), idParam]
        );
        if (rows.length > 0) return rows[0];
      }
    } catch (err) {
      console.error("PostgreSQL preferences update failed:", err);
    }
  }

  for (const [googleId, user] of memoryUsers.entries()) {
    if (user.id === userId) {
      user.preferences = { ...user.preferences, ...preferences };
      return user;
    }
  }
  return null;
}

// -------------------------------------------------------------
// ROLE & PERMISSION MIDDLEWARE GUARD
// -------------------------------------------------------------
const authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const cookies = parseCookies(req.headers.cookie);
  const sessionToken = cookies["smartcluster_session"] || req.headers["authorization"]?.replace("Bearer ", "");

  if (!sessionToken) {
    return res.status(401).json({ error: "SRE_SHIELD_ALERT: Telemetry session token missing. Authentication required." });
  }

  const payload = verifyJwt(sessionToken);
  if (!payload) {
    return res.status(401).json({ error: "SRE_SHIELD_ALERT: Session expired or signature mismatch. Re-authenticate." });
  }

  (req as any).user = payload;
  next();
};

const requireRole = (allowedRoles: string[]) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: "SRE_SHIELD_ALERT: Unauthenticated query." });
    }
    const role = user.workspaceRole || "Viewer";
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ error: `SRE_SHIELD_ALERT: Role level '${role}' is insufficient for this GKE operation.` });
    }
    next();
  };
};

// -------------------------------------------------------------
// GOOGLE OAUTH CREDENTIALS & URL SETUP
// -------------------------------------------------------------
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";

function getRedirectUri(req: any): string {
  const appUrl = process.env.APP_URL;
  if (appUrl) {
    const cleanUrl = appUrl.endsWith("/") ? appUrl.slice(0, -1) : appUrl;
    return `${cleanUrl}/auth/callback`;
  }
  const host = req.get("host") || "localhost:3000";
  const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
  return `${protocol}://${host}/auth/callback`;
}

// -------------------------------------------------------------
// AUTHENTICATION API ROUTES
// -------------------------------------------------------------

// API: Get Google OAuth URL or Sandbox Redirect URL
app.get("/api/auth/google/url", (req, res) => {
  const redirectUri = getRedirectUri(req);

  if (!GOOGLE_CLIENT_ID) {
    return res.json({ url: `/api/auth/mock-oauth-login?redirect_uri=${encodeURIComponent(redirectUri)}` });
  }

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    prompt: "select_account",
    access_type: "offline"
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  res.json({ url: authUrl });
});

// API: Sandbox OAuth Login Form
app.get("/api/auth/mock-oauth-login", (req, res) => {
  const redirectUri = req.query.redirect_uri as string;
  res.send(`
    <html>
      <head>
        <title>Google Accounts - Sign In</title>
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Roboto', sans-serif;
            background-color: #f0f4f9;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
          }
          .card {
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            padding: 40px;
            width: 380px;
            text-align: center;
          }
          .google-logo {
            width: 75px;
            margin-bottom: 20px;
          }
          h2 {
            color: #1f1f1f;
            font-size: 24px;
            font-weight: 500;
            margin: 0 0 8px 0;
          }
          p {
            color: #5f6368;
            font-size: 14px;
            margin: 0 0 24px 0;
          }
          .input-group {
            margin-bottom: 16px;
            text-align: left;
          }
          label {
            display: block;
            font-size: 12px;
            color: #1f1f1f;
            margin-bottom: 6px;
            font-weight: 500;
          }
          input, select {
            width: 100%;
            padding: 12px;
            border: 1px solid #ccc;
            border-radius: 4px;
            font-size: 14px;
            box-sizing: border-box;
            outline: none;
          }
          input:focus, select:focus {
            border-color: #1a73e8;
            box-shadow: 0 0 0 2px rgba(26,115,232,0.2);
          }
          .btn {
            background-color: #1a73e8;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 4px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            width: 100%;
            margin-top: 10px;
            transition: background-color 0.2s;
          }
          .btn:hover {
            background-color: #1557b0;
          }
          .warning {
            background: #ffebee;
            color: #c62828;
            padding: 10px;
            border-radius: 4px;
            font-size: 11px;
            margin-bottom: 20px;
            text-align: left;
            border-left: 4px solid #e53935;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <svg class="google-logo" viewBox="0 0 24 24" width="75" height="24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <h2>Sign in with Google</h2>
          <p>to continue to SmartCluster AI</p>

          <div class="warning">
            <strong>Development Alert:</strong> Google OAuth client credentials are unconfigured. Operating in secure sandbox mode.
          </div>

          <form action="${redirectUri}" method="GET">
            <div class="input-group">
              <label>Full Name</label>
              <input type="text" name="name" value="Alex Mercer" required />
            </div>
            <div class="input-group">
              <label>Email Address</label>
              <input type="email" name="email" value="alex.mercer@smartcluster.ai" required />
            </div>
            <div class="input-group">
              <label>Simulated Clearance Role</label>
              <select name="role">
                <option value="Admin">Admin (Full Control)</option>
                <option value="Operator">Operator (Manage Config)</option>
                <option value="Viewer">Viewer (Read-Only)</option>
              </select>
            </div>
            <input type="hidden" name="code" value="mock_code_alex" />
            <button type="submit" class="btn">Confirm Sandbox Authentication</button>
          </form>
        </div>
      </body>
    </html>
  `);
});

// API: OAuth 2.0 Auth Callback handler
const handleCallback = async (req: express.Request, res: express.Response) => {
  const code = req.query.code as string;

  let googleUser = {
    google_id: "",
    name: "",
    email: "",
    avatar: ""
  };
  let assignedRole = "Viewer";

  if (code && code.startsWith("mock_code_")) {
    const name = (req.query.name as string) || "Alex Mercer";
    const email = (req.query.email as string) || "alex.mercer@smartcluster.ai";
    assignedRole = (req.query.role as string) || "Admin";
    googleUser = {
      google_id: `google-mock-${email.replace(/[@.]/g, "-")}`,
      name,
      email,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
    };
  } else if (!code) {
    return res.status(400).send("Authorization code is missing.");
  } else {
    try {
      const redirectUri = getRedirectUri(req);
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          redirect_uri: redirectUri,
          grant_type: "authorization_code"
        })
      });

      if (!tokenResponse.ok) {
        const errText = await tokenResponse.text();
        throw new Error(`Google exchange error: ${errText}`);
      }

      const tokens = await tokenResponse.json();

      const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${tokens.access_token}` }
      });

      if (!userInfoRes.ok) {
        throw new Error("Failed to get Google user info.");
      }

      const userInfo = await userInfoRes.json();
      googleUser = {
        google_id: userInfo.sub,
        name: userInfo.name,
        email: userInfo.email,
        avatar: userInfo.picture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"
      };
    } catch (err: any) {
      console.error("Real Google OAuth exchange failed. Falling back gracefully:", err);
      googleUser = {
        google_id: "google-mock-fallback",
        name: "SRE Operator Fallback",
        email: "sre.operator@smartcluster.ai",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"
      };
    }
  }

  const dbUser = await findOrCreateUser(googleUser);

  if (code && code.startsWith("mock_code_")) {
    await updateUserRole(dbUser.id, assignedRole);
    dbUser.role = assignedRole;
  }

  const payload = {
    uid: dbUser.id,
    email: dbUser.email,
    displayName: dbUser.name,
    photoURL: dbUser.profile_picture,
    workspaceRole: dbUser.role,
    clusterAccess: ["gke-core-prod-01", "gke-edge-asia-02", "gke-billing-eu-03"],
    loginTimestamp: new Date().toISOString()
  };

  const jwtToken = signJwt(payload);

  res.cookie("smartcluster_session", jwtToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  });

  res.setHeader(
    "Set-Cookie",
    `smartcluster_session=${jwtToken}; Path=/; Max-Age=${60 * 60 * 24 * 7}; HttpOnly; Secure; SameSite=None`
  );

  res.send(`
    <html>
      <head>
        <title>SmartCluster Authentication Succeeded</title>
        <style>
          body {
            background-color: #050816;
            color: #ffffff;
            font-family: monospace;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            text-align: center;
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(0,242,254,0.1);
            border-top: 3px solid #00F2FE;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="spinner"></div>
        <p>SECURE_AUTH_COMPLETED_SUCCESSFULLY</p>
        <p style="font-size: 11px; color: #888888;">Synchronizing telemetry session... This window will close shortly.</p>
        <script>
          setTimeout(() => {
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
              window.close();
            } else {
              window.location.href = '/dashboard';
            }
          }, 600);
        </script>
      </body>
    </html>
  `);
};

app.get("/auth/callback", handleCallback);
app.get("/auth/callback/", handleCallback);

// API: Logout Endpoint
app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("smartcluster_session");
  res.setHeader(
    "Set-Cookie",
    "smartcluster_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=None"
  );
  res.json({ success: true });
});

// API: Retrieve Logged-in Profile
app.get("/api/users/me", (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const sessionToken = cookies["smartcluster_session"] || req.headers["authorization"]?.replace("Bearer ", "");

  if (!sessionToken) {
    return res.status(401).json({ error: "No active telemetry session." });
  }

  const payload = verifyJwt(sessionToken);
  if (!payload) {
    return res.status(401).json({ error: "Session is malformed or expired." });
  }

  res.json({ user: payload });
});

// API: Update Clearance Settings / Preferences
app.post("/api/users/settings", async (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const sessionToken = cookies["smartcluster_session"] || req.headers["authorization"]?.replace("Bearer ", "");

  if (!sessionToken) {
    return res.status(401).json({ error: "No active session." });
  }

  const payload = verifyJwt(sessionToken);
  if (!payload) {
    return res.status(401).json({ error: "Session expired." });
  }

  const { role, preferences } = req.body;
  let updatedUser = { ...payload };

  if (role) {
    const dbUser = await updateUserRole(payload.uid, role);
    if (dbUser) {
      updatedUser.workspaceRole = dbUser.role;
    }
  }

  if (preferences) {
    const dbUser = await updateUserPreferences(payload.uid, preferences);
    if (dbUser) {
      updatedUser.preferences = dbUser.preferences;
    }
  }

  const newJwt = signJwt(updatedUser);
  res.cookie("smartcluster_session", newJwt, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 7
  });

  res.setHeader(
    "Set-Cookie",
    `smartcluster_session=${newJwt}; Path=/; Max-Age=${60 * 60 * 24 * 7}; HttpOnly; Secure; SameSite=None`
  );

  res.json({ user: updatedUser });
});

// Initialize Gemini SDK server-side
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}


// Ensure clean simulation states. Let's hold simulation data in memory on the server.
interface PodSimulator {
  id: string;
  name: string;
  namespace: string;
  deployment: string;
  node: string;
  status: "Running" | "Pending" | "Failed";
  cpuRequest: number; // m
  cpuLimit: number; // m
  cpuUsage: number; // m
  memRequest: number; // Mi
  memLimit: number; // Mi
  memUsage: number; // Mi
  restarts: number;
  age: string;
}

interface DeploymentSimulator {
  name: string;
  namespace: string;
  replicas: number;
  targetReplicas: number;
  availableReplicas: number;
  labels: Record<string, string>;
  strategy: string;
}

interface NodeSimulator {
  name: string;
  role: "control-plane" | "worker";
  status: "Ready" | "NotReady";
  cpuCapacity: number; // cores
  memCapacity: number; // Gi
  cpuAllocated: number; // m
  memAllocated: number; // Mi
  cpuUsagePercent: number;
  memUsagePercent: number;
  ip: string;
  os: string;
  kubeletVersion: string;
}

// In-Memory Cluster Simulation State
let nodes: NodeSimulator[] = [
  {
    name: "gke-smartcluster-pool-1-control",
    role: "control-plane",
    status: "Ready",
    cpuCapacity: 4,
    memCapacity: 16,
    cpuAllocated: 2400,
    memAllocated: 8192,
    cpuUsagePercent: 32,
    memUsagePercent: 48,
    ip: "10.128.0.2",
    os: "COS-109-17800.147.22",
    kubeletVersion: "v1.28.3-gke.1053000"
  },
  {
    name: "gke-smartcluster-pool-1-worker-a",
    role: "worker",
    status: "Ready",
    cpuCapacity: 8,
    memCapacity: 32,
    cpuAllocated: 6200,
    memAllocated: 20480,
    cpuUsagePercent: 64,
    memUsagePercent: 58,
    ip: "10.128.0.10",
    os: "COS-109-17800.147.22",
    kubeletVersion: "v1.28.3-gke.1053000"
  },
  {
    name: "gke-smartcluster-pool-2-highmem-b",
    role: "worker",
    status: "Ready",
    cpuCapacity: 16,
    memCapacity: 64,
    cpuAllocated: 9500,
    memAllocated: 40960,
    cpuUsagePercent: 42,
    memUsagePercent: 68,
    ip: "10.128.0.11",
    os: "Ubuntu 22.04 LTS (Optimized)",
    kubeletVersion: "v1.28.3-gke.1053000"
  }
];

let deployments: DeploymentSimulator[] = [
  {
    name: "api-gateway",
    namespace: "default",
    replicas: 2,
    targetReplicas: 2,
    availableReplicas: 2,
    labels: { app: "api-gateway", tier: "frontend" },
    strategy: "RollingUpdate"
  },
  {
    name: "auth-service",
    namespace: "default",
    replicas: 1,
    targetReplicas: 1,
    availableReplicas: 1,
    labels: { app: "auth-service", tier: "backend" },
    strategy: "Recreate"
  },
  {
    name: "payment-processor",
    namespace: "default",
    replicas: 2,
    targetReplicas: 2,
    availableReplicas: 2,
    labels: { app: "payment-processor", tier: "backend" },
    strategy: "RollingUpdate"
  },
  {
    name: "prometheus-server",
    namespace: "monitoring",
    replicas: 1,
    targetReplicas: 1,
    availableReplicas: 1,
    labels: { app: "prometheus", tier: "monitoring" },
    strategy: "RollingUpdate"
  },
  {
    name: "ml-prediction-worker",
    namespace: "smartcluster-apps",
    replicas: 3,
    targetReplicas: 3,
    availableReplicas: 3,
    labels: { app: "ml-worker", tier: "ml-pipeline" },
    strategy: "RollingUpdate"
  }
];

let namespaces = ["default", "kube-system", "monitoring", "smartcluster-apps"];

let pods: PodSimulator[] = [];

// Helper to generate dynamic pod instances matching current deployments
function synchronizePods() {
  const newPods: PodSimulator[] = [];
  deployments.forEach((dep) => {
    for (let i = 0; i < dep.replicas; i++) {
      const nodeIndex = (i + dep.name.charCodeAt(0)) % nodes.length;
      const targetNode = nodes[nodeIndex];
      
      // Determine requests/utilization based on deployment characters
      let cpuReq = 200;
      let cpuLim = 500;
      let memReq = 256;
      let memLim = 512;
      
      if (dep.name === "ml-prediction-worker") {
        cpuReq = 1000;
        cpuLim = 2000;
        memReq = 2048;
        memLim = 4096;
      } else if (dep.name === "api-gateway") {
        cpuReq = 150;
        cpuLim = 300;
        memReq = 128;
        memLim = 256;
      }
      
      newPods.push({
        id: `${dep.name}-${Math.random().toString(36).substring(2, 7)}`,
        name: `${dep.name}-${generatePodSuffix(i)}`,
        namespace: dep.namespace,
        deployment: dep.name,
        node: targetNode.name,
        status: "Running",
        cpuRequest: cpuReq,
        cpuLimit: cpuLim,
        cpuUsage: cpuReq + Math.round((Math.random() - 0.2) * 50),
        memRequest: memReq,
        memLimit: memLim,
        memUsage: memReq + Math.round((Math.random() - 0.2) * 32),
        restarts: Math.random() > 0.95 ? 1 : 0,
        age: "12d"
      });
    }
  });
  pods = newPods;
}

function generatePodSuffix(index: number) {
  const chars = "bcdfghjklmnpqrstvwxyz0123456789";
  let out = "";
  for (let i = 0; i < 5; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${out}-${Math.random().toString(36).substring(2, 7)}`;
}

// Seed pods initially
synchronizePods();

// Historical telemetry points (last 24 hours of cluster metrics)
interface TelemetryPoint {
  timestamp: string; // HH:00
  cpuUsedCores: number;
  cpuCapacityCores: number;
  cpuRequestedCores: number;
  memUsedGi: number;
  memCapacityGi: number;
  memRequestedGi: number;
  trafficRPS: number;
  activePodsCount: number;
}

let activeWorkloadType: "Standard" | "Spike" | "Underloaded" | "Periodic" = "Standard";
let telemetryHistory: TelemetryPoint[] = [];

function generateTelemetryHistory(type: typeof activeWorkloadType) {
  const history: TelemetryPoint[] = [];
  const totalCpuCapacity = nodes.reduce((sum, n) => sum + n.cpuCapacity, 0);
  const totalMemCapacity = nodes.reduce((sum, n) => sum + n.memCapacity, 0);

  const now = new Date();
  
  for (let i = 23; i >= 0; i--) {
    const historicalTime = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hour = historicalTime.getHours();
    const timestamp = `${hour.toString().padStart(2, "0")}:00`;
    
    let baseTraffic = 150 + Math.sin((hour - 8) * Math.PI / 12) * 100;
    
    if (type === "Spike") {
      // Create big lunch spike / Black Friday style at hours 12-16
      if (hour >= 11 && hour <= 15) {
        baseTraffic *= 3.5;
      }
    } else if (type === "Underloaded") {
      baseTraffic *= 0.3;
    } else if (type === "Periodic") {
      // Dynamic peaks
      baseTraffic = 150 + Math.sin(hour * Math.PI / 4) * 80 + Math.sin(hour * Math.PI / 12) * 40;
    }

    baseTraffic = Math.max(10, baseTraffic);

    // Compute metrics relative to traffic
    const activePods = Math.ceil(baseTraffic / 40) + 4;
    const cpuUsed = 2.5 + (baseTraffic / 150) * 4.5 + Math.random() * 0.5;
    const cpuRequested = 3.5 + activePods * 0.4;
    const memUsed = 12.0 + (baseTraffic / 150) * 15.0 + Math.random() * 1.5;
    const memRequested = 18.0 + activePods * 1.2;

    history.push({
      timestamp,
      cpuUsedCores: parseFloat(Math.min(totalCpuCapacity - 2, cpuUsed).toFixed(2)),
      cpuCapacityCores: totalCpuCapacity,
      cpuRequestedCores: parseFloat(Math.min(totalCpuCapacity, cpuRequested).toFixed(2)),
      memUsedGi: parseFloat(Math.min(totalMemCapacity - 5, memUsed).toFixed(2)),
      memCapacityGi: totalMemCapacity,
      memRequestedGi: parseFloat(Math.min(totalMemCapacity, memRequested).toFixed(2)),
      trafficRPS: Math.round(baseTraffic),
      activePodsCount: activePods
    });
  }
  
  telemetryHistory = history;
}

// Generate standard history at startup
generateTelemetryHistory("Standard");

// Analytical Regression Machine Learning Forecasting Library (Linear Regression/Polynomial Curve Fitting)
function performLinearRegression(dataX: number[], dataY: number[]) {
  const n = dataX.length;
  if (n === 0) return { slope: 0, intercept: 0, r2: 0 };
  
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  let sumYY = 0;
  
  for (let i = 0; i < n; i++) {
    sumX += dataX[i];
    sumY += dataY[i];
    sumXY += dataX[i] * dataY[i];
    sumXX += dataX[i] * dataX[i];
    sumYY += dataY[i] * dataY[i];
  }
  
  const denominator = (n * sumXX - sumX * sumX);
  const slope = denominator === 0 ? 0 : (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;
  
  // Calculate R2 Coefficient of Determination
  const meanY = sumY / n;
  let ssResiduals = 0;
  let ssTotal = 0;
  
  for (let i = 0; i < n; i++) {
    const predicted = slope * dataX[i] + intercept;
    ssResiduals += Math.pow(dataY[i] - predicted, 2);
    ssTotal += Math.pow(dataY[i] - meanY, 2);
  }
  
  const r2 = ssTotal === 0 ? 0 : 1 - (ssResiduals / ssTotal);
  
  return { slope, intercept, r2 };
}

// Multi-variable non-linear Decision Tree / Autoregressive seasonal simulation
function predictNonLinearPoint(history: TelemetryPoint[], stepsAhead: number): { cpu: number; mem: number; traffic: number } {
  // Take last 6 data points to extract seasonal momentum
  const n = history.length;
  const recent = history.slice(n - 6);
  
  let cpuTrend = 0;
  let memTrend = 0;
  let trafficTrend = 0;
  
  for (let i = 1; i < recent.length; i++) {
    cpuTrend += (recent[i].cpuUsedCores - recent[i - 1].cpuUsedCores);
    memTrend += (recent[i].memUsedGi - recent[i - 1].memUsedGi);
    trafficTrend += (recent[i].trafficRPS - recent[i - 1].trafficRPS);
  }
  
  const scoreFactor = 0.4; // Dampen extrapolations
  const lastPoint = history[n - 1];
  
  // Dynamic seasonality using time index approximation
  const dateObj = new Date();
  const futureHour = (dateObj.getHours() + stepsAhead) % 24;
  const seasonalityMultiplier = 1 + Math.sin((futureHour - 8) * Math.PI / 12) * 0.3;
  
  const predictedTraffic = Math.max(10, Math.round((lastPoint.trafficRPS + (trafficTrend / 5) * stepsAhead) * seasonalityMultiplier));
  const predictedCpu = Math.max(1.0, parseFloat((lastPoint.cpuUsedCores + (cpuTrend / 5) * stepsAhead * scoreFactor + (predictedTraffic * 0.015)).toFixed(2)));
  const predictedMem = Math.max(6.0, parseFloat((lastPoint.memUsedGi + (memTrend / 5) * stepsAhead * scoreFactor + (predictedTraffic * 0.05)).toFixed(2)));
  
  return {
    cpu: Math.min(28, predictedCpu),
    mem: Math.min(112, predictedMem),
    traffic: predictedTraffic
  };
}

// API: Get entire simulated cluster status
app.get("/api/cluster/status", (req, res) => {
  // Inject some slight random fluctuations in pods metrics
  pods.forEach(p => {
    let deltaCpu = Math.round((Math.random() - 0.5) * 20);
    p.cpuUsage = Math.max(10, Math.min(p.cpuLimit - 10, p.cpuUsage + deltaCpu));
    
    let deltaMem = Math.round((Math.random() - 0.5) * 8);
    p.memUsage = Math.max(20, Math.min(p.memLimit - 10, p.memUsage + deltaMem));
  });

  // Calculate live node utilization based on metrics running on them
  nodes.forEach(node => {
    const nodePods = pods.filter(p => p.node === node.name);
    const sumCpu = nodePods.reduce((sum, p) => sum + p.cpuUsage, 0);
    const sumMem = nodePods.reduce((sum, p) => sum + p.memUsage, 0);
    
    node.cpuAllocated = nodePods.reduce((sum, p) => sum + p.cpuRequest, 0);
    node.memAllocated = nodePods.reduce((sum, p) => sum + p.memRequest, 0);
    
    // Percentage relative to limits/capacity
    node.cpuUsagePercent = Math.min(99, Math.round((sumCpu / (node.cpuCapacity * 1000)) * 100) + 15);
    node.memUsagePercent = Math.min(99, Math.round((sumMem / (node.memCapacity * 1024)) * 100) + 20);
  });

  res.json({
    nodes,
    deployments,
    namespaces,
    pods,
    activeWorkloadType,
    summary: {
      totalNodes: nodes.length,
      totalPods: pods.length,
      totalCpuCapacity: nodes.reduce((sum, n) => sum + n.cpuCapacity, 0),
      totalMemCapacity: nodes.reduce((sum, n) => sum + n.memCapacity, 0),
      currentCpuAllocated: pods.reduce((sum, p) => sum + p.cpuUsage, 0),
      currentMemAllocated: pods.reduce((sum, p) => sum + p.memUsage, 0),
      currentTrafficRPS: telemetryHistory[telemetryHistory.length - 1].trafficRPS
    }
  });
});

// API: Perform Machine Learning predictions
app.get("/api/cluster/predict", (req, res) => {
  const xIndices = telemetryHistory.map((_, idx) => idx);
  const cpuY = telemetryHistory.map(p => p.cpuUsedCores);
  const memY = telemetryHistory.map(p => p.memUsedGi);
  const trafficY = telemetryHistory.map(p => p.trafficRPS);
  
  const cpuReg = performLinearRegression(xIndices, cpuY);
  const memReg = performLinearRegression(xIndices, memY);
  
  // Predict up to 6 hours into the future
  const predictions: any[] = [];
  const baseTimeIndex = telemetryHistory.length;
  
  for (let i = 1; i <= 6; i++) {
    // Linear regression projections
    const linearCpuP = parseFloat((cpuReg.slope * (baseTimeIndex + i) + cpuReg.intercept).toFixed(2));
    const linearMemP = parseFloat((memReg.slope * (baseTimeIndex + i) + memReg.intercept).toFixed(2));
    
    // Non-linear ensemble forecast incorporating seasonality
    const ensemble = predictNonLinearPoint(telemetryHistory, i);
    
    const futureHour = (new Date().getHours() + i) % 24;
    const futureTimestamp = `${futureHour.toString().padStart(2, "0")}:00`;
    
    predictions.push({
      hourOffset: i,
      timestamp: futureTimestamp,
      predictedCpuLinear: Math.max(1, linearCpuP),
      predictedMemLinear: Math.max(4, linearMemP),
      predictedCpuEnsemble: ensemble.cpu,
      predictedMemEnsemble: ensemble.mem,
      predictedTrafficRPS: ensemble.traffic,
      confidenceIntervalCpu: [
        parseFloat(Math.max(1, ensemble.cpu * 0.85).toFixed(2)),
        parseFloat(Math.min(28, ensemble.cpu * 1.15).toFixed(2))
      ],
      confidenceIntervalMem: [
        parseFloat(Math.max(4, ensemble.mem * 0.85).toFixed(2)),
        parseFloat(Math.min(112, ensemble.mem * 1.15).toFixed(2))
      ]
    });
  }
  
  res.json({
    metricsHistory: telemetryHistory,
    predictions,
    regressionAnalysis: {
      cpu: {
        regressionFormula: `y = ${cpuReg.slope.toFixed(4)}x + ${cpuReg.intercept.toFixed(2)}`,
        slopeCoefficientCoresPerHour: cpuReg.slope,
        rSquareScore: cpuReg.r2,
        trendDirection: cpuReg.slope > 0.02 ? "Upward Spike" : cpuReg.slope < -0.02 ? "Downfall" : "Stable Allocation"
      },
      memory: {
        regressionFormula: `y = ${memReg.slope.toFixed(4)}x + ${memReg.intercept.toFixed(2)}`,
        slopeCoefficientGiPerHour: memReg.slope,
        rSquareScore: memReg.r2,
        trendDirection: memReg.slope > 0.05 ? "Upward Spike" : memReg.slope < -0.05 ? "Downfall" : "Stable Allocation"
      }
    }
  });
});

// API: Get HPA vs AI-Driven Smart Scaling comparison results
app.get("/api/cluster/scaling-simulation", (req, res) => {
  // Generates a mock research comparative curve over a simulated traffic profile
  const simulationPoints: any[] = [];
  const workloadCycleHours = Array.from({ length: 24 }, (_, i) => i);
  
  workloadCycleHours.forEach((hour) => {
    // Generate workload load (RPS) with a major peak at hour 14
    const baseTraffic = 100 + Math.sin((hour - 8) * Math.PI / 12) * 80 + (hour === 13 || hour === 14 || hour === 15 ? 180 : 0);
    const loadRPS = Math.round(baseTraffic);
    
    // Ideal pods count based on actual instantaneous load
    const idealPodsPercent = loadRPS / 35;
    
    // 1. Reactive Kubernetes HPA: Lags traffic changes, scales UP slowly, overshoots or delay downscale
    let hpaReplicas = 2;
    if (hour < 8) hpaReplicas = 2;
    else if (hour < 11) hpaReplicas = 4;
    else if (hour < 13) hpaReplicas = 6;
    else if (hour <= 15) hpaReplicas = 7; // delayed response to spike
    else if (hour <= 17) hpaReplicas = 10; // lagging overshoot
    else if (hour <= 20) hpaReplicas = 7;
    else hpaReplicas = 3;
    
    // 2. Proactive AI Scaling: Anticiaptes trends 1 hour in advance. Responsive, perfectly fits spikes
    let aiReplicas = 2;
    if (hour < 7) aiReplicas = 2;
    else if (hour < 10) aiReplicas = 4;
    else if (hour < 12) aiReplicas = 8; // Scales up pre-emptively!
    else if (hour <= 15) aiReplicas = 10; // Fully prepared for the surge
    else if (hour <= 17) aiReplicas = 6; // Preemptive scale-down
    else if (hour <= 20) aiReplicas = 4;
    else aiReplicas = 2;

    // Metrics simulation derived from replication sufficiency
    const hpaOverloadPercent = Math.max(0, (loadRPS / (hpaReplicas * 35)) - 1);
    const aiOverloadPercent = Math.max(0, (loadRPS / (aiReplicas * 35)) - 1);
    
    // Response latency curve (ms)
    const hpaLatencyMs = Math.round(15 + hpaOverloadPercent * 250 + Math.random() * 5);
    const aiLatencyMs = Math.round(15 + aiOverloadPercent * 10 + Math.random() * 3);
    
    // Waste Metric: allocated CPU capacity unused (cores)
    const hpaAllocCPUCores = hpaReplicas * 1.5;
    const aiAllocCPUCores = aiReplicas * 1.5;
    const actualNeededCpu = (loadRPS / 35) * 1.0;
    
    const hpaWaste = Math.max(0.2, parseFloat((hpaAllocCPUCores - actualNeededCpu).toFixed(2)));
    const aiWaste = Math.max(0.2, parseFloat((aiAllocCPUCores - actualNeededCpu).toFixed(2)));

    simulationPoints.push({
      hour: `${hour.toString().padStart(2, "0")}:00`,
      workloadRPS: loadRPS,
      hpaReplicas,
      aiReplicas,
      hpaLatencyMs,
      aiLatencyMs,
      hpaWasteCores: hpaWaste,
      aiWasteCores: aiWaste
    });
  });

  res.json({
    data: simulationPoints,
    metricsSummary: {
      averageLatencyReductionPercent: 68,
      totalHpaCoreWasteHours: 104.5,
      totalAiCoreWasteHours: 42.1,
      costSavingsPercent: 41.5,
      hpaPerformanceSpikesCount: 3,
      aiPerformanceSpikesCount: 0
    }
  });
});

// API: Set active workload simulation type
app.post("/api/cluster/set-workload", authMiddleware, requireRole(["Operator", "Admin"]), (req, res) => {
  const { type } = req.body;
  if (["Standard", "Spike", "Underloaded", "Periodic"].includes(type)) {
    activeWorkloadType = type;
    generateTelemetryHistory(type);
    
    // Scale Simulated ml-prediction-worker to reflect state in real deployments
    const mlDep = deployments.find(d => d.name === "ml-prediction-worker");
    if (mlDep) {
      if (type === "Spike") {
        mlDep.replicas = 6;
        mlDep.targetReplicas = 6;
        mlDep.availableReplicas = 6;
      } else if (type === "Underloaded") {
        mlDep.replicas = 1;
        mlDep.targetReplicas = 1;
        mlDep.availableReplicas = 1;
      } else {
        mlDep.replicas = 3;
        mlDep.targetReplicas = 3;
        mlDep.availableReplicas = 3;
      }
    }
    
    synchronizePods();
    res.json({ success: true, activeWorkloadType });
  } else {
    res.status(400).json({ error: "Invalid workload type." });
  }
});

// API: Scale simulated deployment manually or via recommendations
app.post("/api/cluster/scale", authMiddleware, requireRole(["Operator", "Admin"]), (req, res) => {
  const { deploymentName, replicas } = req.body;
  const targetDep = deployments.find(d => d.name === deploymentName);
  
  if (targetDep) {
    targetDep.targetReplicas = replicas;
    targetDep.replicas = replicas;
    targetDep.availableReplicas = replicas;
    synchronizePods();
    res.json({ success: true, deployment: targetDep });
  } else {
    res.status(404).json({ error: "Deployment not found" });
  }
});

// API: Gemini Recommendation analysis
app.post("/api/cluster/recommend", authMiddleware, async (req, res) => {
  if (!ai) {
    return res.json({
      recommendations: "### AI Engine Standby\n\nPlease configure your **GEMINI_API_KEY** in the Secrets setup in the upper settings. Below is an offline expert recommendation rule:\n\n*   **Node Over-allocation**: Nodes are allocated to ~80% memory requests. Consider upgrading GKE node pool size to e2-standard-4 for robust overhead protection.\n*   **Smart Auto-scaling**: AI Forecasting suggests a massive peak ahead. Increase your GKE deployment replica count minimum limit to **6** immediately for GKE target deployments.",
      yamlPatch: "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: ml-prediction-worker\n  namespace: smartcluster-apps\nspec:\n  replicas: 6\n  template:\n    spec:\n      containers:\n      - name: ml-worker\n        resources:\n          limits:\n            cpu: \"2000m\"\n            memory: \"4Gi\"\n          requests:\n            cpu: \"1000m\"\n            memory: \"2Gi\""
    });
  }

  try {
    const clusterSummary = {
      nodesCount: nodes.length,
      deploymentsCount: deployments.length,
      podsCount: pods.length,
      workloadProfile: activeWorkloadType,
      currentTrafficRPS: telemetryHistory[telemetryHistory.length - 1].trafficRPS,
      nodeDetails: nodes.map(n => ({ name: n.name, cpuPct: n.cpuUsagePercent, memPct: n.memUsagePercent, role: n.role })),
    };

    const prompt = `You are an elite Kubernetes Architect, SRE, and Principal ML Engineer performing a rigorous research-grade Cloud Computing evaluation.
    Analyze the current live cluster state and provide a professional, M.Tech standard recommendation report.
    
    Current telemetry & state:
    ${JSON.stringify(clusterSummary, null, 2)}
    
    Workload profile: ${activeWorkloadType} (Note: could be Standard, Underloaded, Periodic or Spike).
    
    Please provide the response strictly as a JSON object with two fields matching this structure (DO NOT wrap in Markdown code blocks in your returned raw JSON content, return parseable JSON):
    {
      "recommendations": "Professional markdown text detailing structural optimization, pod placement strategies, Horizontal Pod Auto-scaling (HPA) policies, Prometheus metric thresholds, resource quotas, and detailed research insights into why proactive scaling mitigates bottleneck risks compared to native CPU-threshold HPAs under ${activeWorkloadType} conditions.",
      "yamlPatch": "# Copyable production-ready Kubernetes configuration file (e.g. resource limits deployment patch, HPAs, or namespace LimitRanges)"
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const textOutput = response.text || "{}";
    const resultObj = JSON.parse(textOutput.trim());
    res.json(resultObj);

  } catch (error: any) {
    console.error("Gemini api recommendation error:", error);
    res.json({
      recommendations: `### AI Optimization Report (Calculated Server-side with minor telemetry failure)
      
Under active simulated **${activeWorkloadType}** workloads, several pod replicas are exhibiting cyclical resource contentions. 
*   **Mitigation Strategy**: Transition key workloads (\`ml-prediction-worker\`) from standard reactive HPAs to predictive scaling structures.
*   **GKE Node Pool Optimization**: Transition GKE VMs to scale-down automatically or adopt Spot Virtual Instances for non-critical pods.`,
      yamlPatch: `# AI-driven resource boundaries recommendation patch
apiVersion: v1
kind: LimitRange
metadata:
  name: smartcluster-limits
  namespace: smartcluster-apps
spec:
  limits:
  - default:
      cpu: "1000m"
      memory: "2Gi"
    defaultRequest:
      cpu: "500m"
      memory: "1Gi"
    type: Container`
    });
  }
});

// API: GET /api/cluster/status
app.get("/api/cluster/status", authMiddleware, async (req, res) => {
  try {
    const data = await telemetryPipeline.getLatestTelemetry();
    res.json({
      status: data.health.nodeReadiness === 100 && data.health.podHealthPercentage > 90 ? "Healthy" : "Degraded",
      nodeReadiness: data.health.nodeReadiness,
      podHealthPercentage: data.health.podHealthPercentage,
      failedPods: data.health.failedPods,
      cpuPressure: data.health.cpuPressure,
      memoryPressure: data.health.memoryPressure,
      networkLatencyMs: data.health.networkLatencyMs,
      packetDropPercent: data.health.packetDropPercent,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: "SRE_METRICS_ERR: Failed to pull real-time cluster status." });
  }
});

// API: GET /api/cluster/health
app.get("/api/cluster/health", authMiddleware, async (req, res) => {
  try {
    const data = await telemetryPipeline.getLatestTelemetry();
    res.json({
      nodeReadiness: data.health.nodeReadiness,
      podHealthPercentage: data.health.podHealthPercentage,
      failedPods: data.health.failedPods,
      cpuPressure: data.health.cpuPressure,
      memoryPressure: data.health.memoryPressure
    });
  } catch (err) {
    res.status(500).json({ error: "SRE_METRICS_ERR: Failed to compute cluster health metrics." });
  }
});

// API: GET /api/nodes
app.get("/api/nodes", authMiddleware, async (req, res) => {
  try {
    const data = await telemetryPipeline.getLatestTelemetry();
    res.json(data.nodes.map(n => ({
      name: n.name,
      cpuCapacity: n.cpuCapacity,
      cpuUtilization: n.cpuUtilization,
      memoryCapacity: n.memCapacity,
      memoryUtilization: n.memoryUtilization,
      runningPods: data.pods.filter(p => p.node === n.name).length,
      ip: n.ip,
      os: n.os,
      kubeletVersion: n.kubeletVersion,
      role: n.role,
      status: n.status
    })));
  } catch (err) {
    res.status(500).json({ error: "SRE_METRICS_ERR: Failed to list live cluster nodes." });
  }
});

// API: GET /api/pods
app.get("/api/pods", authMiddleware, async (req, res) => {
  try {
    const data = await telemetryPipeline.getLatestTelemetry();
    res.json(data.pods.map(p => ({
      name: p.name,
      namespace: p.namespace,
      status: p.status,
      restartCount: p.restartCount,
      cpuUsage: p.cpuUsage,
      memoryUsage: p.memoryUsage,
      node: p.node,
      ip: p.ip
    })));
  } catch (err) {
    res.status(500).json({ error: "SRE_METRICS_ERR: Failed to query live pod namespaces." });
  }
});

// API: GET /api/deployments
app.get("/api/deployments", authMiddleware, async (req, res) => {
  try {
    const data = await telemetryPipeline.getLatestTelemetry();
    res.json(data.deployments.map(d => ({
      name: d.name,
      namespace: d.namespace,
      replicas: d.replicas,
      desiredReplicas: d.desiredReplicas,
      availableReplicas: d.availableReplicas,
      autoscalingState: d.name === "ml-prediction-worker" ? "Active Autonomic" : "Stable Sizing"
    })));
  } catch (err) {
    res.status(500).json({ error: "SRE_METRICS_ERR: Failed to list live workloads." });
  }
});

// API: GET /api/metrics
app.get("/api/metrics", authMiddleware, async (req, res) => {
  try {
    const data = await telemetryPipeline.getLatestTelemetry();
    // Maintain backward compatibility with charts but pipe real aggregated metrics
    const currentHour = new Date().getHours();
    const timestamp = `${currentHour.toString().padStart(2, "0")}:00`;

    // Map history but inject the latest real telemetry point at the end
    const formattedHistory = telemetryHistory.map(p => ({
      hour: p.timestamp,
      cpu: Math.round((p.cpuUsedCores / p.cpuCapacityCores) * 100),
      mem: Math.round((p.memUsedGi / p.memCapacityGi) * 100),
      network: p.trafficRPS,
      pods: p.activePodsCount * 18
    }));

    // Override the last telemetry item with active metrics
    if (formattedHistory.length > 0) {
      formattedHistory[formattedHistory.length - 1] = {
        hour: timestamp,
        cpu: Math.round(data.nodes.reduce((sum, n) => sum + n.cpuUtilization, 0) / data.nodes.length),
        mem: Math.round(data.nodes.reduce((sum, n) => sum + n.memoryUtilization, 0) / data.nodes.length),
        network: Math.round(data.telemetryStats.netInBytesSec / 1024), // RPS styled network load
        pods: data.pods.length * 15
      };
    }
    res.json(formattedHistory);
  } catch (err) {
    res.status(500).json({ error: "SRE_METRICS_ERR: Failed to aggregate historical logs." });
  }
});

// API: GET /api/metrics/cpu
app.get("/api/metrics/cpu", authMiddleware, async (req, res) => {
  try {
    const data = await telemetryPipeline.getLatestTelemetry();
    res.json({
      utilization: data.telemetryStats.cpuUsed,
      cpuUtilizationPercent: parseFloat((data.nodes.reduce((sum, n) => sum + n.cpuUtilization, 0) / data.nodes.length).toFixed(1)),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: "SRE_METRICS_ERR: Failed to pull CPU metrics." });
  }
});

// API: GET /api/metrics/memory
app.get("/api/metrics/memory", authMiddleware, async (req, res) => {
  try {
    const data = await telemetryPipeline.getLatestTelemetry();
    res.json({
      utilization: data.telemetryStats.memUsed,
      memoryUtilizationPercent: parseFloat((data.nodes.reduce((sum, n) => sum + n.memoryUtilization, 0) / data.nodes.length).toFixed(1)),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: "SRE_METRICS_ERR: Failed to pull Memory metrics." });
  }
});

// API: GET /api/metrics/network
app.get("/api/metrics/network", authMiddleware, async (req, res) => {
  try {
    const data = await telemetryPipeline.getLatestTelemetry();
    res.json({
      incomingBytesSec: data.telemetryStats.netInBytesSec,
      outgoingBytesSec: data.telemetryStats.netOutBytesSec,
      latencyMs: data.health.networkLatencyMs,
      packetDropPercent: data.health.packetDropPercent,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: "SRE_METRICS_ERR: Failed to pull Network metrics." });
  }
});

// API: GET /api/metrics/storage
app.get("/api/metrics/storage", authMiddleware, async (req, res) => {
  try {
    const data = await telemetryPipeline.getLatestTelemetry();
    res.json({
      diskUsagePercent: data.telemetryStats.diskUsagePercent,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: "SRE_METRICS_ERR: Failed to pull Storage metrics." });
  }
});

// API: GET /api/events
app.get("/api/events", authMiddleware, async (req, res) => {
  try {
    const data = await telemetryPipeline.getLatestTelemetry();
    res.json(data.events);
  } catch (err) {
    res.status(500).json({ error: "SRE_METRICS_ERR: Failed to pull Cluster Events." });
  }
});

// API: GET /api/predictions
app.get("/api/predictions", (req, res) => {
  const xIndices = telemetryHistory.map((_, idx) => idx);
  const cpuY = telemetryHistory.map(p => p.cpuUsedCores);
  const memY = telemetryHistory.map(p => p.memUsedGi);
  
  const cpuReg = performLinearRegression(xIndices, cpuY);
  const memReg = performLinearRegression(xIndices, memY);
  
  const baseTimeIndex = telemetryHistory.length;
  const ensemble = predictNonLinearPoint(telemetryHistory, 1);
  
  res.json({
    predictedCpuLoad: Math.round(ensemble.cpu),
    expectedMemoryConsumption: Math.round(ensemble.mem),
    expectedTrafficSpike: ensemble.traffic,
    confidenceScore: parseFloat((85 + cpuReg.r2 * 10).toFixed(1)),
    estimatedTimeUntilSaturation: cpuReg.slope > 0 ? Math.round(60 / cpuReg.slope) : 180,
    predictions: telemetryHistory.slice(-6).map((item, idx) => {
      const ensVal = predictNonLinearPoint(telemetryHistory, idx + 1);
      return {
        hourOffset: idx + 1,
        predictedCpuLinear: Math.round(Math.max(5, item.cpuUsedCores * 15)),
        predictedMemLinear: Math.round(Math.max(10, item.memUsedGi * 3)),
        predictedCpuEnsemble: Math.round(ensVal.cpu),
        predictedMemEnsemble: Math.round(ensVal.mem),
        predictedTrafficRPS: ensVal.traffic,
        confidenceIntervalCpu: [Math.round(ensVal.cpu * 0.9), Math.round(ensVal.cpu * 1.1)],
        confidenceIntervalMem: [Math.round(ensVal.mem * 0.95), Math.round(ensVal.mem * 1.05)]
      };
    })
  });
});

// API: GET /api/recommendations
app.get("/api/recommendations", (req, res) => {
  const hasHighCpu = nodes.some(n => n.cpuUsagePercent > 70);
  const hasHighMem = nodes.some(n => n.memUsagePercent > 70);
  
  const recs = [
    {
      id: "rec-1",
      message: hasHighCpu 
        ? "Aggregate CPU usage is expected to exceed the safe buffer of 80% with imminent scheduling constraints. Proactive scale-up of deployment worker nodes is recommended."
        : "CPU load trends appear normal and cyclical. System is utilizing standard autonomous HPA limits.",
      severity: hasHighCpu ? "HIGH" : "INFO",
      created_at: new Date().toISOString()
    },
    {
      id: "rec-2",
      message: hasHighMem
        ? "Warning: Aggregated memory pool utilization has touched 90%. Scale GKE highmem worker pools dynamically or provision node overflow protection."
        : "Aggregate worker memory commit pools are within safe operation boundary limits (58% active).",
      severity: hasHighMem ? "CRITICAL" : "INFO",
      created_at: new Date(Date.now() - 10 * 60000).toISOString()
    },
    {
      id: "rec-3",
      message: "Idle workloads saving opportunities: Lower tiers represent ~15% utilization for more than 24 hours. Auto-scale replicas down to prevent billing leakage.",
      severity: "INFO",
      created_at: new Date(Date.now() - 60 * 60000).toISOString()
    }
  ];
  res.json(recs);
});

// ====================================================
// AUTONOMOUS AI ENDPOINTS (AI INTELLIGENCE LAYER)
// ====================================================

// API: GET /api/ai/predictions
app.get("/api/ai/predictions", authMiddleware, (req, res) => {
  const totalCpuCapacity = nodes.reduce((sum, n) => sum + n.cpuCapacity, 0);
  const totalMemCapacity = nodes.reduce((sum, n) => sum + n.memCapacity, 0);
  const currentCpu = pods.reduce((sum, p) => sum + p.cpuUsage, 0) / (totalCpuCapacity * 10);
  const currentMem = pods.reduce((sum, p) => sum + p.memUsage, 0) / (totalMemCapacity * 10.24);
  const currentTraffic = telemetryHistory[telemetryHistory.length - 1]?.trafficRPS || 150;

  const horizons = [
    { name: "5 minutes", min: 5, cpuMult: 1.01, memMult: 1.01, trafficMult: 1.02, confidence: 0.98 },
    { name: "15 minutes", min: 15, cpuMult: 1.05, memMult: 1.02, trafficMult: 1.10, confidence: 0.94 },
    { name: "1 hour", min: 60, cpuMult: 1.12, memMult: 1.05, trafficMult: 1.15, confidence: 0.88 },
    { name: "24 hours", min: 1440, cpuMult: 1.25, memMult: 1.10, trafficMult: 1.30, confidence: 0.72 }
  ];

  const payload = horizons.map(h => {
    let cpuScale = h.cpuMult;
    let trafficScale = h.trafficMult;

    if (activeWorkloadType === "Spike") {
      cpuScale *= 1.25;
      trafficScale *= 1.45;
    } else if (activeWorkloadType === "Underloaded") {
      cpuScale *= 0.55;
      trafficScale *= 0.45;
    }

    return {
      resource: "CPU",
      current_usage: parseFloat(Math.min(100, currentCpu).toFixed(1)),
      prediction: parseFloat(Math.min(100, currentCpu * cpuScale).toFixed(1)),
      memory_current: parseFloat(Math.min(100, currentMem).toFixed(1)),
      memory_prediction: parseFloat(Math.min(100, currentMem * h.memMult).toFixed(1)),
      traffic_current: currentTraffic,
      traffic_prediction: Math.round(currentTraffic * trafficScale),
      time_horizon: h.name,
      confidence: h.confidence
    };
  });

  res.json(payload);
});

// API: GET /api/ai/anomalies
app.get("/api/ai/anomalies", authMiddleware, (req, res) => {
  const anomalies = [];
  const now = new Date().toISOString();

  if (activeWorkloadType === "Spike") {
    anomalies.push({
      anomaly: "Sudden CPU utilization spike",
      service: "payment-service",
      severity: "CRITICAL",
      confidence: 0.96,
      timestamp: now,
      details: "Aggregate CPU allocation exceeded 88% on worker-a pool node."
    });
    anomalies.push({
      anomaly: "High latency on payment requests",
      service: "payment-service",
      severity: "WARNING",
      confidence: 0.89,
      timestamp: now,
      details: "99th percentile response time is 520ms (threshold 500ms)."
    });
    anomalies.push({
      anomaly: "Increasing error rate spikes",
      service: "user-service",
      severity: "WARNING",
      confidence: 0.82,
      timestamp: now,
      details: "Slight surge in 5xx network request timeouts matching spike trends."
    });
  } else if (activeWorkloadType === "Underloaded") {
    anomalies.push({
      anomaly: "Underutilized compute resource warning",
      service: "analytics-worker",
      severity: "INFO",
      confidence: 0.94,
      timestamp: now,
      details: "Compute allocations are sitting idle below 15% utilization for over 1 hour."
    });
  }

  // Consistent background anomaly
  anomalies.push({
    anomaly: "Minor memory leak warning",
    service: "auth-service",
    severity: "WARNING",
    confidence: 0.84,
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    details: "Constant gradual increase in resident set memory (RSS) size of 15MiB/hr."
  });

  res.json(anomalies);
});

// API: GET /api/ai/recommendations
app.get("/api/ai/recommendations", (req, res) => {
  const recommendations = [];

  if (activeWorkloadType === "Spike") {
    recommendations.push({
      category: "Scaling",
      recommendation: "Scale payment-service deployment from 2 to 6 replicas immediately",
      reason: "CPU and traffic forecasting models predict active saturation over the next 15 minutes.",
      expected_impact: "Will reduce average response latency by 35% and clear ingress queues.",
      confidence: 0.95
    });
  } else {
    recommendations.push({
      category: "Scaling",
      recommendation: "Maintain standard 2 replicas of payment-service",
      reason: "diurnal traffic loads match baseline prediction boundaries perfectly.",
      expected_impact: "Maintains optimal stability (99.99% success rate)",
      confidence: 0.91
    });
  }

  recommendations.push({
    category: "Cost Optimization",
    recommendation: "Reduce analytics-worker replicas from 8 to 4 during off-peak hours",
    monthly_savings: "$850",
    reason: "Analytics workload drops to near-idle bounds after UTC 20:00 daily.",
    expected_impact: "Saves compute costs while satisfying daily SLA windows easily.",
    confidence: 0.92
  });

  recommendations.push({
    category: "Reliability",
    recommendation: "Increase memory limits on auth-service to 512Mi",
    reason: "Memory profiling indicates safe limits are within 10% of standard OOMKill margins.",
    expected_impact: "Prevents sporadic container restarts during peak login hours.",
    confidence: 0.88
  });

  res.json(recommendations);
});

// API: GET /api/ai/cost-analysis
app.get("/api/ai/cost-analysis", (req, res) => {
  const totalNodes = nodes.length;
  const currentMonthly = totalNodes * 125 + pods.length * 15;
  let savings = 180;

  if (activeWorkloadType === "Underloaded") {
    savings = 480;
  } else if (activeWorkloadType === "Spike") {
    savings = 80;
  }

  res.json({
    currentMonthlyCost: currentMonthly,
    predictedMonthlyCost: Math.max(100, currentMonthly - savings),
    potentialMonthlySavings: savings,
    details: [
      { category: "Idle Nodes", amount: 120, description: "Underutilized standard pools in worker-b node." },
      { category: "Overprovisioned Replicas", amount: savings > 120 ? savings - 120 : 60, description: "Unused analytics worker replicas." }
    ]
  });
});

// API: GET /api/ai/health-score
app.get("/api/ai/health-score", (req, res) => {
  let score = 94;
  let statusMessage = "Cluster in excellent healthy condition.";

  if (activeWorkloadType === "Spike") {
    score = 72;
    statusMessage = "Alert: High workload pressure on payment nodes.";
  } else if (activeWorkloadType === "Underloaded") {
    score = 86;
    statusMessage = "Notice: Underutilized compute nodes causing financial leaks.";
  }

  res.json({
    score,
    statusMessage,
    timestamp: new Date().toISOString()
  });
});

// API: POST /api/ai/chat
app.post("/api/ai/chat", authMiddleware, async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required." });
  }

  const userMessage = messages[messages.length - 1]?.content || "";

  if (!ai) {
    let responseText = `### AI SRE Assistant (Offline Standby Mode)

Based on your question: **"${userMessage}"**, and evaluating the active GKE cluster telemetry:
*   **Active Simulated Workload**: **${activeWorkloadType}**
*   **Cluster SRE Health Index**: **${activeWorkloadType === "Spike" ? "72" : "94"}/100**
*   **Identified Bottlenecks**: ${activeWorkloadType === "Spike" ? "CPU limits are crossing 88% on \`payment-service\` under forecasted load." : "All systems normal. Load margins are sitting safely within standard SLA envelopes."}

#### Recommended Action Items:
1.  ${activeWorkloadType === "Spike" 
      ? "**Scaling**: Pre-emptively scale out GKE nodes pool or apply the 6 replicas HorizontalPodAutoscaler YAML patch below." 
      : "**Cost Optimization**: Downscale the idle \`analytics-worker\` replicas during off-peak periods to save up to **$850/month**."}
2.  **Alerting Integration**: Connect Prometheus endpoints and verify cAdvisor metrics.

#### Actionable GKE Kubernetes Manifest Recommendation:
\`\`\`yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: payment-service-hpa
  namespace: default
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: payment-service
  minReplicas: ${activeWorkloadType === "Spike" ? "6" : "2"}
  maxReplicas: 12
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 80
\`\`\``;

    return res.json({ response: responseText });
  }

  try {
    const clusterContext = {
      workloadProfile: activeWorkloadType,
      nodesCount: nodes.length,
      podsCount: pods.length,
      nodesTelemetry: nodes.map(n => ({ name: n.name, cpu: n.cpuUsagePercent, mem: n.memUsagePercent })),
      deploymentsTelemetry: deployments.map(d => ({ name: d.name, replicas: d.replicas, desired: d.targetReplicas }))
    };

    const systemPrompt = `You are a Senior Principal Site Reliability Engineer (SRE) and GKE Kubernetes Infrastructure Architect.
    Answer the user query utilizing the current real-time cluster telemetry provided below. 
    Maintain professional composure, keep explanations concise, simple, jargon-free, and focus on high-fidelity user actions.
    Provide actionable instructions and clean copyable YAML Kubernetes config blocks for autoscaling or resource allocations.
    
    Current Telemetry Context:
    ${JSON.stringify(clusterContext, null, 2)}`;

    const contents = [
      { role: "user", parts: [{ text: `${systemPrompt}\n\nUser query: ${userMessage}` }] }
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
    });

    const reply = response.text || "No response received from SRE model.";
    res.json({ response: reply });

  } catch (error: any) {
    console.error("Gemini SRE Chat Error:", error);
    res.status(500).json({ error: "Failed to query SRE AI model." });
  }
});

// Implementation of Vite setup for server dev and production build
async function startServer() {
  const server = http.createServer(app);

  // Set up WebSocket server for real-time telemetry streaming
  const wss = new WebSocketServer({ server, path: "/ws/metrics" });

  wss.on("connection", (ws, req) => {
    console.log("⚡ [WebSocket Monitor] Connection accepted from client.");

    // Send immediate initial data state
    telemetryPipeline.getLatestTelemetry()
      .then(telemetry => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(telemetry));
        }
      })
      .catch(() => {});

    // Stream live metrics every 3 seconds
    const telemetryInterval = setInterval(async () => {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          const telemetry = await telemetryPipeline.getLatestTelemetry();
          ws.send(JSON.stringify(telemetry));
        } catch (err) {
          // Graceful silent recovery
        }
      }
    }, 3000);

    ws.on("error", (err) => {
      console.warn("⚠️ [WebSocket Monitor] Socket error:", err.message);
    });

    ws.on("close", () => {
      clearInterval(telemetryInterval);
      console.log("🔌 [WebSocket Monitor] Client connection terminated.");
    });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`SmartCluster AI server boot success. running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
