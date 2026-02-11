import { Redirect } from "react-router";
import { useDraftStore } from "../../store/draftStore";

export function RequireCurrentTransaction({
  children,
}: {
  children: React.JSX.Element;
}) {
  const currentDraftTransactionId = useDraftStore(
    (store) => store.state.currentDraftTransactionId,
  );
  const hydrated = useDraftStore((store) => store.hydrated);

  if (!hydrated) {
    return null;
  }

  if (!currentDraftTransactionId) {
    return <Redirect to={"/home"}></Redirect>;
  }
  return children;
}
