import { Dialog } from "@components/Dialog";
import { PrintitIcon } from "@components/graphics/Printit";
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonRouter,
} from "@ionic/react";
import AppContent from "@layout/AppContent";
import {
  cameraOutline,
  chevronForwardOutline,
  documentOutline,
  documentTextOutline,
  helpCircleOutline,
  locationOutline,
  printOutline,
  qrCodeOutline,
} from "ionicons/icons";
import { useEffect, useState } from "react";
import "./HomePage.css";

const HomePage: React.FC = () => {
  const [hiw, setHiw] = useState(false);
  const router = useIonRouter();
  const selectPrintersTab = () => {
    setTimeout(() => {
      router.push("/printers", "none", "push");
    }, 250);
  };

  useEffect(() => {
    const handler = (event: Event) => {
      const e = event as CustomEvent<string>;
      router.push(e.detail);
    };

    window.addEventListener("navigate", handler);

    return () => {
      window.removeEventListener("navigate", handler);
    };
  }, [router]);

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonTitle>
            <PrintitIcon width={80}></PrintitIcon>
          </IonTitle>
          <IonButtons slot="end">
            <IonButton
              onClick={() => {
                setHiw(true);
              }}
              aria-label="How it works"
            >
              <IonIcon slot="icon-only" icon={helpCircleOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <AppContent fullscreen className="ion-padding">
        <IonHeader collapse="condense">
          <IonToolbar>
            <PrintitIcon width={120}></PrintitIcon>
          </IonToolbar>
        </IonHeader>

        <div className="ml-auto flex w-full flex-col gap-6 pt-8 pb-24 md:pt-12 lg:pt-16 xl:pt-20">
          <div className="grid w-full grid-cols-2 justify-end gap-4">
            <IonCard
              button
              color="brand-blue"
              className="m-0 w-full shadow-lg"
              onClick={() => {
                // TODO: Handle navigation/action for printing documents
              }}
            >
              <IonCardContent className="flex h-full flex-col justify-between !p-4 sm:!p-6">
                <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-black/15 shadow-inner sm:mb-8 sm:size-16">
                  <IonIcon
                    icon={documentTextOutline}
                    className="text-2xl text-white sm:text-3xl"
                  />
                </div>
                <div className="flex w-full flex-col">
                  <div className="flex w-full items-center justify-between">
                    <h2 className="m-0 text-2xl font-bold tracking-wide text-white">
                      Upload & Print
                    </h2>
                    <IonIcon
                      icon={chevronForwardOutline}
                      className="text-2xl text-white/70 sm:text-3xl"
                    />
                  </div>
                  <p className="m-0 mt-1 hidden text-sm font-medium text-white/80">
                    Print files from your device
                  </p>
                </div>
              </IonCardContent>
            </IonCard>

            <IonCard
              button
              color="brand-purple"
              className="m-0 w-full shadow-lg"
              onClick={() => {
                selectPrintersTab();
              }}
            >
              <IonCardContent className="flex h-full flex-col justify-between !p-4 sm:!p-6">
                <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-black/15 shadow-inner sm:mb-8 sm:size-16">
                  <IonIcon
                    icon={locationOutline}
                    className="text-2xl text-white sm:text-3xl"
                  />
                </div>
                <div className="flex w-full flex-col">
                  <div className="flex w-full items-center justify-between">
                    <h2 className="m-0 text-2xl font-bold tracking-wide text-white">
                      Nearby Shops
                    </h2>
                    <IonIcon
                      icon={chevronForwardOutline}
                      className="text-2xl text-white/70 sm:text-3xl"
                    />
                  </div>
                  <p className="m-0 mt-1 hidden text-sm font-medium text-white/80">
                    Locate a Printit printer
                  </p>
                </div>
              </IonCardContent>
            </IonCard>

            <IonCard
              button
              color="brand-pink"
              className="col-start-2 m-0 w-full shadow-lg"
              onClick={() => {
                router.push("/scan", "none", "push");
              }}
            >
              <IonCardContent className="flex h-full flex-col justify-between !p-4 sm:!p-6">
                <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-black/15 shadow-inner sm:mb-8 sm:size-16">
                  <IonIcon
                    icon={qrCodeOutline}
                    className="text-2xl text-white sm:text-3xl"
                  />
                </div>
                <div className="flex w-full flex-col">
                  <div className="flex w-full items-center justify-between">
                    <h2 className="m-0 text-2xl font-bold tracking-wide text-white">
                      Connect
                    </h2>
                    <IonIcon
                      icon={chevronForwardOutline}
                      className="text-2xl text-white/70 sm:text-3xl"
                    />
                  </div>
                  <p className="m-0 mt-1 hidden text-sm font-medium text-white/80">
                    Scan a machine's QR code
                  </p>
                </div>
              </IonCardContent>
            </IonCard>
          </div>
        </div>

        {hiw && (
          <HowItWorks
            onDismiss={() => {
              setHiw(false);
            }}
          />
        )}
      </AppContent>

      <IonFab slot="fixed" vertical="bottom" horizontal="end">
        <IonFabButton
          color="brand-blue"
          onClick={() => {
            router.push("/scan", "none", "push");
          }}
        >
          <IonIcon icon={cameraOutline} style={{ fontSize: "1.75rem" }} />
        </IonFabButton>
      </IonFab>
    </IonPage>
  );
};

interface HowItWorksProps {
  onDismiss: () => void;
}

function HowItWorks({ onDismiss }: HowItWorksProps) {
  return (
    <Dialog onDismiss={onDismiss} ariaLabel="">
      <div className="w-full">
        <IonList lines="inset" inset className="how-it-works-list !mx-0 !my-0">
          <IonItem
            detail={false}
            style={{
              "--inner-padding-top": "0.5rem",
              "--inner-padding-bottom": "0.5rem",
            }}
          >
            <IonIcon
              icon={qrCodeOutline}
              slot="start"
              color="primary"
              className="text-2xl"
            />

            <IonLabel>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "var(--ion-color-dark)",
                }}
              >
                1. Scan QR Code
              </div>

              <div
                style={{
                  marginTop: "4px",
                  fontSize: "14px",
                  color: "var(--ion-color-medium)",
                }}
              >
                Find a QR code at any Printit Shop or kiosk
              </div>
            </IonLabel>
          </IonItem>

          <IonItem
            detail={false}
            style={{
              "--inner-padding-top": "0.5rem",
              "--inner-padding-bottom": "0.5rem",
            }}
          >
            <IonIcon
              icon={documentOutline}
              slot="start"
              color="primary"
              className="text-2xl"
            />

            <IonLabel>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "var(--ion-color-dark)",
                }}
              >
                2. Upload Documents
              </div>

              <div
                style={{
                  marginTop: "4px",
                  fontSize: "14px",
                  color: "var(--ion-color-medium)",
                }}
              >
                Choose files from your device or cloud storage
              </div>
            </IonLabel>
          </IonItem>

          <IonItem
            detail={false}
            style={{
              "--inner-padding-top": "0.5rem",
              "--inner-padding-bottom": "0.5rem",
            }}
          >
            <IonIcon
              icon={printOutline}
              slot="start"
              color="primary"
              className="text-2xl"
            />

            <IonLabel>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "var(--ion-color-dark)",
                }}
              >
                3. Collect Printouts
              </div>

              <div
                style={{
                  marginTop: "4px",
                  fontSize: "14px",
                  color: "var(--ion-color-medium)",
                }}
              >
                Pick up your prints at the selected location
              </div>
            </IonLabel>
          </IonItem>
        </IonList>
      </div>
    </Dialog>
  );
}

export default HomePage;
