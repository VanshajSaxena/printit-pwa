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
import { useState } from "react";

export default function AppearanceModePage() {
  const currentMode = useSettingsStore((state) => state.mode);
  const setMode = useSettingsStore((state) => state.setMode);

  const [selectedMode, setSelectedMode] = useState<"ios" | "md">(currentMode);

  const hasChanged = selectedMode !== currentMode;

  const handleApplyChange = () => {
    setMode(selectedMode);
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
            value={selectedMode}
            onIonChange={(e) => {
              setSelectedMode(e.detail.value as typeof currentMode);
            }}
          >
            <IonItem>
              {/* justify="space-between" pushes the checkmark to the end */}
              <IonRadio value="ios" justify="space-between">
                Apple (iOS)
              </IonRadio>
            </IonItem>
            <IonItem>
              <IonRadio value="md" justify="space-between">
                Android (Material)
              </IonRadio>
            </IonItem>
          </IonRadioGroup>
        </IonList>

        {hasChanged && (
          <IonList inset className="animate-fade-in mt-4">
            <IonItem button onClick={handleApplyChange}>
              <IonLabel>Apply Changes & Reload</IonLabel>
            </IonItem>
          </IonList>
        )}
      </AppContent>
    </IonPage>
  );
}
