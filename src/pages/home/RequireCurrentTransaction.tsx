import { Redirect } from "react-router";
import { useDraftStore } from "../../store/draftStore";

export function RequireCurrentTransaction({
  children,
}: {
  children: React.JSX.Element;
}) {
  const getCurrentDraftTransactionId = useDraftStore(
    (store) => store.getCurrentDraftTransactionId,
  );
  const hydrated = useDraftStore((store) => store.hydrated);
  const currentDraftTransactionId = getCurrentDraftTransactionId();

  if (!hydrated) {
    return null;
  }

  if (!currentDraftTransactionId) {
    return <Redirect to={"/home"}></Redirect>;
  }
  return children;
}
