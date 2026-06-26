export type WebSocketMessageListener = (data: any) => void;

export class TelemetryWebSocketClient {
  private url: string;
  private ws: WebSocket | null = null;
  private listeners: Set<WebSocketMessageListener> = new Set();
  private reconnectTimeout: any = null;
  private connectionStatusListeners: Set<(connected: boolean) => void> = new Set();
  private isConnecting = false;

  constructor() {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    this.url = `${protocol}//${host}/ws/metrics`;
  }

  public connect() {
    if (this.ws || this.isConnecting) return;
    this.isConnecting = true;

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.isConnecting = false;
        this.notifyStatus(true);
        console.log("⚡ [Telemetry WebSocket] Stream established.");
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.notifyListeners(data);
        } catch (err) {
          console.warn("⚠️ [Telemetry WebSocket] Failed parsing incoming payload:", err);
        }
      };

      this.ws.onclose = () => {
        this.ws = null;
        this.isConnecting = false;
        this.notifyStatus(false);
        console.log("🔌 [Telemetry WebSocket] Connection terminated. Scheduling reconnect...");
        this.scheduleReconnect();
      };

      this.ws.onerror = (err) => {
        console.error("❌ [Telemetry WebSocket] Socket error occurred:", err);
        if (this.ws) {
          this.ws.close();
        }
      };
    } catch (e) {
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  public disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  public addListener(listener: WebSocketMessageListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public removeListener(listener: WebSocketMessageListener) {
    this.listeners.delete(listener);
  }

  public onStatusChange(callback: (connected: boolean) => void) {
    this.connectionStatusListeners.add(callback);
    return () => this.connectionStatusListeners.delete(callback);
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) return;
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect();
    }, 5000); // Attempt reconnection every 5 seconds
  }

  private notifyListeners(data: any) {
    this.listeners.forEach((listener) => {
      try {
        listener(data);
      } catch (err) {
        console.error(err);
      }
    });
  }

  private notifyStatus(connected: boolean) {
    this.connectionStatusListeners.forEach((callback) => {
      try {
        callback(connected);
      } catch (err) {
        console.error(err);
      }
    });
  }
}

export const telemetryWS = new TelemetryWebSocketClient();
