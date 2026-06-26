import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

async function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function seedDatabase() {
  if (!DATABASE_URL) {
    console.error("❌ DATABASE_URL is unconfigured. Skipping seed execution.");
    process.exit(1);
  }

  console.log("🚀 Initializing SRE Production Seed script...");
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes("localhost") || DATABASE_URL.includes("127.0.0.1")
      ? false
      : { rejectUnauthorized: false }
  });

  let client;
  let retries = 5;

  while (retries > 0) {
    try {
      client = await pool.connect();
      console.log("⚡ Successfully established database connection for seeding.");
      break;
    } catch (err) {
      retries--;
      console.warn(`⚠️ Connection failed. Retries remaining: ${retries}. Retrying in 3s...`);
      await wait(3000);
    }
  }

  if (!client) {
    console.error("❌ Failed to connect to the database after 5 attempts. Exiting.");
    process.exit(1);
  }

  try {
    // 1. Seed Production Clusters
    console.log("🌱 Seeding monitoring_clusters...");
    await client.query(`
      INSERT INTO monitoring_clusters (name, provider, region)
      VALUES 
        ('gke-smartcluster-pool-1', 'GCP / GKE', 'us-central1-a'),
        ('gke-smartcluster-pool-2-edge', 'GCP / GKE', 'asia-east1-b'),
        ('gke-smartcluster-pool-3-billing', 'GCP / GKE', 'europe-west3-a')
      ON CONFLICT (name) DO NOTHING;
    `);

    // 2. Seed Node Metrics Trend
    console.log("🌱 Seeding historical node_metrics...");
    const nodes = [
      "gke-smartcluster-pool-1-control",
      "gke-smartcluster-pool-1-worker-a",
      "gke-smartcluster-pool-2-highmem-b"
    ];

    for (const node of nodes) {
      for (let i = 24; i >= 0; i--) {
        const timeOffset = new Date(Date.now() - i * 60 * 60 * 1000);
        const cpu = 30 + Math.random() * 40;
        const memory = 40 + Math.random() * 30;
        await client.query(`
          INSERT INTO node_metrics (node_name, cpu_usage, memory_usage, timestamp)
          VALUES ($1, $2, $3, $4)
        `, [node, cpu, memory, timeOffset]);
      }
    }

    // 3. Seed Default System Users
    console.log("🌱 Seeding default SRE user profiles...");
    await client.query(`
      INSERT INTO users (google_id, name, email, profile_picture, role, preferences)
      VALUES 
        ('google-mock-alex-mercer', 'Alex Mercer', 'alex.mercer@smartcluster.ai', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200', 'Admin', '{"theme": "dark", "notifications": true, "dashboardLayout": "compact"}'),
        ('google-mock-sre-viewer', 'SRE Operator Lead', 'sre.operator@smartcluster.ai', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200', 'Operator', '{"theme": "dark", "notifications": false, "dashboardLayout": "standard"}')
      ON CONFLICT (google_id) DO NOTHING;
    `);

    console.log("✅ [Seed Engine] Production seeding finalized successfully.");
  } catch (err) {
    console.error("❌ Database seeding error occurred:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

seedDatabase();
