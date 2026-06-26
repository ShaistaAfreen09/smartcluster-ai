#!/usr/bin/env python
# high-load.py - Mimics heavy scale workloads generating high memory and CPU utilization

import time
import random
import threading
import http.client

GATEWAY_URL = "localhost:80"
DURATION = 300 # run for 5 minutes

print("Starting high-load batch simulation...")
print("Launching concurrency queues targeting API services...")

stop_flag = False

def push_traffic():
    while not stop_flag:
        conn = http.client.HTTPConnection(GATEWAY_URL, timeout=1)
        path = "/api/v1/payment" # resource intensive transaction
        try:
            conn.request("POST", path, body='{"amount": 450.00, "currency": "USD"}', headers={"Content-Type": "application/json"})
            res = conn.getresponse()
            print(f"[High-Load Core Thread] POST {path} - Status: {res.status}")
        except Exception:
            pass
        finally:
            conn.close()
        # High concurrency has minimal sleeps
        time.sleep(random.uniform(0.05, 0.15))

threads = []
for _ in range(8): # 8 concurrent worker loops
    t = threading.Thread(target=push_traffic)
    t.daemon = True
    t.start()
    threads.append(t)

try:
    time.sleep(DURATION)
except KeyboardInterrupt:
    pass
finally:
    stop_flag = True
    print("High-load batch simulation completed. Cleaning threads...")
