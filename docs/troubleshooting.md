# SRE Troubleshooting & Debugging Manual

Below are debugging procedures for the operational state of SmartCluster AI clusters when errors surface.

---

## 1. Missing Context / SDK API Connect Failures
**Symptom**: FastAPI server logs show `Kubernetes SDK: Context is unavailable. Operating on simulated cluster telemetry.`
**Remedy**:
1. Check if the active cluster context is loaded inside the shell using `kubectl config get-contexts`.
2. Confirm the user session holds permission scopes:
   ```bash
   kubectl auth can-i get pods --namespace default
   ```
3. In local environments, set the environmental variable `KUBERNETES_MODE=local` to prioritize standard mocks if a connection is not possible.

---

## 2. Prometheus Connection Timeouts
**Symptom**: Dashboard charts stay empty or endpoint `GET /api/metrics/cpu` reports connection failures.
**Remedy**:
1. Ensure the port forwarding maps the internal metrics ports correctly:
   ```bash
   kubectl port-forward svc/prometheus-service 9090:9090 -n monitoring
   ```
2. Verify the server variable resolves correctly:
   ```env
   PROMETHEUS_URL=http://localhost:9090
   ```

---

## 3. Persistent CrashLoopBackOff on Microworkloads
**Symptom**: Pod logs state high CPU limits exceedances or immediate SIGKILL restarts.
**Remedy**:
1. Inspect deployment yaml files in `k8s/deployments/` to increase resource limit budgets:
   ```yaml
   resources:
     requests:
       cpu: "250m"
       memory: "256Mi"
     limits:
       cpu: "1000m"
       memory: "1024Mi"
   ```
2. Re-apply configurations using `kubectl apply -f k8s/deployments/`.
