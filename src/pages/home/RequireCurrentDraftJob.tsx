import { Redirect } from "react-router";
import { useDraftStore } from "../../store/draftStore";

export function RequireCurrentDraftJob({
  children,
}: {
  children: React.JSX.Element;
}) {
  const currentDraftJobId = useDraftStore(
    (store) => store.state.currentDraftJobId,
  );
  const hydrated = useDraftStore((store) => store.hydrated);

  if (!hydrated) {
    return null;
  }

  if (!currentDraftJobId) {
    return <Redirect to={"/home"}></Redirect>;
  }
  return children;
}
