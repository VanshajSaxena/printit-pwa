import { PrinterGraphic } from "@components/graphics/PrinterGraphic";
import { PulseIcon } from "@components/graphics/PulseIcon";
import {
  IonBackButton,
  IonButton,
  IonButtons,
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
  useIonLoading,
  useIonRouter,
} from "@ionic/react";
import AppContent from "@layout/AppContent";
import { useDraftStore } from "@store/draftStore";
import { cloudUploadOutline } from "ionicons/icons";
import { ChangeEvent, useRef } from "react";

const SelectedPrinterPage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useIonRouter();
  const [present, dismiss] = useIonLoading();

  const createDraftTransaction = useDraftStore(
    (store) => store.createDraftTransaction,
  );

  const setCurrentDraftTransactionId = useDraftStore(
    (store) => store.setCurrentDraftTransactionId,
  );

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const eventTargetFiles = event.target.files;
    if (!eventTargetFiles || eventTargetFiles.length === 0) {
      return;
    }
    const selectedFiles = Array.from(eventTargetFiles);

    const onlyPdfFiles = selectedFiles.filter(
      (file) => file.type === "application/pdf",
    );

    await present();
    const transactionId = await createDraftTransaction(onlyPdfFiles);

    setCurrentDraftTransactionId(transactionId);
    await dismiss();
    event.target.value = "";
    router.push("/home/checkout");
  };

  const pickFiles = () => {
    fileInputRef.current?.click();
  };

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" text={"Home"} />
          </IonButtons>
          <IonTitle>Printer</IonTitle>
        </IonToolbar>
      </IonHeader>
      <AppContent
        fullscreen
        scrollY={true}
        className="ion-padding flex min-h-full flex-col items-center justify-between"
      >
        <IonCard>
          <IonCardHeader className="p-4">
            <div className="flex items-center gap-8">
              <PrinterGraphic />
              <div>
                <IonCardTitle className="flex items-center justify-start">
                  Printer Ready
                  <PulseIcon className="mt-0 min-h-8 min-w-8" />
                </IonCardTitle>
                <IonCardSubtitle>A&T Stationary</IonCardSubtitle>
              </div>
            </div>
          </IonCardHeader>
          <IonCardContent className="p-4">
            <div className="flex min-w-full justify-end">
              <IonLabel>Last Online: just now</IonLabel>
            </div>
          </IonCardContent>
        </IonCard>
        <div className="flex w-full max-w-full flex-col gap-4">
          <IonButton
            fill="solid"
            expand="block"
            size="large"
            color={"primary"}
            onClick={() => {
              pickFiles();
            }}
            className="m-0"
          >
            <IonIcon icon={cloudUploadOutline} slot="start"></IonIcon>
            <IonLabel>Upload Files</IonLabel>
          </IonButton>
          <IonNote className="mx-auto text-center">
            Your files are deleted after printing.{" "}
            <IonText>Learn More.</IonText>
          </IonNote>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={(event) => {
            void handleFileChange(event);
          }}
          style={{ display: "none" }}
          multiple
          accept=".pdf"
        />
      </AppContent>
    </IonPage>
  );
};

export default SelectedPrinterPage;
