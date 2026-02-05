import React, { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { SocketContext } from "./SocketContext";

export interface SocketProviderProps {
  url: string;
}

export const SocketProvider = ({
  url,
  children,
}: React.PropsWithChildren<SocketProviderProps>) => {
  const socketRef = useRef<Socket | null>(null);

  const [isConnected, setIsConnected] = useState(false);

  const connectCallbacks = useRef(new Set<() => void>());
  const disconnectCallbacks = useRef(new Set<(reason: string) => void>());

  useEffect(() => {
    const socket = io(url, {
      autoConnect: false,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      connectCallbacks.current.forEach((cb) => {
        cb();
      });
    });

    socket.on("disconnect", (reason) => {
      setIsConnected(false);
      disconnectCallbacks.current.forEach((cb) => {
        cb(reason);
      });
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [url]);

  const connect = useCallback(() => {
    socketRef.current?.connect();
  }, []);

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
  }, []);

  const onConnect = useCallback((cb: () => void) => {
    connectCallbacks.current.add(cb);
    return () => connectCallbacks.current.delete(cb);
  }, []);

  const onDisconnect = useCallback((cb: (reason: string) => void) => {
    disconnectCallbacks.current.add(cb);
    return () => disconnectCallbacks.current.delete(cb);
  }, []);

  return (
    <SocketContext
      value={{
        socket: socketRef.current,
        isConnected,
        connect,
        disconnect,
        onConnect,
        onDisconnect,
      }}
    >
      {children}
    </SocketContext>
  );
};
