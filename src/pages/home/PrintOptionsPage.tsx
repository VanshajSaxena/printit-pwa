import {
  IonBackButton,
  IonButtons,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonRouter,
} from "@ionic/react";
import AppContent from "@layout/AppContent";
import { useDraftStore } from "@store/draftStore";
import { checkmark, chevronForward } from "ionicons/icons";

import "./PrintOptionsPage.css";

export function PrintOptionsPage() {
  const router = useIonRouter();

  const currentDraftTransaction = useDraftStore((s) => {
    const id = s.state.currentDraftTransactionId;
    return id ? s.state.transactions[id] : null;
  });

  const setCurrentDraftJobId = useDraftStore((s) => s.setCurrentDraftJobId);

  const handleJobPress = (jobId: string) => {
    setCurrentDraftJobId(jobId);
    router.push(
      `/${router.routeInfo.tab ?? "home"}/checkout/print-options/document`,
      "forward",
    );
  };

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonTitle>Print Options</IonTitle>
          <IonButtons slot="end">
            <IonBackButton
              type="submit"
              icon={checkmark}
              text={""}
              className="mr-2"
            >
              Done
            </IonBackButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <AppContent fullscreen className="ion-padding-top">
        <IonList inset>
          {currentDraftTransaction?.jobs.map((job) => (
            <IonItem
              key={job.id}
              button
              detail={false}
              onClick={() => {
                handleJobPress(job.id);
              }}
            >
              <IonLabel>
                <h3 className="font-medium">{job.document.filename}</h3>
                <p>
                  {job.document.pageCount}{" "}
                  {job.document.pageCount === 1 ? "page" : "pages"}
                </p>
              </IonLabel>
              <IonIcon
                slot="end"
                icon={chevronForward}
                color="medium"
                aria-hidden="true"
              />
            </IonItem>
          ))}
        </IonList>
      </AppContent>
    </IonPage>
  );
}
