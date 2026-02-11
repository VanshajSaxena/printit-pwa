import {
  IonBackButton,
  IonButtons,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonRadio,
  IonRadioGroup,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import AppContent from "@layout/AppContent";

export default function AppearanceModePage() {
  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/settings" text="Settings" />
          </IonButtons>
          <IonTitle>Device Mode</IonTitle>
        </IonToolbar>
      </IonHeader>
      <AppContent fullscreen>
        <IonList inset className="py-0!">
          <IonRadioGroup>
            <IonItem>
              <IonLabel>Apple</IonLabel>
              <IonRadio slot="end" color={"medium"}>
                {}
              </IonRadio>
            </IonItem>
            <IonItem>
              <IonLabel>Android</IonLabel>
              <IonRadio slot="end"></IonRadio>
            </IonItem>
          </IonRadioGroup>
        </IonList>
      </AppContent>
    </IonPage>
  );
}
