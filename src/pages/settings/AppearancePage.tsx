import {
  IonBackButton,
  IonButtons,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToggle,
  IonToolbar,
} from "@ionic/react";
import AppContent from "@layout/AppContent";

export default function AppearancePage() {
  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/settings" text="Settings" />
          </IonButtons>
          <IonTitle>Appearance</IonTitle>
        </IonToolbar>
      </IonHeader>
      <AppContent fullscreen>
        <IonList inset className="py-0!">
          <IonItem
            detail
            button
            routerLink="/settings/appearance/mode"
            routerDirection="forward"
          >
            <IonLabel>Device Mode</IonLabel>
            <IonLabel slot="end" color={"medium"}>
              {}
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>Use System Light/Dark Mode</IonLabel>
            <IonToggle slot="end"></IonToggle>
          </IonItem>
        </IonList>
      </AppContent>
    </IonPage>
  );
}
