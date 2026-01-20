import {
  IonBadge,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { home, print, settings } from "ionicons/icons";
import { Redirect, Route } from "react-router-dom";
import Home from "@pages/home/HomePage";
import Printers from "@pages/printers/PrintersPage";
import ScanPage from "@pages/ScanPage";
import Settings from "@pages/settings/SettingsPage";
import UpdateAppPage from "@pages/settings/UpdateAppPage";
import { useUpdate } from "../hooks/useUpdate";

export default function Applayout() {
  const { needRefresh } = useUpdate();
  // __AUTO_GENERATED_PRINT_VAR_START__
  console.log("Applayout needRefresh:", needRefresh[0]); // __AUTO_GENERATED_PRINT_VAR_END__
  return (
    <IonReactRouter>
      <IonRouterOutlet>
        <Route exact path="/scan">
          <ScanPage />
        </Route>

        <Route>
          <IonTabs>
            <IonRouterOutlet>
              <Route exact path="/home">
                <Home />
              </Route>
              <Route exact path="/printers">
                <Printers />
              </Route>
              <Route exact path="/settings">
                <Settings />
              </Route>
              <Route exact path="/settings/update">
                <UpdateAppPage />
              </Route>
              <Route exact path="/">
                <Redirect to="/home" />
              </Route>
            </IonRouterOutlet>
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
          </IonTabs>
        </Route>
      </IonRouterOutlet>
    </IonReactRouter>
  );
}
