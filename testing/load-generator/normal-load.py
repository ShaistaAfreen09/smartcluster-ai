#!/usr/bin/env python
# normal-load.py - Simulates normal diurnal production traffic flows against the API gateway

import time
import random
import http.client

GATEWAY_URL = "localhost:80"

print("Starting baseline production traffic simulator...")
print("Targeting Ingress API Gateway at http://" + GATEWAY_URL)

try:
    while True:
        # Generate microservices API endpoints query patterns
        conn = http.client.HTTPConnection(GATEWAY_URL, timeout=2)
        endpoints = ["/", "/api/v1/auth", "/api/v1/payment", "/api/v1/user"]
        path = random.choice(endpoints)
        
        try:
            conn.request("GET", path)
            res = conn.getresponse()
            print(f"[{time.strftime('%H:%M:%S')}] GET {path} - Status: {res.status}")
        except Exception as e:
            print(f"Error querying gateway pathway: {e}")
        finally:
            conn.close()
            
        # Normal production traffic has gentle inter-request sleeps
        time.sleep(random.uniform(0.5, 1.2))
except KeyboardInterrupt:
    print("Normal traffic simulator gracefully terminated.")
