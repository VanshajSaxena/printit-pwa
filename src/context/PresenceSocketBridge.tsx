import { useSocket } from "@hooks/useSocket";
import { PresenceStatus, usePresenceStore } from "@store/presenceStore";
import { useEffect, useRef } from "react";

export function PresenceSocketBridge() {
  const { socket, isConnected } = useSocket();
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!socket) return;

    const { setPresence, bulkUpdate, clear } = usePresenceStore.getState();

    const handlePresenceUpdate = ({
      vendorId,
      status,
    }: {
      vendorId: number;
      status: PresenceStatus;
    }) => {
      setPresence(vendorId, status);
    };

    const handlePresenceBulk = (
      presences: { vendorId: number; status: PresenceStatus }[],
    ) => {
      bulkUpdate(presences);
    };

    const handleDisconnect = () => {
      clear();
    };

    socket.on("presence:update", handlePresenceUpdate);
    socket.on("presence:bulk", handlePresenceBulk);
    socket.on("disconnect", handleDisconnect);

    if (isConnected && !isInitializedRef.current) {
      socket.emit("presence:request");
      isInitializedRef.current = true;
    }

    return () => {
      socket.off("presence:update", handlePresenceUpdate);
      socket.off("presence:bulk", handlePresenceBulk);
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
