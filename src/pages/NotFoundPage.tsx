import {
  IonButton,
  IonHeader,
  IonIcon,
  IonNote,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonRouter,
} from "@ionic/react";
import AppContent from "@layout/AppContent";
import { alertCircleOutline, arrowBackOutline } from "ionicons/icons";

export default function NotFoundPage() {
  const router = useIonRouter();

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonTitle>Not Available</IonTitle>
        </IonToolbar>
      </IonHeader>
      <AppContent
        fullscreen
        className="ion-padding flex min-h-full flex-col justify-evenly"
      >
        <div>
          <IonIcon icon={alertCircleOutline} className="text-5xl" />

          <p className="my-1 text-lg font-semibold">
            This screen isn’t available
          </p>
          <IonNote color={"medium"}>
            The feature you’re trying to open doesn’t exist or was removed.
          </IonNote>

          <IonButton
            expand="block"
            fill="solid"
            className="my-8"
            onClick={() => {
              router.push("/home", "back", "pop");
            }}
          >
            <IonIcon icon={arrowBackOutline} slot="start" />
            Go Back
          </IonButton>
        </div>
      </AppContent>
    </IonPage>
  );
}
