import { IonRouterOutlet, IonTabs } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import Home from "@pages/home/HomePage";
import Printers from "@pages/printers/PrintersPage";
import ScanPage from "@pages/ScanPage";
import Settings from "@pages/settings/SettingsPage";
import UpdateAppPage from "@pages/settings/UpdateAppPage";
import { Redirect, Route } from "react-router-dom";
import AppTabBar from "./AppTabBar";

export default function Applayout() {
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
            <AppTabBar />
          </IonTabs>
        </Route>
      </IonRouterOutlet>
    </IonReactRouter>
  );
}
