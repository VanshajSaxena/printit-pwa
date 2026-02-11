import { useUpdate } from "@hooks/useUpdate";
import {
  IonBadge,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import AppContent from "@layout/AppContent";

const SettingsPage: React.FC = () => {
  const { needRefresh } = useUpdate();
  return (
    <IonPage>
      <IonHeader translucent>
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
        <IonList inset className="py-0!">
          <IonItem
            button
            detail
            routerLink="/settings/update"
            routerDirection="forward"
          >
            <IonLabel>Check for updates</IonLabel>
            {needRefresh[0] && <IonBadge color={"danger"}>1</IonBadge>}
          </IonItem>
        </IonList>
        <IonList inset className="py-0!">
          <IonItem
            button
            detail
            routerLink="/settings/appearance"
            routerDirection="forward"
          >
            <IonLabel>Appearance</IonLabel>
          </IonItem>
        </IonList>
      </AppContent>
    </IonPage>
  );
};

export default SettingsPage;
