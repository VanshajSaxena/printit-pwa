import { usePresenceStore } from "@store/presenceStore";
import { useMemo } from "react";

/**
 * Hook to get the presence status of a specific vendor
 */
export function useVendorPresence(vendorId: number | null | undefined) {
  const presenceMap = usePresenceStore((state) => state.presenceMap);

  return useMemo(() => {
    if (vendorId === null || vendorId === undefined) {
      return undefined;
    }
    return presenceMap.get(vendorId);
  }, [vendorId, presenceMap]);
}

/**
 * Hook to get the presence status of the current vendor
 */
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

/**
 * Hook to check if a vendor is online
 */
export function useIsVendorOnline(vendorId: number | null | undefined) {
  const presence = useVendorPresence(vendorId);
  return presence === "online";
}

/**
 * Hook to get all online vendors
 */
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
