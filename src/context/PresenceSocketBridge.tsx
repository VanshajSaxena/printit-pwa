import { useSocket } from "@hooks/useSocket";
import { PresenceStatus, usePresenceStore } from "@store/presenceStore";
import { useEffect } from "react";

export function PresenceSocketBridge() {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const { setPresence, bulkUpdate, clear } = usePresenceStore.getState();

    socket.on(
      "presence:update",
      ({ vendorId, status }: { vendorId: number; status: PresenceStatus }) => {
        setPresence(vendorId, status);
      },
    );

    socket.on("presence:bulk", bulkUpdate);
    socket.on("disconnect", clear);

    return () => {
      socket.off("presence:update");
      socket.off("presence:bulk");
      socket.off("disconnect");
    };
  }, [socket]);

  return null;
}
