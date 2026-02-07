import { usePresenceStore } from "@store/presenceStore";
import { useMemo } from "react";

export function useVendorPresence(vendorId: number | null | undefined) {
  const presenceMap = usePresenceStore((state) => state.presenceMap);

  return useMemo(() => {
    if (vendorId === null || vendorId === undefined) {
      return undefined;
    }
    return presenceMap.get(vendorId);
  }, [vendorId, presenceMap]);
}

export function useCurrentVendorPresence() {
  const currentVendorId = usePresenceStore((state) => state.currentVendorId);
  const presenceMap = usePresenceStore((state) => state.presenceMap);

  return useMemo(() => {
    if (currentVendorId === null) {
      return undefined;
    }
    return presenceMap.get(currentVendorId);
  }, [currentVendorId, presenceMap]);
}

export function useIsVendorOnline(vendorId: number | null | undefined) {
  const presence = useVendorPresence(vendorId);
  return presence === "online";
}

export function useOnlineVendors() {
  const presenceMap = usePresenceStore((state) => state.presenceMap);

  return useMemo(() => {
    const onlineVendors: number[] = [];
    presenceMap.forEach((status, vendorId) => {
      if (status === "online") {
        onlineVendors.push(vendorId);
      }
    });
    return onlineVendors;
  }, [presenceMap]);
}
