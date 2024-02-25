import { useCallback, useEffect, useState } from "react"

// Custom hook that manages a user's WebSocket throughout their entire session
const useWebSocket = (url: string, {
  onMessage,
}) => {

  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isWebSocketOpen, setIsWebSocketOpen] = useState(false);

  useEffect(() => {

    // Always close current connection before attempting to open new one
    if (isWebSocketOpen) {
      setIsWebSocketOpen(false);
      socket?.close();
    }

    // Not a proper lobby url, don't try and establish connection
    if (!url) {
      console.log("No lobby found to connect to");
      return;
    }

    let webSocket: WebSocket;
    try {
      webSocket = new WebSocket(url);
      setIsWebSocketOpen(true)
    } catch (err) {
      console.log("WebSocket failed to establish connection");
      return;
    }

    webSocket.onmessage = onMessage;

    webSocket.onclose = (ev: CloseEvent) => {
      if (ev.wasClean) {
        console.log("WebSocket closed: cleanly");
      } else {
        console.log("WebSocket closed: abruptly");
      }
      setIsWebSocketOpen(false);
    }

    webSocket.onopen = () => {
      setIsWebSocketOpen(true);
      console.log("WebSocket has opened.")
    }

    setSocket(webSocket);

    return () => {
      if (socket) {
        socket.close();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  const webSocketSend = useCallback((message: string) => {
    if (socket && isWebSocketOpen) {
      socket.send(message);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  return { webSocketSend, isWebSocketOpen };
}

export default useWebSocket;
