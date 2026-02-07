import { client } from "@api/client";
import { PrinterGraphic } from "@components/graphics/PrinterGraphic";
import { PulseIcon } from "@components/graphics/PulseIcon";
import { useCurrentVendorPresence } from "@hooks/usePresence";
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
import { usePresenceStore } from "@store/presenceStore";
import { cloudUploadOutline } from "ionicons/icons";
import { ChangeEvent, useEffect, useRef } from "react";
import { Redirect, useParams } from "react-router";

interface SelectedPrinterPageProps {
  selector: string;
}

export default function SelectedPrinterPage() {
  const { selector } = useParams<SelectedPrinterPageProps>();
  const router = useIonRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [present, dismiss] = useIonLoading();

  const currentVendorId = usePresenceStore((store) => store.currentVendorId);

  const vendorStatus = useCurrentVendorPresence();

  const setPresence = usePresenceStore((store) => store.setPresence);

  const { data, status } = client.useQuery(
    "get",
    "/api/v1/vendors/{selector}/presence",
    { params: { path: { selector } } },
    {
      refetchOnWindowFocus: false,
      enabled: !!currentVendorId,
    },
  );

  useEffect(() => {
    if (data?.id) {
      setPresence(data.id, data.status);
    }
  }, [data, setPresence]);

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

    if (onlyPdfFiles.length === 0) {
      return;
    }

    await present({ message: "Uploading files..." });

    try {
      const transactionId = await createDraftTransaction(
        onlyPdfFiles,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        currentVendorId!,
      );
      setCurrentDraftTransactionId(transactionId);
      await dismiss();
      event.target.value = "";
      router.push("/home/checkout");
    } catch (error) {
      await dismiss();
      console.error("Failed to create draft transaction:", error);
    }
  };

  const pickFiles = () => {
    fileInputRef.current?.click();
  };

  if (status === "error") {
    return <Redirect to="/home" />;
  }

  const isOnline = vendorStatus === "online";

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" text="Home" />
          </IonButtons>
          <IonTitle>Printer</IonTitle>
        </IonToolbar>
      </IonHeader>
      <AppContent
        fullscreen
        scrollY={true}
        className="ion-padding flex min-h-full flex-col items-center justify-between"
      >
        <IonCard className="max-w-full min-w-full">
          <IonCardHeader className="p-4">
            <div className="flex items-center gap-8">
              <PrinterGraphic />
              <div>
                <IonCardTitle className="flex items-center justify-start gap-2">
                  {isOnline ? "Printer Ready" : "Printer Offline"}
                  <PulseIcon
                    className="mt-0 min-h-8 min-w-8"
                    status={vendorStatus}
                  />
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
            color="primary"
            onClick={pickFiles}
            className="m-0"
          >
            <IonIcon icon={cloudUploadOutline} slot="start" />
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
          onChange={(event) => void handleFileChange(event)}
          style={{ display: "none" }}
          multiple
          accept=".pdf"
        />
      </AppContent>
    </IonPage>
  );
}
