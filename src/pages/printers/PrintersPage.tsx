import { IonHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import AppContent from "@layout/AppContent";

const Printers: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Printers</IonTitle>
        </IonToolbar>
      </IonHeader>
      <AppContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Printers</IonTitle>
          </IonToolbar>
        </IonHeader>
      </AppContent>
    </IonPage>
  );
};

export default Printers;
