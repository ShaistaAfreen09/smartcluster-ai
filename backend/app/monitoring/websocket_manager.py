from fastapi import WebSocket
from typing import List

class WebSocketManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"WS Monitor Connection established. Total active: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            print(f"WS Monitor Disconnected. Total remaining: {len(self.active_connections)}")

    async def broadcast_json(self, data: dict):
        """
        Stream telemetry payload to all active browser connections.
        """
        disconnected_sockets = []
        for connection in self.active_connections:
            try:
                await connection.send_json(data)
            except Exception as e:
                print(f"Failed to send telemetry on active WS: {e}")
                disconnected_sockets.append(connection)
                
        for socket in disconnected_sockets:
            self.disconnect(socket)
            
websocket_manager = WebSocketManager()
