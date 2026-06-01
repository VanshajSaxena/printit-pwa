import { IonApp, setupIonicReact } from "@ionic/react";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";
/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
/* Optional CSS utils that can be commented out */
import "@ionic/react/css/display.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

// import "@ionic/react/css/palettes/dark.always.css";
import "@ionic/react/css/palettes/dark.class.css";
// import "@ionic/react/css/palettes/dark.system.css";

/* Theme variables */
import { baseUrl, queryClient } from "@api/client";
import { PresenceSocketBridge } from "@context/PresenceSocketBridge";
import { SocketProvider } from "@context/SocketProvider";
import { UpdateProvider } from "@context/UpdateProvider";
import AppLayout from "@layout/AppLayout";
import { QueryClientProvider } from "@tanstack/react-query";
import "./theme/variables.css";
import { ingestShareSession } from "@utils/ingestShareSessions";

interface PersistedSettings {
  state: {
    mode: "ios" | "md";
    theme: "light" | "dark" | "system";
  };
  version: number;
}

const savedSettings = localStorage.getItem("app-settings");
let savedMode: "ios" | "md" = "ios";
let savedTheme: "light" | "dark" | "system" = "system";
if (savedSettings) {
  try {
    const parsed = JSON.parse(savedSettings) as unknown;

    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "state" in parsed &&
      typeof (parsed as PersistedSettings).state.mode === "string"
    ) {
      const state = (parsed as PersistedSettings).state;
      const mode = state.mode;
      savedMode = mode;

      savedTheme = state.theme;
    }
  } catch (e) {
    console.error("Error parsing settings", e);
  }
}
const isDark =
  savedTheme === "dark" ||
  (savedTheme === "system" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches);

document.documentElement.classList.toggle("ion-palette-dark", isDark);

setupIonicReact({
  mode: savedMode,
});

export interface SWMessage {
  type: "SHARE_SESSION";
  shareId: string;
}

function isShareSessionMessage(data: unknown): data is SWMessage {
  if (typeof data !== "object" || data === null) return false;

  const d = data as Record<string, unknown>;

  return d.type === "SHARE_SESSION" && typeof d.shareId === "string";
}

navigator.serviceWorker.addEventListener(
  "message",
  (event: MessageEvent<unknown>) => {
    const data = event.data;

    if (!isShareSessionMessage(data)) return;

    void ingestShareSession(data.shareId);
  },
);

const params = new URLSearchParams(window.location.search);
const shareId = params.get("share");

if (shareId) {
  void (async () => {
    await ingestShareSession(shareId);
  })();
}

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <SocketProvider url={baseUrl}>
      <UpdateProvider>
        <IonApp>
          {/* headless components, runs effets that registers socket events related to presence. */}
          <PresenceSocketBridge />
          <AppLayout />
        </IonApp>
      </UpdateProvider>
    </SocketProvider>
  </QueryClientProvider>
);

export default App;
