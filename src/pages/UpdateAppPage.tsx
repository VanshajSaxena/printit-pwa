import {
  IonBackButton,
  IonButtons,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import AppContent from "./AppContent";

export default function UpdateAppPage() {
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
            <IonLabel slot="end">0.1.0</IonLabel>
          </IonItem>
        </IonList>
        <IonList inset>
          <IonItem button>Install Update</IonItem>
        </IonList>
      </AppContent>
    </IonPage>
  );
}
