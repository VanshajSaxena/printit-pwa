import {
  IonAlert,
  IonButton,
  IonContent,
  IonIcon,
  IonPage,
  useIonRouter,
  useIonViewWillEnter,
  useIonViewWillLeave,
} from "@ionic/react";
import type { BrowserQRCodeReader, IScannerControls } from "@zxing/browser";
import { close } from "ionicons/icons";
import { useRef, useState } from "react";
import "./ScanPage.css";

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlRef = useRef<IScannerControls | null>(null);
  const readerRef = useRef<BrowserQRCodeReader | null>(null);
  const deploymentUrl = import.meta.env.VITE_DEPLOY_PRIME_URL;
  const router = useIonRouter();

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useIonViewWillEnter(() => {
    setIsLoading(true);
    void startScanning();
  });

  useIonViewWillLeave(() => {
    stopScanning();
  });

  async function startScanning() {
    if (controlRef.current) return;

    try {
      const { BrowserQRCodeReader } = await import("@zxing/browser");

      readerRef.current ??= new BrowserQRCodeReader();

      const codeReader = readerRef.current;

      if (!videoRef.current) return;

      const controls = await codeReader.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result) => {
          if (result) {
            handleScanResult(result.getText());
          }
        },
      );
      controlRef.current = controls;
    } catch (error) {
      console.error("Error starting scanner:", error);
      setIsLoading(false);
    }
  }

  function handleScanResult(decodedText: string) {
    try {
      const url = new URL(decodedText);
      const origin = url.origin;

      if (origin !== deploymentUrl) {
        stopScanning();
        setIsAlertOpen(true);
        return;
      }

      const paths = url.pathname.split("/");
      const selectorIndex = paths.findIndex((path) => path === "printer");

      if (selectorIndex === -1 || !paths[selectorIndex + 1]) {
        stopScanning();
        setIsAlertOpen(true);
        return;
      }

      const printerId = paths[selectorIndex + 1];

      stopScanning();
      router.push(`/home/printer/${printerId}`, "forward", "replace");
    } catch {
      stopScanning();
      setIsAlertOpen(true);
    }
  }

  function stopScanning() {
    if (controlRef.current) {
      controlRef.current.stop();
      controlRef.current = null;
    }
  }

  return (
    <IonPage>
      <IonContent scrollY={false}>
        <div className="relative h-screen w-screen overflow-hidden bg-black">
          <video
            ref={videoRef}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
              isLoading ? "opacity-0" : "opacity-100"
            }`}
            muted
            autoPlay
            playsInline
            onPlaying={() => {
              setIsLoading(false);
            }}
          />

          <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center">
            <p className="mb-12 text-base font-medium text-white drop-shadow-md">
              Position the QR code within the frame
            </p>

            <div className="relative">
              <div className="relative z-0 size-64 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] md:size-72"></div>

              <div className="absolute top-1/2 left-1/2 size-72 -translate-x-1/2 -translate-y-1/2 md:size-80">
                <div className="absolute top-0 left-0 h-8 w-8 rounded-tl-lg border-t-2 border-l-[3px] border-white"></div>
                <div className="absolute top-0 right-0 h-8 w-8 rounded-tr-lg border-t-2 border-r-[3px] border-white"></div>
                <div className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-lg border-b-2 border-l-[3px] border-white"></div>
                <div className="absolute right-0 bottom-0 h-8 w-8 rounded-br-lg border-r-2 border-b-[3px] border-white"></div>
              </div>
            </div>
          </div>

          <div className="scan-back-button-container">
            <IonButton
              color="light"
              shape="round"
              className="size-12"
              onClick={() => {
                stopScanning();
                router.goBack();
              }}
            >
              <IonIcon slot="icon-only" icon={close} size="small" />
            </IonButton>
          </div>
        </div>

        <IonAlert
          isOpen={isAlertOpen}
          header="Invalid QR Code"
          message="Looks like you are scanning an unsupported QR code."
          buttons={[
            {
              text: "Cancel",
              role: "cancel",
              handler: () => {
                setIsAlertOpen(false);
                router.goBack();
              },
            },
            {
              text: "Try Again",
              handler: () => {
                setIsAlertOpen(false);
                void startScanning();
              },
            },
          ]}
          onDidDismiss={() => {
            setIsAlertOpen(false);
          }}
        />
      </IonContent>
    </IonPage>
  );
}
