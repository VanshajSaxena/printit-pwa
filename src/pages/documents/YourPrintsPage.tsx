import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonHeader,
  IonIcon,
  IonLabel,
  IonNote,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
  useIonRouter,
} from "@ionic/react";
import AppContent from "@layout/AppContent";
import { useDraftStore } from "@store/draftStore";
import { useVendorStore } from "@store/vendorStore";
import { documentTextOutline, printOutline } from "ionicons/icons";
import React, { useMemo } from "react";

const YourPrintsPage: React.FC = () => {
  const router = useIonRouter();

  const transactionsMap = useDraftStore((state) => state.state.transactions);
  const setCurrentDraftTransactionId = useDraftStore(
    (state) => state.setCurrentDraftTransactionId,
  );

  const vendorsMap = useVendorStore((state) => state.vendors);

  const drafts = useMemo(() => {
    return Object.values(transactionsMap).sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }, [transactionsMap]);

  const handleResumeDraft = (id: string) => {
    setCurrentDraftTransactionId(id);
    router.push("/prints/checkout");
  };

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonTitle>Your Prints</IonTitle>
        </IonToolbar>
      </IonHeader>

      <AppContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Your Prints</IonTitle>
          </IonToolbar>
        </IonHeader>

        <div className="ion-padding">
          {drafts.length === 0 ? (
            <div className="flex h-[70vh] flex-col items-center justify-center text-center opacity-80">
              <div className="rounded-full">
                <IonIcon
                  icon={printOutline}
                  className="text-6xl"
                  color={"medium"}
                />
              </div>
              <h2 className="text-xl font-semibold">No prints yet</h2>
              <IonNote className="max-w-xs text-sm">
                Your prints will appear here.
              </IonNote>
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="mb-4 ml-1">
                <IonText color="medium" className="text-sm font-medium">
                  Recent Drafts
                </IonText>
              </div>

              {drafts.map((draft) => {
                const vendor = draft.vendorId
                  ? vendorsMap[draft.vendorId]
                  : undefined;

                const vendorName = vendor
                  ? (vendor.givenName ??
                    `${vendor.firstName} ${vendor.lastName}`)
                  : "Unknown Printer";

                const dateLabel = new Date(draft.updatedAt).toLocaleDateString(
                  undefined,
                  {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                  },
                );

                const fileCount = draft.jobs.length;
                const fileLabel =
                  fileCount === 1
                    ? "1 Document"
                    : `${fileCount.toString()} Documents`;

                return (
                  <IonCard
                    key={draft.id}
                    button
                    onClick={() => {
                      handleResumeDraft(draft.id);
                    }}
                    className="m-0 mb-3 w-full shadow-sm"
                  >
                    <IonCardHeader className="pb-2">
                      <div className="flex justify-between">
                        <div>
                          <IonCardSubtitle
                            className="text-xs font-semibold tracking-wider uppercase"
                            color={"primary"}
                          >
                            Draft
                          </IonCardSubtitle>
                          <IonCardTitle className="mt-1 text-base font-bold">
                            {vendorName}
                          </IonCardTitle>
                        </div>
                        <IonNote className="text-xs">{dateLabel}</IonNote>
                      </div>
                    </IonCardHeader>
                    <IonCardContent>
                      <div className="flex items-center gap-2">
                        <IonIcon icon={documentTextOutline} />
                        <IonLabel>{fileLabel}</IonLabel>
                      </div>
                    </IonCardContent>
                  </IonCard>
                );
              })}
            </div>
          )}
        </div>
      </AppContent>
    </IonPage>
  );
};

export default YourPrintsPage;
