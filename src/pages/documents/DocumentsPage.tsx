import { IonHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import AppContent from "@layout/AppContent";
import React from "react";

const DocumentsPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonTitle>Documents</IonTitle>
        </IonToolbar>
      </IonHeader>

      <AppContent fullscreen className="ion-padding">
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Documents</IonTitle>
          </IonToolbar>
        </IonHeader>
      </AppContent>
    </IonPage>
  );
};

export default DocumentsPage;
