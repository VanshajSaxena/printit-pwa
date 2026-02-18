import { useTransactionStore } from "@store/transactionStore";
import { Redirect } from "react-router";

export function RequireCurrentTransaction({
  children,
}: {
  children: React.JSX.Element;
}) {
  const currentTransactionId = useTransactionStore(
    (store) => store.state.currentTransactionId,
  );
  const hydrated = useTransactionStore((store) => store.hydrated);

  if (!hydrated) {
    return null;
  }

  if (!currentTransactionId) {
    return <Redirect to={"/home"}></Redirect>;
  }
  return children;
}
