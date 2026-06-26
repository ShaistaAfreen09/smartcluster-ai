#!/usr/bin/env python
# spike-test.py - Simulates rapid transient workloads (Flash sales / promotional traffic peaks)

import time
import random
import threading
import http.client

GATEWAY_URL = "localhost:80"

print("========================================")
print("SRE Flash Sale SPIKE-TESTING MODULE INITIATED")
print("========================================")

def send_burst(req_count, sleep_interval):
    print(f"Triggering active burst cluster: sending {req_count} requests rapidly...")
    for _ in range(req_count):
        conn = http.client.HTTPConnection(GATEWAY_URL, timeout=1)
        try:
            # Randomly target endpoints and payments to generate load
            path = random.choice(["/api/v1/payment", "/api/v1/user"])
            conn.request("GET", path)
            res = conn.getresponse()
        except Exception:
            pass
        finally:
            conn.close()
        time.sleep(sleep_interval)

try:
    while True:
        # Step 1: Wait for normal state
        print("Calming period: baseline workload of 5 seconds...")
        time.sleep(5)
        
        # Step 2: Sudden surge
        print("ALERT: FLASH SALE INITIATING NOW - SURGING LOAD")
        threads = []
        for _ in range(15): # Spawn 15 concurrent threads
            t = threading.Thread(target=send_burst, args=(30, 0.01))
            t.start()
            threads.append(t)
            
        for t in threads:
            t.join()
            
        print("ALERT: Flash sale surge wave subsided. Waiting before next spike cycle...")
        time.sleep(15)
except KeyboardInterrupt:
    print("Spike testing simulation successfully terminated.")
