import { IonRouterOutlet, IonTabs } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { ChangePrintSettingsPage } from "@pages/home/ChangePrintSettingsPage";
import CheckoutPage from "@pages/home/CheckoutPage";
import HomePage from "@pages/home/HomePage";
import { RequireCurrentTransaction } from "@pages/home/RequireCurrentTransaction";
import SelectedVendorPage from "@pages/home/SelectedVendorPage";
import NotFoundPage from "@pages/NotFoundPage";
import PrintersPage from "@pages/printers/PrintersPage";
import ScanPage from "@pages/ScanPage";
import SettingsPage from "@pages/settings/SettingsPage";
import UpdateAppPage from "@pages/settings/UpdateAppPage";
import { Redirect, Route } from "react-router-dom";
import AppTabBar from "./AppTabBar";
import AppearancePage from "@pages/settings/AppearancePage";
import AppearanceModePage from "@pages/settings/AppearanceModePage";
import YourPrintsPage from "@pages/documents/YourPrintsPage";
import { RequireVendorAndTransactionStore } from "@pages/home/RequireVendorAndTransactionStore";

export default function Applayout() {
  return (
    <IonReactRouter>
      <IonRouterOutlet>
        <Route exact path="/scan">
          <ScanPage />
        </Route>
        <Route exact path="/not-found" component={NotFoundPage} />
        <Route>
          <IonTabs>
            <IonRouterOutlet>
              <Route exact path="/home">
                <HomePage />
              </Route>
              <Route exact path="/home/printer/:selector">
                <SelectedVendorPage />
              </Route>
              <Route exact path="/home/printer">
                <Redirect to="/home" />
              </Route>
              <Route exact path="/home/checkout">
                <RequireCurrentTransaction>
                  <CheckoutPage />
                </RequireCurrentTransaction>
              </Route>
              <Route exact path="/home/checkout/print-settings">
                <RequireCurrentTransaction>
                  <ChangePrintSettingsPage />
                </RequireCurrentTransaction>
              </Route>
              <Route exact path="/prints">
                <RequireVendorAndTransactionStore>
                  <YourPrintsPage />
                </RequireVendorAndTransactionStore>
              </Route>
              <Route exact path="/prints/checkout">
                <RequireCurrentTransaction>
                  <CheckoutPage />
                </RequireCurrentTransaction>
              </Route>
              <Route exact path="/printers">
                <PrintersPage />
              </Route>
              <Route exact path="/printers/:selector">
                <SelectedVendorPage />
              </Route>
              <Route exact path="/printers/checkout">
                <RequireCurrentTransaction>
                  <CheckoutPage />
                </RequireCurrentTransaction>
              </Route>
              <Route exact path="/settings">
                <SettingsPage />
              </Route>
              <Route exact path="/settings/update">
                <UpdateAppPage />
              </Route>
              <Route exact path="/settings/appearance">
                <AppearancePage />
              </Route>
              <Route exact path="/settings/appearance/mode">
                <AppearanceModePage />
              </Route>
              <Route exact path="/">
                <Redirect to="/home" />
              </Route>
              <Route render={() => <Redirect to="/not-found" />} />
            </IonRouterOutlet>
            <AppTabBar />
          </IonTabs>
        </Route>
      </IonRouterOutlet>
    </IonReactRouter>
  );
}
