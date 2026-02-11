import {
  IonBackButton,
  IonButtons,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonRadio,
  IonRadioGroup,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import AppContent from "@layout/AppContent";
import { useSettingsStore } from "@store/settingsStore";

export default function AppearanceModePage() {
  const currentMode = useSettingsStore((state) => state.mode);
  const setMode = useSettingsStore((state) => state.setMode);

  const handleModeChange = (mode: "ios" | "md") => {
    setMode(mode);
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton
              defaultHref="/settings/appearance"
              text="Appearance"
            />
          </IonButtons>
          <IonTitle>Device Mode</IonTitle>
        </IonToolbar>
      </IonHeader>
      <AppContent fullscreen>
        <IonList inset className="py-0!">
          <IonRadioGroup
            value={currentMode}
            onIonChange={(e) => {
              handleModeChange(e.detail.value as "ios" | "md");
            }}
          >
            <IonItem>
              <IonLabel>Apple (iOS)</IonLabel>
              <IonRadio slot="end" value="ios" />
            </IonItem>
            <IonItem>
              <IonLabel>Android (Material)</IonLabel>
              <IonRadio slot="end" value="md" />
            </IonItem>
          </IonRadioGroup>
        </IonList>
      </AppContent>
    </IonPage>
  );
}
