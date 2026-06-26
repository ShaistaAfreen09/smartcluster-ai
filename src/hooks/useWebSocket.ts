import { useEffect, useState } from "react";
import { telemetryWS } from "../services/websocket";

export function useWebSocket<T = any>() {
  const [connected, setConnected] = useState(false);
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    // Connect to WebSocket stream
    telemetryWS.connect();

    const handleData = (payload: any) => {
      setData(payload);
    };

    const handleStatus = (isConnected: boolean) => {
      setConnected(isConnected);
    };

    const unsubscribeMessage = telemetryWS.addListener(handleData);
    const unsubscribeStatus = telemetryWS.onStatusChange(handleStatus);

    return () => {
      unsubscribeMessage();
      unsubscribeStatus();
    };
  }, []);

  return { connected, data };
}
