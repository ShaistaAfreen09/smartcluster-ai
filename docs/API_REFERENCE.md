# SmartCluster AI - Core API Reference

The SmartCluster SRE Control Plane serves structured data to the dashboard and monitoring clients over HTTP/HTTPS, and real-time streaming payloads over WebSocket protocols.

---

## 1. Authentication Endpoints

### Get Google OAuth / Sandbox Login URL
- **Endpoint**: `GET /api/auth/google/url`
- **Response**:
  ```json
  {
    "url": "https://accounts.google.com/o/oauth2/v2/auth?..."
  }
  ```

### Terminate Session
- **Endpoint**: `POST /api/auth/logout`
- **Response**:
  ```json
  {
    "success": true
  }
  ```

### Get Current Session Profile
- **Endpoint**: `GET /api/users/me`
- **Headers**: `Authorization: Bearer <JWT>` or `Cookie: smartcluster_session=<JWT>`
- **Response**:
  ```json
  {
    "uid": 12,
    "email": "alex.mercer@smartcluster.ai",
    "displayName": "Alex Mercer",
    "photoURL": "https://...",
    "workspaceRole": "Admin"
  }
  ```

---

## 2. Cluster Telemetry Endpoints

### Get Cluster Status
- **Endpoint**: `GET /api/cluster/status`
- **Headers**: Required Authentication
- **Response**:
  ```json
  {
    "status": "Healthy",
    "nodeReadiness": 100,
    "podHealthPercentage": 100,
    "failedPods": 0,
    "cpuPressure": false,
    "memoryPressure": false,
    "networkLatencyMs": 1.4,
    "packetDropPercent": 0,
    "timestamp": "2026-06-24T14:20:00Z"
  }
  ```

### List Nodes
- **Endpoint**: `GET /api/nodes`
- **Response**:
  ```json
  [
    {
      "name": "gke-smartcluster-pool-1-worker-a",
      "cpuCapacity": 8,
      "cpuUtilization": 68,
      "memoryCapacity": 32,
      "memoryUtilization": 52,
      "runningPods": 4,
      "ip": "10.128.0.10",
      "os": "COS-109-17800.147.22",
      "role": "worker",
      "status": "Ready"
    }
  ]
  ```

### List Active Pods
- **Endpoint**: `GET /api/pods`
- **Response**:
  ```json
  [
    {
      "name": "api-gateway-7f55b99db9-9xrcn",
      "namespace": "default",
      "status": "Running",
      "restartCount": 0,
      "cpuUsage": 120,
      "memoryUsage": 145,
      "node": "gke-smartcluster-pool-1-worker-a",
      "ip": "10.120.1.15"
    }
  ]
  ```

---

## 3. Root Level Observability & Health

### Standard Health Endpoint
- **Endpoint**: `GET /health`
- **Response**:
  ```json
  {
    "status": "UP",
    "uptimeSeconds": 1452.1,
    "timestamp": "2026-06-24T14:23:00Z",
    "services": {
      "database": "CONNECTED",
      "telemetryPipeline": "ACTIVE"
    }
  }
  ```

### Prometheus Metrics Exposition
- **Endpoint**: `GET /metrics`
- **Response Content-Type**: `text/plain; version=0.0.4; charset=utf-8`
- **Response**:
  ```text
  # HELP smartcluster_uptime_seconds System process uptime in seconds
  # TYPE smartcluster_uptime_seconds gauge
  smartcluster_uptime_seconds 1452.1
  ...
  ```

---

## 4. WebSocket Streaming Protocol

- **Endpoint**: `WS /ws/metrics`
- **Description**: Establishes a TCP streaming connection that emits the entire active GKE cluster state every 3 seconds to avoid polling overhead.
- **Payload Schema**:
  ```json
  {
    "health": {
      "nodeReadiness": 100,
      "podHealthPercentage": 98.4,
      "failedPods": 0,
      "cpuPressure": false,
      "memoryPressure": false,
      "networkLatencyMs": 1.2,
      "packetDropPercent": 0
    },
    "nodes": [...],
    "pods": [...],
    "deployments": [...],
    "events": [...]
  }
  ```
