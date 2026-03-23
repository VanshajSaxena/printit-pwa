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
import { document } from "ionicons/icons";

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
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <AppContent fullscreen>
        {/* <h2 */}
        {/*   style={{ */}
        {/*     fontSize: "20px", */}
        {/*     fontWeight: 600, */}
        {/*     margin: "1rem", */}
        {/*     color: "var(--ion-color-dark)", */}
        {/*   }} */}
        {/* > */}
        {/*   Documents */}
        {/* </h2> */}
        {/**/}
        <IonList inset>
          {currentDraftTransaction?.jobs.map((job) => (
            <IonItem
              key={job.id}
              button
              detail
              onClick={() => {
                handleJobPress(job.id);
              }}
            >
              <IonIcon
                icon={document}
                slot="start"
                color={job.outputColor === "Color" ? "secondary" : "medium"}
                className="text-xl"
              />
              <IonLabel>
                <h3 className="font-medium">{job.document.filename}</h3>
                <p>
                  {job.document.pageCount}{" "}
                  {job.document.pageCount === 1 ? "page" : "pages"}
                </p>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
      </AppContent>
    </IonPage>
  );
}
