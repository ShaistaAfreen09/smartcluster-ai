# SmartCluster AI - Security Hardening Specification

This specification documents the enterprise-grade security hardening measures implemented across the **SmartCluster AI** control plane.

---

## 1. Cryptographic Authentication & Session Control

### Custom JWT Signature Verification
- Access tokens are cryptographically signed using **HMAC-SHA256** with a secret key (`JWT_SECRET`) loaded dynamically from Kubernetes secrets or environment configuration.
- Any manual altering of header or payload segments immediately breaks signature matching, rejecting unauthorized REST/WebSocket telemetry queries.

### HttpOnly Cookie Isolation
- Access sessions are cached on client browsers using `httpOnly` flags:
  ```typescript
  res.cookie("smartcluster_session", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  });
  ```
- **Security Impact**: Strictly isolates session data from malicious Cross-Site Scripting (XSS) script injections.

---

## 2. Platform Security Headers (OWASP Compliant)

All HTTP responses are decorated with custom security headers:

| Header Name | Configuration Value | Security Objective |
|---|---|---|
| `X-Frame-Options` | `DENY` | Prevents UI clickjacking attacks. |
| `X-Content-Type-Options` | `nosniff` | Rejects MIME type sniffing. |
| `X-XSS-Protection` | `1; mode=block` | Instructs the browser to block active reflection scripts. |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Mandates HTTPS connection transit. |
| `Content-Security-Policy` | Custom rules with restricted source rules | Limits script, font, stylesheet, and socket targets. |

---

## 3. Kubernetes Isolation & Least Privilege Rules

### Pod Security Contexts
Frontend and backend pod configurations run with restricted privileges under standard Kubernetes security profiles:
- `allowPrivilegeEscalation: false`: Ensures subprocesses cannot inherit root permissions.
- `runAsNonRoot: true`: Forcefully fails deployment if container process attempts root operations.
- `runAsUser`: Explicitly maps to safe system IDs (e.g. `8888` for Python backend, `101` for Nginx frontend).

---

## 4. Role-Based Access Control (RBAC) Guardrails

Three distinct clearance roles govern cluster capabilities:

1. **Admin**: full operations, permission modifications, cluster auto-tuning, and prediction model retraining.
2. **Operator**: allows resource resizing and workload target edits, but prevents role adjustments.
3. **Viewer**: read-only dashboard visibility, charts, and general GKE events logs.
