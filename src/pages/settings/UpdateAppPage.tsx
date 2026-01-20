import { useUpdate } from "@hooks/useUpdate";
import {
  IonBackButton,
  IonButtons,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import AppContent from "@layout/AppContent";

export default function UpdateAppPage() {
  const { needRefresh, updateServiceWorker } = useUpdate();
  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/settings" text="Settings" />
          </IonButtons>
          <IonTitle>Check for updates</IonTitle>
        </IonToolbar>
      </IonHeader>
      <AppContent fullscreen>
        <IonList inset>
          <IonItem>
            <IonLabel>Current version</IonLabel>
            {/* This gets replaced during build process. */}
            <IonLabel slot="end">{import.meta.env.VITE_APP_VERSION}</IonLabel>
          </IonItem>
        </IonList>
        {needRefresh[0] ? (
          <IonList inset>
            <IonItem button onClick={() => updateServiceWorker()}>
              Install Update
            </IonItem>
          </IonList>
        ) : (
          <IonText className="mt-8 flex items-center justify-center">
            You are using the latest version of Printly.
          </IonText>
        )}
      </AppContent>
    </IonPage>
  );
}
