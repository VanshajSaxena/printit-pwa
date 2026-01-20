import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";

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
      <IonContent fullscreen>
        <div className="flex h-fit w-full flex-col items-center justify-center">
          <IonList inset className="w-full max-w-2xl">
            <IonItem>
              <IonLabel>Current version</IonLabel>
              <IonLabel slot="end">0.1.0</IonLabel>
            </IonItem>
          </IonList>
          <IonList inset className="w-full max-w-2xl">
            <IonItem button>Install Update</IonItem>
          </IonList>
        </div>
      </IonContent>
    </IonPage>
  );
}
