import {
  IonBackButton,
  IonButtons,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToggle,
  IonToolbar,
} from "@ionic/react";
import AppContent from "@layout/AppContent";
import { useSettingsStore } from "@store/settingsStore";
import { useEffect, useState } from "react";

export default function AppearancePage() {
  const { mode, theme, setTheme } = useSettingsStore();

  const isSystemTheme = theme === "system";

  const [systemIsDark, setSystemIsDark] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches,
  );

  useEffect(() => {
    const applyTheme = (shouldBeDark: boolean) => {
      document.body.classList.toggle("dark", shouldBeDark);
      document.body.classList.toggle("light", !shouldBeDark);
    };

    if (theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

      const updateSystemState = (matches: boolean) => {
        setSystemIsDark(matches);
        applyTheme(matches);
      };

      updateSystemState(prefersDark.matches);

      const listener = (e: MediaQueryListEvent) => {
        updateSystemState(e.matches);
      };
      prefersDark.addEventListener("change", listener);
      return () => {
        prefersDark.removeEventListener("change", listener);
      };
    } else {
      applyTheme(theme === "dark");
    }
  }, [theme]);

  const isDarkChecked = theme === "system" ? systemIsDark : theme === "dark";

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/settings" text="Settings" />
          </IonButtons>
          <IonTitle>Appearance</IonTitle>
        </IonToolbar>
      </IonHeader>
      <AppContent fullscreen>
        <IonList inset className="py-0!">
          <IonItem
            detail
            button
            routerLink="/settings/appearance/mode"
            routerDirection="forward"
          >
            <IonLabel>Device Mode</IonLabel>
            <IonLabel slot="end" color={"medium"}>
              {mode === "ios" ? "Apple" : "Android"}
            </IonLabel>
          </IonItem>

          {/* Option 1: System Theme Toggle */}
          <IonItem>
            <IonLabel>Use System Theme</IonLabel>
            <IonToggle
              slot="end"
              checked={isSystemTheme}
              onIonChange={(e) => {
                if (e.detail.checked) {
                  setTheme("system");
                } else {
                  setTheme(systemIsDark ? "dark" : "light");
                }
              }}
            />
          </IonItem>

          {/* Option 2: Manual Dark Mode Toggle */}
          <IonItem>
            <IonLabel>Dark Mode</IonLabel>
            <IonToggle
              slot="end"
              checked={isDarkChecked}
              disabled={isSystemTheme}
              onIonChange={(e) => {
                if (!isSystemTheme) {
                  setTheme(e.detail.checked ? "dark" : "light");
                }
              }}
            />
          </IonItem>
        </IonList>
      </AppContent>
    </IonPage>
  );
}
