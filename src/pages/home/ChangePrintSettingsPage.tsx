import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonGrid,
  IonHeader,
  IonIcon,
  IonLabel,
  IonList,
  IonListHeader,
  IonNote,
  IonPage,
  IonRadio,
  IonRadioGroup,
  IonRow,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import AppContent from "@layout/AppContent";
import { add, chevronForward, document, remove } from "ionicons/icons";
import { useState } from "react";

import "./ChangePrintSettingsPage.css";

export function ChangePrintSettingsPage() {
  const [selected, setSelected] = useState<string | null>("standard");
  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonTitle>Print Settings</IonTitle>
          <IonButtons slot="end">
            <IonButton
              size="default"
              routerLink="/home/checkout"
              routerDirection="back"
            >
              Done
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <AppContent
        fullscreen
        className="ion-padding flex min-h-full flex-col items-center justify-start gap-0"
      >
        <IonList className="flex max-w-full min-w-full flex-col bg-transparent! py-0!">
          <IonRadioGroup
            allowEmptySelection={false}
            value={selected}
            onIonChange={(event) => {
              setSelected(event.target.value as string);
            }}
          >
            <IonListHeader className="flex items-center justify-center">
              Presets
              <IonNote className="ml-4 truncate">
                (Applies to all documents)
              </IonNote>
            </IonListHeader>
            <IonCard
              className={`mx-0 mt-4 mb-0 flex items-center justify-between shadow-none ${selected === "standard" ? "selected-card" : "bg-transparent"}`}
            >
              <IonRadio
                className="min-h-full min-w-full pr-5"
                value={"standard"}
              >
                <IonCardHeader className="p-4">
                  <IonCardTitle className="truncate">
                    Standard Print
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent className="truncate p-4">
                  <IonLabel>Black and White • Single Copy</IonLabel>
                </IonCardContent>
              </IonRadio>
            </IonCard>
            <IonCard
              className={`m-0 flex items-center justify-between shadow-none ${selected === "color" ? "selected-card" : "bg-transparent"}`}
            >
              <IonRadio className="min-h-full min-w-full pr-5" value={"color"}>
                <IonCardHeader className="p-4">
                  <IonCardTitle className="truncate">Color Print</IonCardTitle>
                </IonCardHeader>
                <IonCardContent className="truncate p-4">
                  <IonLabel>Color • Single Copy</IonLabel>
                </IonCardContent>
              </IonRadio>
            </IonCard>
          </IonRadioGroup>
        </IonList>
        <IonCard className="min-w-full">
          <IonCardContent className="p-4!">
            <IonGrid className="p-0">
              <IonRow>
                <IonCol
                  size="auto"
                  className="flex items-center justify-center"
                >
                  <IonIcon icon={document} className="text-2xl" />
                </IonCol>
                <IonCol className="flex min-w-0 flex-1 items-center pl-2">
                  <IonText
                    color={"dark"}
                    className="block truncate font-medium"
                  >
                    Final Year Dissertation
                  </IonText>
                </IonCol>
                <IonCol
                  size="auto"
                  className="flex items-center justify-center"
                >
                  <IonIcon icon={chevronForward} className="text-xl"></IonIcon>
                </IonCol>
              </IonRow>
              <IonRow className="mt-2">
                <IonCol className="flex items-center justify-between">
                  <IonText color={"dark"}>Copies</IonText>
                  <div className="flex items-center justify-between gap-4">
                    <IonButton size="small" fill="solid" color={"light"}>
                      <IonIcon
                        icon={remove}
                        className="text-xl"
                        color="dark"
                      ></IonIcon>
                    </IonButton>
                    <IonText color={"dark"}>1</IonText>
                    <IonButton size="small" fill="solid" color={"light"}>
                      <IonIcon
                        icon={add}
                        className="text-xl"
                        color="dark"
                      ></IonIcon>
                    </IonButton>
                  </div>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonCardContent>
        </IonCard>
      </AppContent>
    </IonPage>
  );
}
