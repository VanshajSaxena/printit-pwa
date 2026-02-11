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
            <IonLabel slot="end">{import.meta.env.VITE_APP_VERSION}</IonLabel>
          </IonItem>
          {import.meta.env.VITE_NETLIFY_CONTEXT !== "production" && (
            <>
              <IonItem>
                <IonLabel>Context</IonLabel>
                <IonLabel slot="end">
                  {import.meta.env.VITE_NETLIFY_CONTEXT}
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>Commit</IonLabel>
                <IonLabel slot="end">
                  {import.meta.env.VITE_COMMIT_REF.substring(0, 8)}
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>Deploy URL</IonLabel>
                <IonLabel slot="end" color={"secondary"}>
                  {import.meta.env.VITE_DEPLOY_PRIME_URL}
                </IonLabel>
              </IonItem>
            </>
          )}
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
            You are using the latest version of Printit.
          </IonNote>
        )}
      </AppContent>
    </IonPage>
  );
}
