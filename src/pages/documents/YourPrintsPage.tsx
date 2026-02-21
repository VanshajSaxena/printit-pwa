import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonHeader,
  IonIcon,
  IonLabel,
  IonList,
  IonListHeader,
  IonNote,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonRouter,
} from "@ionic/react";
import AppContent from "@layout/AppContent";
import { useDraftStore } from "@store/draftStore";
import {
  TransactionStatus,
  useTransactionStore,
} from "@store/transactionStore";
import { useVendorStore } from "@store/vendorStore";
import { documentTextOutline, printOutline } from "ionicons/icons";
import React, { useMemo } from "react";

const YourPrintsPage: React.FC = () => {
  const router = useIonRouter();

  const draftTransactionsMap = useDraftStore(
    (state) => state.state.transactions,
  );
  const setCurrentDraftTransactionId = useDraftStore(
    (state) => state.setCurrentDraftTransactionId,
  );

  const completedTransactionsMap = useTransactionStore(
    (state) => state.state.transactions,
  );

  const setCurrentTransactionId = useTransactionStore(
    (state) => state.setCurrentTransactionId,
  );

  const vendorsMap = useVendorStore((state) => state.vendors);

  const drafts = useMemo(() => {
    return Object.values(draftTransactionsMap).sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }, [draftTransactionsMap]);

  const pastPrints = useMemo(() => {
    return Object.values(completedTransactionsMap).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [completedTransactionsMap]);

  const hasAnyActivity = drafts.length > 0 || pastPrints.length > 0;

  const handleResumeDraft = (id: string) => {
    setCurrentDraftTransactionId(id);
    router.push("/prints/checkout");
  };

  const handleViewPrint = (id: number) => {
    setCurrentTransactionId(id);
    router.push("/prints/summary");
  };

  const getVendorName = (vendorId?: number) => {
    if (!vendorId) return "Unknown Printer";
    const vendor = vendorsMap[vendorId];
    return vendor.displayName ?? `${vendor.firstName} ${vendor.lastName}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  const getStatusConfig = (status: TransactionStatus) => {
    switch (status) {
      case "COMPLETED":
        return {
          color: "success",
          label: "Printed",
        };
      case "ERROR":
        return { color: "danger", label: "Failed" };
      case "PRINTING":
        return { color: "secondary", label: "Printing" };
      default:
        return { color: "warning", label: "Queued" };
    }
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

        {!hasAnyActivity ? (
          <div className="flex h-[80vh] flex-col items-center justify-center text-center">
            <div className="rounded-full">
              <IonIcon
                icon={printOutline}
                className="text-6xl"
                color={"medium"}
              />
            </div>
            <h2 className="text-xl font-semibold">No prints yet</h2>
            <IonNote className="max-w-xs text-sm">
              Your drafts and past prints will appear here.
            </IonNote>
          </div>
        ) : (
          <div className="pb-12">
            {drafts.length > 0 && (
              <IonList className="bg-transparent!">
                <IonListHeader>
                  <IonLabel className="text-sm font-bold tracking-wide uppercase">
                    Drafts
                  </IonLabel>
                </IonListHeader>

                {drafts.map((draft) => {
                  const vendorName = getVendorName(draft.vendorId);
                  const fileCount = draft.jobs.length;
                  const fileLabel =
                    fileCount === 1
                      ? "1 Document"
                      : `${fileCount.toString()} Documents`;

                  return (
                    <IonCard
                      key={draft.id}
                      className="mx-4 my-2 mb-4 border-none! shadow-sm"
                      button
                      onClick={() => {
                        handleResumeDraft(draft.id);
                      }}
                    >
                      <IonCardHeader className="pb-2">
                        <div className="flex justify-between">
                          <div>
                            <IonCardSubtitle
                              className="text-xs font-bold tracking-wider uppercase"
                              color="primary"
                            >
                              Draft
                            </IonCardSubtitle>
                            <IonCardTitle className="mt-1 text-base font-bold">
                              {vendorName}
                            </IonCardTitle>
                          </div>
                          <IonNote className="text-xs">
                            {formatDate(draft.updatedAt)}
                          </IonNote>
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
              </IonList>
            )}

            {pastPrints.length > 0 && (
              <IonList className="bg-transparent!">
                <IonListHeader>
                  <IonLabel className="text-sm font-bold tracking-wide uppercase">
                    Past Prints
                  </IonLabel>
                </IonListHeader>

                {pastPrints.map((print) => {
                  const vendorName = getVendorName(print.vendorId);
                  const fileCount = print.jobs.length;
                  const fileLabel =
                    fileCount === 1
                      ? "1 Document"
                      : `${fileCount.toString()} Documents`;

                  const statusConfig = getStatusConfig(print.status);

                  return (
                    <IonCard
                      key={print.id}
                      className="mx-4 my-2 mb-4 border-none! shadow-sm"
                      button
                      onClick={() => {
                        handleViewPrint(print.id);
                      }}
                    >
                      <IonCardHeader className="pb-2">
                        <div className="flex justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <IonCardSubtitle
                                className="text-xs font-bold tracking-wider uppercase"
                                color={statusConfig.color}
                              >
                                {statusConfig.label}
                              </IonCardSubtitle>
                            </div>

                            <IonCardTitle className="mt-1 text-base font-bold">
                              {vendorName}
                            </IonCardTitle>
                          </div>
                          <IonNote className="text-xs">
                            {formatDate(print.createdAt)}
                          </IonNote>
                        </div>
                      </IonCardHeader>
                      <IonCardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <IonIcon icon={documentTextOutline} />
                            <IonLabel>{fileLabel}</IonLabel>
                          </div>
                          <IonNote className="font-mono text-xs">
                            #{print.friendlyId.substring(0, 8)}
                          </IonNote>
                        </div>
                      </IonCardContent>
                    </IonCard>
                  );
                })}
              </IonList>
            )}
          </div>
        )}
      </AppContent>
    </IonPage>
  );
};

export default YourPrintsPage;
