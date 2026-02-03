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
} from "@ionic/react";
import AppContent from "@layout/AppContent";
import { useDraftStore } from "@store/draftStore";
import { document, printOutline, settingsOutline } from "ionicons/icons";

export default function CheckoutPage() {
  const router = useIonRouter();
  const getCurrentDraftTransactionId = useDraftStore(
    (store) => store.getCurrentDraftTransactionId,
  );
  const currentDraftTransactionId = getCurrentDraftTransactionId();

  if (!currentDraftTransactionId) {
    // This should never happen because we have a guard.
    throw Error("CurrentDraftTransactionId doesn't exist");
  }

  const currentDraftTransaction = useDraftStore((store) => {
    return store.state.transactions[currentDraftTransactionId];
  });

  const documentsMutation = client.useMutation("post", "/api/v1/documents");
  const filesMutation = client.useMutation("post", "/api/v1/files/upload");

  const handleSubmit = async () => {
    const draftDocuments = currentDraftTransaction.jobs.map(
      ({ document: draft }) => {
        return {
          filename: draft.filename,
          contentType: draft.contentType,
          draftId: draft.id,
        };
      },
    );

    const { documents } = await documentsMutation.mutateAsync({
      body: { documents: draftDocuments },
    });

    const { signedUrls } = await filesMutation.mutateAsync({
      body: {
        ids: documents.map((document) => document.id),
      },
    });

    try {
      await Promise.all(
        signedUrls.map(async ({ url, id }) => {
          const document = documents.find((document) => document.id == id);

          if (!document) {
            throw Error("A document was not found.");
          }

          const file = currentDraftTransaction.jobs.find(
            ({ document: draftDocument }) =>
              draftDocument.id == document.draftId,
          )?.document.file;

          if (!file) {
            throw Error("Persisted file no longer in storage.");
          }

          const uploadResponse = await fetch(url, {
            method: "PUT",
            headers: { "Content-Type": file.type },
            body: file,
          });

          if (!uploadResponse.ok) {
            throw new Error(`Upload Failed for ${file.name}`);
          }
          return true;
        }),
      );
    } catch (error) {
      console.error(error);
      console.error("Upload failed.");
      return;
    }
    alert("uplaod successfull");
  };

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonButtons slot="start">
            {/* MARK: Back button might later need a reference to the printer id. */}
            <IonBackButton defaultHref="/home/printer/1" />
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
              Printer Ready
              <PulseIcon className="m-1 mt-0 align-middle"></PulseIcon>
            </IonCardTitle>
            <IonCardSubtitle color={"medium"}>
              Galgotias University, Greater Noida, UP
            </IonCardSubtitle>
          </IonCardContent>
        </IonCard>
        <IonButton
          expand="block"
          size="default"
          fill="solid"
          color={"primary"}
          onClick={() => {
            router.push("/home/checkout/print-settings");
          }}
          className="m-0 min-w-full"
        >
          <IonLabel>Change Settings</IonLabel>
          <IonIcon icon={settingsOutline} slot="start"></IonIcon>
        </IonButton>
        <IonCard className="my-6 max-w-full min-w-full">
          <IonCardTitle className="px-5 pt-5">Documents</IonCardTitle>

          <IonCardContent className="p-0!">
            <IonGrid>
              <IonRow className="p-1.25">
                <IonCol
                  size="auto"
                  className="flex items-center justify-center"
                >
                  <IonIcon icon={document} className="hidden text-xl" />
                </IonCol>

                <IonCol className="min-w-0 flex-1 pl-2">
                  <IonText color="dark" className="hidden truncate font-medium">
                    title text
                  </IonText>
                </IonCol>

                <IonCol size="auto" className="min-w-12 text-center text-sm">
                  Copies
                </IonCol>

                <IonCol size="auto" className="min-w-16 text-center text-sm">
                  Pages
                </IonCol>
              </IonRow>
              {currentDraftTransaction.jobs.map((job) => {
                return (
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
                );
              })}

              <IonRow className="ion-align-items-center p-1.25 pt-4">
                <IonCol
                  size="auto"
                  className="flex min-h-8 min-w-8 items-center justify-center"
                >
                  <IonIcon icon={document} className="hidden text-xl" />
                </IonCol>
                <IonCol className="pl-2">
                  <strong>Total Pages</strong>
                </IonCol>
                <IonCol className="max-w-16 text-center">
                  <strong>
                    {currentDraftTransaction.jobs.reduce(
                      (total, job) =>
                        total + job.document.pageCount * job.copyCount,
                      0,
                    )}
                  </strong>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonCardContent>
        </IonCard>

        <IonButton
          expand="block"
          size="large"
          fill="solid"
          color={"primary"}
          className="mt-auto mb-0 min-w-full"
          onClick={() => {
            void handleSubmit();
          }}
        >
          <IonLabel>Start Printing</IonLabel>
          <IonIcon icon={printOutline} slot="start"></IonIcon>
        </IonButton>
      </AppContent>
    </IonPage>
  );
}
