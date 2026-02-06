import { useUpdate } from "@hooks/useUpdate";
import {
  IonBackButton,
  IonBadge,
  IonButtons,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonPage,
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
        <IonList inset className="py-0!">
          <IonItem>
            <IonLabel>Current version</IonLabel>
            {/* This gets replaced during build process. */}
            <IonLabel slot="end">{import.meta.env.VITE_APP_VERSION}</IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>Context</IonLabel>
            {/* This gets replaced during build process. */}
            <IonLabel slot="end">
              {import.meta.env.VITE_NETLIFY_CONTEXT}
            </IonLabel>
          </IonItem>
        </IonList>
        {needRefresh[0] ? (
          <IonList inset className="py-0!">
            <IonItem button detail onClick={() => void updateServiceWorker()}>
              <IonLabel>Install Update</IonLabel>
              <IonBadge color={"danger"}>1</IonBadge>
            </IonItem>
          </IonList>
        ) : (
          <IonNote className="mt-8 flex items-center justify-center">
            You are using the latest version of Printly.
          </IonNote>
        )}
      </AppContent>
    </IonPage>
  );
}
