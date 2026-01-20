import { IonRouterOutlet, IonTabs } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import HomePage from "@pages/home/HomePage";
import PrintersPage from "@pages/printers/PrintersPage";
import ScanPage from "@pages/ScanPage";
import SettingsPage from "@pages/settings/SettingsPage";
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
                <HomePage />
              </Route>
              <Route exact path="/printers">
                <PrintersPage />
              </Route>
              <Route exact path="/settings">
                <SettingsPage />
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
