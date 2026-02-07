import { client } from "@api/client";
import { PulseIcon } from "@components/graphics/PulseIcon";
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardSubtitle,
  IonCardTitle,
  IonCol,
  IonGrid,
  IonHeader,
  IonIcon,
  IonLabel,
  IonPage,
  IonRow,
  IonText,
  IonTitle,
  IonToolbar,
  useIonRouter,
  useIonToast,
  useIonLoading,
} from "@ionic/react";
import AppContent from "@layout/AppContent";
import { useDraftStore } from "@store/draftStore";
import { useTransactionStore } from "@store/transactionStore";
import { usePresenceStore } from "@store/presenceStore";
import { useCurrentVendorPresence } from "@hooks/usePresence";
import { document, printOutline, settingsOutline } from "ionicons/icons";
import { useState } from "react";

export default function CheckoutPage() {
  const router = useIonRouter();
  const [presentToast] = useIonToast();
  const [presentLoading, dismissLoading] = useIonLoading();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get current vendor info
  const currentVendorId = usePresenceStore((store) => store.currentVendorId);
  const vendorStatus = useCurrentVendorPresence();

  // Draft transaction state
  const getCurrentDraftTransactionId = useDraftStore(
    (store) => store.getCurrentDraftTransactionId,
  );
  const createTransaction = useTransactionStore(
    (store) => store.createTransaction,
  );
  const clearCurrentDraftTransactionId = useDraftStore(
    (store) => store.clearCurrentDraftTransactionId,
  );

  const currentDraftTransactionId = getCurrentDraftTransactionId();

  if (!currentDraftTransactionId) {
    throw new Error("CurrentDraftTransactionId doesn't exist");
  }

  const currentDraftTransaction = useDraftStore((store) => {
    return store.state.transactions[currentDraftTransactionId];
  });

  // API mutations
  const createDocumentsMutation = client.useMutation(
    "post",
    "/api/v1/documents",
  );
  const updateDocumentsMutation = client.useMutation(
    "patch",
    "/api/v1/documents/{id}",
  );
  const createTransactionMutation = client.useMutation(
    "post",
    "/api/v1/transactions",
  );
  const filesMutation = client.useMutation("post", "/api/v1/files/upload");

  const handleSubmit = async () => {
    // Validate vendor is online
    if (vendorStatus !== "online") {
      await presentToast({
        message: "Cannot print - printer is currently offline",
        duration: 3000,
        color: "danger",
      });
      return;
    }

    if (!currentVendorId) {
      await presentToast({
        message: "No printer selected",
        duration: 3000,
        color: "danger",
      });
      return;
    }

    setIsSubmitting(true);
    await presentLoading({ message: "Preparing your documents..." });

    try {
      // Step 1: Create document records
      const draftDocuments = currentDraftTransaction.jobs.map(
        ({ document: draft }) => ({
          filename: draft.filename,
          contentType: draft.contentType,
          draftId: draft.id,
        }),
      );

      const { documents } = await createDocumentsMutation.mutateAsync({
        body: { documents: draftDocuments },
      });

      await dismissLoading();
      await presentLoading({ message: "Uploading files..." });

      // Step 2: Get signed URLs for upload
      const { signedUrls } = await filesMutation.mutateAsync({
        body: { ids: documents.map((document) => document.id) },
      });

      // Step 3: Upload files to signed URLs
      try {
        await Promise.all(
          signedUrls.map(async ({ url, id }) => {
            const document = documents.find((document) => document.id === id);
            if (!document) {
              throw new Error(`Document not found for id ${id.toString()}`);
            }

            const file = currentDraftTransaction.jobs.find(
              ({ document: draftDocument }) =>
                draftDocument.id === document.draftId,
            )?.document.file;

            if (!file) {
              throw new Error(`File not found for draftId ${document.draftId}`);
            }

            const uploadResponse = await fetch(url, {
              method: "PUT",
              headers: { "Content-Type": file.type },
              body: file,
            });

            if (!uploadResponse.ok) {
              throw new Error(
                `Upload failed for document ${id.toString()}: ${uploadResponse.status.toString()}`,
              );
            }
          }),
        );

        // Step 4: Mark documents as uploaded
        await Promise.all(
          documents.map(async (document) => {
            await updateDocumentsMutation.mutateAsync({
              params: { path: { id: document.id } },
              body: { status: "UPLOADED" },
            });
          }),
        );
      } catch (uploadError) {
        console.error("Upload failed:", uploadError);

        // Mark documents as failed
        await Promise.all(
          documents.map(async (document) => {
            await updateDocumentsMutation.mutateAsync({
              params: { path: { id: document.id } },
              body: { status: "FAILED" },
            });
          }),
        );

        throw new Error("Failed to upload documents");
      }

      await dismissLoading();
      await presentLoading({ message: "Creating print job..." });

      // Step 5: Create transaction with jobs
      const jobs = currentDraftTransaction.jobs.map((job) => {
        const documentId = documents.find(
          (document) => job.document.id === document.draftId,
        )?.id;

        if (!documentId) {
          throw new Error(
            `Missing document id from documents received from backend`,
          );
        }

        return {
          copyCount: job.copyCount,
          outputColor: job.outputColor,
          documentId,
        };
      });

      const transactionResponse = await createTransactionMutation.mutateAsync({
        body: { jobs, vendorId: currentVendorId },
      });

      // Step 6: Save transaction and cleanup
      createTransaction(transactionResponse);
      clearCurrentDraftTransactionId();

      await dismissLoading();
      await presentToast({
        message: "Print job submitted successfully!",
        duration: 3000,
        color: "success",
      });

      // Navigate to home or transaction detail page
      router.push("/home", "root", "replace");
    } catch (error) {
      console.error("Transaction creation failed:", error);

      await dismissLoading();
      await presentToast({
        message:
          error instanceof Error
            ? error.message
            : "Failed to submit print job. Please try again.",
        duration: 4000,
        color: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate total pages
  const totalPages = currentDraftTransaction.jobs.reduce(
    (total, job) => total + job.document.pageCount * job.copyCount,
    0,
  );

  const isOnline = vendorStatus === "online";

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton
              defaultHref={
                currentVendorId
                  ? `/home/printer/${currentVendorId.toString()}`
                  : "/home"
              }
            />
          </IonButtons>
          <IonTitle>Checkout</IonTitle>
        </IonToolbar>
      </IonHeader>
      <AppContent
        fullscreen
        scrollY={true}
        className="ion-padding flex min-h-full flex-col items-center justify-start gap-0"
      >
        <IonCard className="m-0 min-w-full bg-transparent px-4 pt-2 pb-6 shadow-none">
          <IonCardContent className="p-0!">
            <IonCardTitle>
              {isOnline ? "Printer Ready" : "Printer Offline"}
              <PulseIcon
                className="m-1 mt-0 align-middle"
                status={vendorStatus}
              />
            </IonCardTitle>
            <IonCardSubtitle color="medium">
              {/* TODO: Get vendor location from API */}
              Galgotias University, Greater Noida, UP
            </IonCardSubtitle>
          </IonCardContent>
        </IonCard>

        <IonButton
          expand="block"
          size="default"
          fill="solid"
          color="primary"
          onClick={() => {
            router.push("/home/checkout/print-settings");
          }}
          className="m-0 min-w-full"
          disabled={isSubmitting}
        >
          <IonIcon icon={settingsOutline} slot="start" />
          <IonLabel>Change Settings</IonLabel>
        </IonButton>

        <IonCard className="my-6 max-w-full min-w-full">
          <IonCardTitle className="px-5 pt-5">Documents</IonCardTitle>
          <IonCardContent className="p-0!">
            <IonGrid>
              {/* Header row */}
              <IonRow className="p-1.25">
                <IonCol
                  size="auto"
                  className="flex items-center justify-center"
                >
                  <IonIcon icon={document} className="invisible text-xl" />
                </IonCol>
                <IonCol className="min-w-0 flex-1 pl-2">
                  <IonText color="medium" className="text-sm font-medium">
                    Filename
                  </IonText>
                </IonCol>
                <IonCol size="auto" className="min-w-12 text-center">
                  <IonText color="medium" className="text-sm font-medium">
                    Copies
                  </IonText>
                </IonCol>
                <IonCol size="auto" className="min-w-16 text-center">
                  <IonText color="medium" className="text-sm font-medium">
                    Pages
                  </IonText>
                </IonCol>
              </IonRow>

              {/* Document rows */}
              {currentDraftTransaction.jobs.map((job) => (
                <IonRow key={job.id} className="p-1.25">
                  <IonCol
                    size="auto"
                    className="flex min-h-8 min-w-8 items-center justify-center"
                  >
                    <IonIcon icon={document} className="text-xl" />
                  </IonCol>
                  <IonCol className="flex min-w-0 flex-1 items-center pl-2">
                    <IonText
                      color="dark"
                      className="block truncate font-medium"
                      title={job.document.filename}
                    >
                      {job.document.filename}
                    </IonText>
                  </IonCol>
                  <IonCol size="auto" className="min-w-12 text-center">
                    {job.copyCount}
                  </IonCol>
                  <IonCol
                    size="auto"
                    className="min-w-16 text-center font-semibold"
                  >
                    {job.document.pageCount}
                  </IonCol>
                </IonRow>
              ))}

              {/* Total row */}
              <IonRow className="ion-align-items-center p-1.25 pt-4">
                <IonCol
                  size="auto"
                  className="flex min-h-8 min-w-8 items-center justify-center"
                >
                  <IonIcon icon={document} className="invisible text-xl" />
                </IonCol>
                <IonCol className="pl-2">
                  <IonText color="dark">
                    <strong>Total Pages</strong>
                  </IonText>
                </IonCol>
                <IonCol size="auto" className="min-w-12" />
                <IonCol size="auto" className="min-w-16 text-center">
                  <IonText color="dark">
                    <strong>{totalPages}</strong>
                  </IonText>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonCardContent>
        </IonCard>

        <IonButton
          expand="block"
          size="large"
          fill="solid"
          color="primary"
          className="mt-auto mb-0 min-w-full"
          onClick={() => void handleSubmit()}
          disabled={isSubmitting}
        >
          <IonIcon icon={printOutline} slot="start" />
          <IonLabel>
            {isSubmitting ? "Processing..." : "Start Printing"}
          </IonLabel>
        </IonButton>
      </AppContent>
    </IonPage>
  );
}
