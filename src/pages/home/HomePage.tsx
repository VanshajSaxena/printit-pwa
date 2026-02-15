import {
  IonButton,
  IonHeader,
  IonIcon,
  IonNote,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonRouter,
} from "@ionic/react";
import AppContent from "@layout/AppContent";
import { scan } from "ionicons/icons";

const HomePage: React.FC = () => {
  const router = useIonRouter();
  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonTitle>Home</IonTitle>
        </IonToolbar>
      </IonHeader>
      <AppContent
        fullscreen
        className="ion-padding flex min-h-full flex-col items-center justify-evenly"
      >
        <h1>Scan the QR code to start</h1>

        <div className="flex w-full max-w-xs flex-col gap-4">
          <IonButton
            size="large"
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
            <span className="cursor-pointer font-medium">Learn More.</span>
          </IonNote>
        </div>
      </AppContent>
    </IonPage>
  );
};

export default HomePage;
