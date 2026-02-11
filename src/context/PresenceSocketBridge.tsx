import { useSocket } from "@hooks/useSocket";
import { PresenceStatus, usePresenceStore } from "@store/presenceStore";
import { useEffect, useRef } from "react";

export function PresenceSocketBridge() {
  const { socket, isConnected } = useSocket();
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!socket) return;

    const { updatePresenceStatus, clear } = usePresenceStore.getState();

    const handlePresenceUpdate = ({
      vendorId,
      status,
    }: {
      vendorId: number;
      status: PresenceStatus;
    }) => {
      updatePresenceStatus(vendorId, status);
    };

    const handleDisconnect = () => {
      clear();
    };

    socket.on("presence:update", handlePresenceUpdate);
    socket.on("disconnect", handleDisconnect);

    if (isConnected && !isInitializedRef.current) {
      socket.emit("presence:request");
      isInitializedRef.current = true;
    }

    return () => {
      socket.off("presence:update", handlePresenceUpdate);
      socket.off("disconnect", handleDisconnect);
    };
  }, [socket, isConnected]);

  useEffect(() => {
    if (!isConnected) {
      isInitializedRef.current = false;
    }
  }, [isConnected]);

  return null;
}
