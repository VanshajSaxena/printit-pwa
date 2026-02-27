import { PrintitIcon } from "@components/graphics/Printit";
import { QRCodeGraphic } from "@components/graphics/QRCodeGraphic";
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonRouter,
} from "@ionic/react";
import AppContent from "@layout/AppContent";
import {
  documentOutline,
  printOutline,
  qrCodeOutline,
  scan,
} from "ionicons/icons";
import "./HomePage.css";

const HomePage: React.FC = () => {
  const router = useIonRouter();
  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonTitle>
            <PrintitIcon width={80}></PrintitIcon>
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <AppContent fullscreen className="ion-padding h-full">
        <IonHeader collapse="condense">
          <IonToolbar>
            <PrintitIcon width={120}></PrintitIcon>
          </IonToolbar>
        </IonHeader>
        <div className="flex flex-col items-center justify-evenly pb-14">
          <IonCard className="scan-card my-4 max-w-full min-w-full">
            <IonCardContent>
              <div className="flex max-w-full min-w-full flex-col items-center gap-4">
                <QRCodeGraphic width={225} />
                <IonButton
                  size="default"
                  expand="block"
                  onClick={() => {
                    router.push("/scan", "none", "push");
                  }}
                >
                  Scan QR
                  <IonIcon slot="end" ios={scan} md={scan}></IonIcon>
                </IonButton>

                <IonNote className="text-center text-sm leading-relaxed">
                  You can find the QR code at your nearby Printit Shops. Tap to{" "}
                  <span
                    className="cursor-pointer font-medium"
                    style={{ color: "var(--ion-color-primary)" }}
                  >
                    Learn More.
                  </span>
                </IonNote>
              </div>
            </IonCardContent>
          </IonCard>
          <div className="w-full">
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 600,
                marginLeft: "0.5rem",
                marginTop: "0.5rem",
                color: "var(--ion-color-dark)",
              }}
            >
              How It Works
            </h2>

            <IonList
              lines="inset"
              inset
              className="how-it-works-list !mx-0 !my-3"
            >
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
        </div>
      </AppContent>
    </IonPage>
  );
};

export default HomePage;
