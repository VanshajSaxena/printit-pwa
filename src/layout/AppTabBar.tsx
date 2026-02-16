import { useUpdate } from "@hooks/useUpdate";
import {
  IonBadge,
  IonIcon,
  IonLabel,
  IonTabBar,
  IonTabButton,
} from "@ionic/react";
import { documents, home, print, settings } from "ionicons/icons";
export default function AppTabBar() {
  const { needRefresh } = useUpdate();
  return (
    <IonTabBar slot="bottom">
      <IonTabButton tab="home" href="/home">
        <IonIcon aria-hidden="true" icon={home} />
        <IonLabel>Home</IonLabel>
      </IonTabButton>
      <IonTabButton tab="prints" href="/prints">
        <IonIcon aria-hidden="true" icon={documents} />
        <IonLabel>Your Prints</IonLabel>
      </IonTabButton>
      <IonTabButton tab="printers" href="/printers">
        <IonIcon aria-hidden="true" icon={print} />
        <IonLabel>Printers</IonLabel>
      </IonTabButton>
      <IonTabButton tab="settings" href="/settings">
        <IonIcon aria-hidden="true" icon={settings} />
        <IonLabel>Settings</IonLabel>
        {needRefresh[0] && <IonBadge color={"danger"}>1</IonBadge>}
      </IonTabButton>
    </IonTabBar>
  );
}
