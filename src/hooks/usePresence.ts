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
