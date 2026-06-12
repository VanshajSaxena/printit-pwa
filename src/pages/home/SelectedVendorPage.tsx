import { client } from "@api/client";
import { PrinterGraphic } from "@components/graphics/PrinterGraphic";
import { PulseIcon } from "@components/graphics/PulseIcon";
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardSubtitle,
  IonHeader,
  IonIcon,
  IonLabel,
  IonNote,
  IonPage,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
  useIonLoading,
  useIonRouter,
} from "@ionic/react";
import AppContent from "@layout/AppContent";
import { useDraftStore } from "@store/draftStore";
import { usePresenceStore } from "@store/presenceStore";
import { useVendorStore } from "@store/vendorStore";
import { createDraftTransaction } from "@utils/createDraftTransaction";
import {
  alertCircle,
  arrowBack,
  arrowBackOutline,
  cloudUploadOutline,
  printOutline,
} from "ionicons/icons";
import { ChangeEvent, useEffect, useRef } from "react";
import { useParams } from "react-router";

interface SelectedPrinterPageProps {
  selector: string;
}

export default function SelectedVendorPage() {
  const { selector } = useParams<SelectedPrinterPageProps>();
  const router = useIonRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [present, dismiss] = useIonLoading();

  const upsertVendor = useVendorStore((store) => store.upsertVendor);
  const setPresence = usePresenceStore((store) => store.setPresence);
  const setCurrentDraftTransactionId = useDraftStore(
    (store) => store.setCurrentDraftTransactionId,
  );

  const vendorProfile = useVendorStore((store) => store.getVendor(selector));

  const vendorId = vendorProfile?.id;
  const presenceStatus = usePresenceStore((store) =>
    vendorId ? store.getPresence(vendorId) : undefined,
  );

  const {
    data: vendorData,
    error,
    isLoading,
  } = client.useQuery(
    "get",
    "/api/v1/vendors/{selector}",
    { params: { path: { selector } } },
    {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 5 * 60 * 1000,
    },
  );

  const { data: presenceData } = client.useQuery(
    "get",
    "/api/v1/vendors/{selector}/presence",
    { params: { path: { selector } } },
    { refetchOnWindowFocus: false },
  );

  useEffect(() => {
    if (vendorData) {
      const {
        id,
        firstName,
        lastName,
        displayName,
        username,
        slug,
        address,
        location,
      } = vendorData;
      upsertVendor({
        id,
        firstName,
        lastName,
        displayName,
        username,
        slug,
        address,
        location,
      });
    }
  }, [vendorData, upsertVendor]);

  useEffect(() => {
    if (presenceData && vendorData) {
      setPresence(vendorData.id, presenceData.status);
    }
  }, [presenceData, vendorData, setPresence]);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!vendorId) {
      console.error("Vendor not loaded yet");
      return;
    }

    const eventTargetFiles = event.target.files;
    if (!eventTargetFiles || eventTargetFiles.length === 0) return;

    const selectedFiles = Array.from(eventTargetFiles);
    const onlyPdfFiles = selectedFiles.filter(
      (file) => file.type === "application/pdf",
    );

    if (onlyPdfFiles.length === 0) return;

    await present({ message: "Processing files..." });

    try {
      const transactionId = await createDraftTransaction(
        onlyPdfFiles,
        vendorId,
      );

      setCurrentDraftTransactionId(transactionId);

      router.push(`/${router.routeInfo.tab ?? "home"}/checkout`);
    } catch (error) {
      console.error("Failed to process files:", error);
    } finally {
      event.target.value = "";
      await dismiss();
    }
  };

  const pickFiles = () => {
    fileInputRef.current?.click();
  };

  if (error) {
    return (
      <IonPage>
        <IonHeader translucent>
          <IonToolbar>
            <IonTitle>Printer Not Found</IonTitle>
          </IonToolbar>
        </IonHeader>
        <AppContent
          fullscreen
          className="ion-padding flex min-h-full flex-col justify-center"
        >
          <div className="text-center">
            <IonIcon icon={printOutline} className="text-5xl" />
            <p className="my-2 text-lg font-semibold">
              Oops! That printer isn't here.
            </p>
            <IonNote color="medium">
              It might have been removed or isn't available anymore.
            </IonNote>
            <IonButton
              expand="block"
              fill="solid"
              className="my-8"
              onClick={() => {
                router.push("/home", "back", "pop");
              }}
            >
              <IonIcon icon={arrowBackOutline} slot="start" />
              Go Back
            </IonButton>
          </div>
        </AppContent>
      </IonPage>
    );
  }

  if (isLoading && !vendorProfile) {
    return (
      <IonPage>
        <IonHeader translucent>
          <IonToolbar>
            <IonTitle>Printer</IonTitle>
          </IonToolbar>
        </IonHeader>
        <AppContent
          fullscreen
          className="ion-padding flex min-h-full items-center justify-center"
        >
          <IonSpinner />
        </AppContent>
      </IonPage>
    );
  }

  const isOnline = presenceStatus === "online";
  const displayName =
    vendorProfile?.displayName ??
    `${vendorProfile?.firstName ?? ""} ${vendorProfile?.lastName ?? ""}`.trim();

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={`/${router.routeInfo.tab ?? "home"}`}>
              <IonIcon slot="start" icon={arrowBack} />
            </IonBackButton>
          </IonButtons>
          <IonTitle>Printer</IonTitle>
        </IonToolbar>
      </IonHeader>
      <AppContent
        fullscreen
        scrollY={true}
        className="ion-padding flex min-h-full flex-col items-center justify-between"
      >
        <IonCard className="w-full">
          <IonCardContent className="!p-4">
            <div
              className="grid items-start gap-6"
              style={{
                gridTemplateColumns: "minmax(120px, 25%) 1fr",
              }}
            >
              <div className="h-auto w-full">
                <PrinterGraphic height={130} />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <h2
                      style={{
                        fontSize: "20px",
                        fontWeight: 600,
                        color: "var(--ion-color-dark)",
                      }}
                    >
                      {isOnline ? "Printer Ready" : "Printer Offline"}
                    </h2>

                    <IonCardSubtitle>{displayName}</IonCardSubtitle>
                  </div>

                  {isOnline && <PulseIcon status={presenceStatus} />}
                  {!isOnline && (
                    <IonIcon
                      icon={alertCircle}
                      color="danger"
                      className="text-4xl"
                    />
                  )}
                </div>

                {!isOnline && (
                  <p
                    style={{
                      marginTop: "0.5rem",
                      fontWeight: 600,
                      fontSize: "14px",
                      color: "var(--ion-color-danger-tint)",
                    }}
                  >
                    This printer is currently unavailable.
                  </p>
                )}
              </div>
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
