import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
  IonText,
} from "@ionic/react";
import { scan } from "ionicons/icons";
import "./Home.css";

const Home: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Home</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen scrollY={false}>
        <div className="ion-padding flex flex-col items-center justify-start gap-4">
          <h3>Scan the QR code to start</h3>
          <IonButton size="large">
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
      </IonContent>
    </IonPage>
  );
};

export default Home;
