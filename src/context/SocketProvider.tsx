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

  const isMountedRef = useRef(true);

  useEffect(() => {
    const socket = io(url, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    const handleConnect = () => {
      if (isMountedRef.current) {
        setIsConnected(true);
        connectCallbacks.current.forEach((cb) => {
          try {
            cb();
          } catch (error) {
            console.error("Error in connect callback:", error);
          }
        });
      }
    };

    const handleDisconnect = (reason: string) => {
      if (isMountedRef.current) {
        setIsConnected(false);
        disconnectCallbacks.current.forEach((cb) => {
          try {
            cb(reason);
          } catch (error) {
            console.error("Error in disconnect callback:", error);
          }
        });
      }
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      isMountedRef.current = false;
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
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
    return () => {
      connectCallbacks.current.delete(cb);
    };
  }, []);

  const onDisconnect = useCallback((cb: (reason: string) => void) => {
    disconnectCallbacks.current.add(cb);
    return () => {
      disconnectCallbacks.current.delete(cb);
    };
  }, []);

  const contextValue = {
    socket: socketRef.current,
    isConnected,
    connect,
    disconnect,
    onConnect,
    onDisconnect,
  };

  return <SocketContext value={contextValue}>{children}</SocketContext>;
};
