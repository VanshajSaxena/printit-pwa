import {
  IonHeader,
  IonItem,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import AppContent from "./AppContent";
import "./Settings.css";

const Settings: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <AppContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Settings</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonList inset>
          <IonItem
            button
            routerLink="/settings/update"
            routerDirection="forward"
          >
            Check for updates
          </IonItem>
        </IonList>
      </AppContent>
    </IonPage>
  );
};

export default Settings;
