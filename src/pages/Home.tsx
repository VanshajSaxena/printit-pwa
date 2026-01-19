import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
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
      <IonContent fullscreen>
        <div className="tw:size-full tw:flex tw:items-center tw:justify-center ion-padding">
          <IonButton size="large">
            Start QR
            <IonIcon slot="end" ios={scan} md={scan}></IonIcon>
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
