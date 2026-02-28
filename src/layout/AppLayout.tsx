import { useAndroidBackButton } from "@hooks/useAndroidBackButton";
import { IonRouterOutlet, IonTabs } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import YourPrintsPage from "@pages/documents/YourPrintsPage";
import CheckoutPage from "@pages/home/CheckoutPage";
import HomePage from "@pages/home/HomePage";
import { PrintOptionsDocumentPage } from "@pages/home/PrintOptionsDocumentPage";
import { PrintOptionsPage } from "@pages/home/PrintOptionsPage";
import { RequireCurrentDraftJob } from "@pages/home/RequireCurrentDraftJob";
import { RequireCurrentDraftTransaction } from "@pages/home/RequireCurrentDraftTransaction";
import { RequireCurrentTransaction } from "@pages/home/RequireCurrentTransaction";
import { RequireVendorAndTransactionStore } from "@pages/home/RequireVendorAndTransactionStore";
import SelectedVendorPage from "@pages/home/SelectedVendorPage";
import { SummaryPage } from "@pages/home/SummaryPage";
import NotFoundPage from "@pages/NotFoundPage";
import PrintersPage from "@pages/printers/PrintersPage";
import ScanPage from "@pages/ScanPage";
import AppearanceModePage from "@pages/settings/AppearanceModePage";
import AppearancePage from "@pages/settings/AppearancePage";
import SettingsPage from "@pages/settings/SettingsPage";
import UpdateAppPage from "@pages/settings/UpdateAppPage";
import { Redirect, Route } from "react-router-dom";
import AppTabBar from "./AppTabBar";

export default function Applayout() {
  useAndroidBackButton();
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
                <RequireCurrentDraftTransaction>
                  <CheckoutPage />
                </RequireCurrentDraftTransaction>
              </Route>
              <Route exact path="/home/checkout/print-options">
                <RequireCurrentDraftTransaction>
                  <PrintOptionsPage />
                </RequireCurrentDraftTransaction>
              </Route>

              <Route exact path="/home/checkout/print-options/document">
                <RequireCurrentDraftTransaction>
                  <RequireCurrentDraftJob>
                    <PrintOptionsDocumentPage />
                  </RequireCurrentDraftJob>
                </RequireCurrentDraftTransaction>
              </Route>
              <Route exact path="/home/status">
                <RequireCurrentTransaction>
                  <SummaryPage />
                </RequireCurrentTransaction>
              </Route>
              <Route exact path="/prints">
                <RequireVendorAndTransactionStore>
                  <YourPrintsPage />
                </RequireVendorAndTransactionStore>
              </Route>
              <Route exact path="/prints/checkout">
                <RequireCurrentDraftTransaction>
                  <CheckoutPage />
                </RequireCurrentDraftTransaction>
              </Route>
              <Route exact path="/prints/checkout/print-options">
                <RequireCurrentDraftTransaction>
                  <PrintOptionsPage />
                </RequireCurrentDraftTransaction>
              </Route>
              <Route exact path="/prints/checkout/print-options/document">
                <RequireCurrentDraftTransaction>
                  <RequireCurrentDraftJob>
                    <PrintOptionsDocumentPage />
                  </RequireCurrentDraftJob>
                </RequireCurrentDraftTransaction>
              </Route>
              <Route exact path="/prints/status">
                <RequireCurrentTransaction>
                  <SummaryPage />
                </RequireCurrentTransaction>
              </Route>
              <Route exact path="/printers">
                <PrintersPage />
              </Route>
              <Route exact path="/printers/:selector">
                <SelectedVendorPage />
              </Route>
              <Route exact path="/printers/checkout">
                <RequireCurrentDraftTransaction>
                  <CheckoutPage />
                </RequireCurrentDraftTransaction>
              </Route>
              <Route exact path="/printers/checkout/print-options">
                <RequireCurrentDraftTransaction>
                  <PrintOptionsPage />
                </RequireCurrentDraftTransaction>
              </Route>

              <Route exact path="/printers/checkout/print-options/document">
                <RequireCurrentDraftTransaction>
                  <RequireCurrentDraftJob>
                    <PrintOptionsDocumentPage />
                  </RequireCurrentDraftJob>
                </RequireCurrentDraftTransaction>
              </Route>
              <Route exact path="/printers/status">
                <RequireCurrentTransaction>
                  <SummaryPage />
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
