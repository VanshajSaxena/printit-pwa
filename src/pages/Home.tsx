import {
  IonButton,
  IonHeader,
  IonIcon,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { scan } from "ionicons/icons";
import AppContent from "./AppContent";
import "./Home.css";

const Home: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Home</IonTitle>
        </IonToolbar>
      </IonHeader>
      <AppContent fullscreen scrollY={false}>
        <div className="flex flex-col items-center justify-start gap-4 p-2 sm:gap-6 sm:p-2 md:gap-8 md:p-4 lg:gap-10 lg:p-6 xl:gap-12 xl:p-8 2xl:gap-14 2xl:p-10">
          <h3 className="text-center">Scan the QR code to start</h3>
          <IonButton size="large" routerLink="/scan" routerDirection="root">
            Scan QR
            <IonIcon slot="end" ios={scan} md={scan}></IonIcon>
          </IonButton>
          <p className="text-center text-sm">
            You can find the QR code at your nearby prints shop. Tap to{" "}
            <IonText color="primary" className="cursor-pointer font-medium">
              Learn More.
            </IonText>
          </p>
        </div>
      </AppContent>
    </IonPage>
  );
};

export default Home;
