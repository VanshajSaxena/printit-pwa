import { createContext } from "react";
import { Socket } from "socket.io-client";

export interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  onConnect: (cb: () => void) => () => void;
  onDisconnect: (cb: (reason: string) => void) => () => void;
}

export const SocketContext = createContext<SocketContextType | undefined>(
  undefined,
);
