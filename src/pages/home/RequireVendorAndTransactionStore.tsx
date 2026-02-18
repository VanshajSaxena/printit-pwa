import { useTransactionStore } from "@store/transactionStore";
import { useVendorStore } from "@store/vendorStore";

export function RequireVendorAndTransactionStore({
  children,
}: {
  children: React.JSX.Element;
}) {
  const transactionStoreHydrated = useTransactionStore(
    (store) => store.hydrated,
  );
  const vendorStoreHydrated = useVendorStore((store) => store.hydrated);

  if (!transactionStoreHydrated || !vendorStoreHydrated) {
    return null;
  }

  return children;
}
