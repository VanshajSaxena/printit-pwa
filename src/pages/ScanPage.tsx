import {
  IonButton,
  IonContent,
  IonIcon,
  IonPage,
  useIonViewDidEnter,
  useIonViewDidLeave,
  useIonViewWillLeave,
} from "@ionic/react";
import type { BrowserQRCodeReader, IScannerControls } from "@zxing/browser";
import { close } from "ionicons/icons";
import { useRef } from "react";
import { useHistory } from "react-router-dom";

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlRef = useRef<IScannerControls | null>(null);
  const readerRef = useRef<BrowserQRCodeReader | null>(null);

  const history = useHistory();

  useIonViewDidEnter(() => {
    startScanning();
  });

  useIonViewDidLeave(() => {
    stopScanning();
  });
  useIonViewWillLeave(() => {
    stopScanning();
  });

  async function startScanning() {
    if (controlRef.current) return;

    try {
      const { BrowserQRCodeReader } = await import("@zxing/browser");
      const codeReader = new BrowserQRCodeReader();
      readerRef.current = codeReader;

      if (!videoRef.current) return;

      const controls = await codeReader.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result) => {
          if (result) {
            const decodedText = result.getText();
            try {
              const url = new URL(decodedText);
              const paths = url.pathname.split("/");
              if (paths[2]) {
                stopScanning();
                history.push(`/profile/${paths[2]}`);
              }
            } catch {
              console.warn("Invalid URL scanned");
            }
          }
        },
      );
      controlRef.current = controls;
    } catch (error) {
      console.error("Error starting scanner:", error);
    }
  }

  function stopScanning() {
    if (controlRef.current) {
      controlRef.current.stop();
      controlRef.current = null;
    }
    readerRef.current = null;
  }

  return (
    <IonPage>
      <IonContent>
        <div className="relative h-screen w-screen overflow-hidden bg-black">
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            muted
            autoPlay
            playsInline
          />

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="z-10 mb-12 text-base font-medium text-white drop-shadow-md">
              Position the QR code within the frame
            </p>
            <div className="relative">
              <div className="relative z-0 size-64 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] md:size-72"></div>

              <div className="pointer-events-none absolute top-1/2 left-1/2 size-72 -translate-x-1/2 -translate-y-1/2 md:size-80">
                <div className="absolute top-0 left-0 h-8 w-8 rounded-tl-lg border-t-2 border-l-[3px] border-white"></div>
                <div className="absolute top-0 right-0 h-8 w-8 rounded-tr-lg border-t-2 border-r-[3px] border-white"></div>
                <div className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-lg border-b-2 border-l-[3px] border-white"></div>
                <div className="absolute right-0 bottom-0 h-8 w-8 rounded-br-lg border-r-2 border-b-[3px] border-white"></div>
              </div>
            </div>
          </div>

          <IonButton
            color={"light"}
            shape={"round"}
            className="--padding-start-0 --padding-end-0 absolute top-6 right-6 size-12"
            onClick={() => {
              history.goBack();
              stopScanning();
            }}
          >
            <IonIcon slot="icon-only" icon={close} size={"small"}></IonIcon>
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
}
