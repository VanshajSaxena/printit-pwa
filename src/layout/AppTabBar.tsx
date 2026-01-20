import {
  IonBadge,
  IonIcon,
  IonLabel,
  IonTabBar,
  IonTabButton,
} from "@ionic/react";
import { home, print, settings } from "ionicons/icons";
import { useUpdate } from "@hooks/useUpdate";
export default function AppTabBar() {
  const { needRefresh } = useUpdate();
  // __AUTO_GENERATED_PRINT_VAR_START__
  console.log("Applayout needRefresh:", needRefresh[0]); // __AUTO_GENERATED_PRINT_VAR_END__
  return (
    <IonTabBar slot="bottom">
      <IonTabButton tab="home" href="/home">
        <IonIcon aria-hidden="true" icon={home} />
        <IonLabel>Home</IonLabel>
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
