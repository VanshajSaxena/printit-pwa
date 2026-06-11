import {
  IonBackButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonRouter,
} from "@ionic/react";

import { PrinterGraphic } from "@components/graphics/PrinterGraphic";
import AppContent from "@layout/AppContent";
import { useVendorStore } from "@store/vendorStore";
import { formatRelativeTime } from "@utils/formatRelativeTime";
import { checkmarkCircle, time } from "ionicons/icons";
import { useDraftStore } from "@store/draftStore";

export function SelectPrinterPage() {
  const router = useIonRouter();
  const vendors = useVendorStore.getState().getAllVendors();

  const currentDraftTransactionId = useDraftStore(
    (store) => store.state.currentDraftTransactionId,
  );

  if (!currentDraftTransactionId) {
    // this will never happen because of the parent guard
    throw new Error("CurrentDraftTransactionId doesn't exist");
  }

  const updateTransactionVendor = useDraftStore(
    (store) => store.updateTransactionVendor,
  );

  const currentDraftTransactionVendorId = useDraftStore(
    (store) => store.state.transactions[currentDraftTransactionId].vendorId,
  );

  const handleSelect = (vendorId: number) => {
    updateTransactionVendor(currentDraftTransactionId, vendorId);
    router.push(`/${router.routeInfo.tab ?? "home"}/checkout`, "back");
  };

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton
              defaultHref={`/${router.routeInfo.tab ?? "home"}/checkout`}
            />
          </IonButtons>
          <IonTitle>Select Printer</IonTitle>
        </IonToolbar>
      </IonHeader>

      <AppContent fullscreen className="ion-padding">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {vendors.map((vendor) => (
            <IonCard
              key={vendor.id}
              button
              onClick={() => {
                handleSelect(vendor.id);
              }}
              className="m-0 h-full w-full cursor-pointer transition-transform active:scale-[0.98]"
            >
              <div className="flex justify-center p-4">
                <PrinterGraphic />
              </div>

              <IonCardHeader>
                <IonCardTitle className="flex items-start justify-between gap-2 text-base">
                  <span className="line-clamp-1">
                    {vendor.displayName ?? vendor.firstName}
                  </span>

                  {currentDraftTransactionVendorId === vendor.id && (
                    <IonIcon
                      icon={checkmarkCircle}
                      color="success"
                      style={{ fontSize: "1.2rem" }}
                    />
                  )}
                </IonCardTitle>

                <IonCardSubtitle className="text-xs">
                  @{vendor.username}
                </IonCardSubtitle>
              </IonCardHeader>

              <IonCardContent className="pt-0">
                <div className="flex items-center gap-2 text-sm">
                  <IonIcon icon={time} color="medium" />
                  <span>
                    {vendor.lastUsedAt
                      ? formatRelativeTime(vendor.lastUsedAt)
                      : "Never used"}
                  </span>
                </div>
              </IonCardContent>
            </IonCard>
          ))}
        </div>
      </AppContent>
    </IonPage>
  );
}
