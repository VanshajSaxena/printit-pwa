import { useEffect } from "react";
import { useIonRouter } from "@ionic/react";

interface BackButtonEventDetail {
  register: (priority: number, handler: () => void) => void;
}

interface BackButtonEvent extends Event {
  detail: BackButtonEventDetail;
}

export function useAndroidBackButton() {
  const ionRouter = useIonRouter();

  useEffect(() => {
    let capacitorCleanup: (() => void) | null = null;
    let pwaListenerAttached = false;

    const pwaHandler = (ev: Event) => {
      const backEvent = ev as BackButtonEvent;
      backEvent.detail.register(10, () => {
        if (ionRouter.canGoBack()) {
          ionRouter.goBack();
        }
      });
    };

    const tryCapacitor = async (): Promise<void> => {
      try {
        const { App } = await import("@capacitor/app");
        const handler = await App.addListener("backButton", ({ canGoBack }) => {
          if (ionRouter.canGoBack()) {
            ionRouter.goBack();
          } else if (!canGoBack) {
            void App.exitApp();
          }
        });
        capacitorCleanup = () => void handler.remove();
      } catch {
        document.addEventListener("ionBackButton", pwaHandler);
        pwaListenerAttached = true;
      }
    };

    void tryCapacitor();

    return () => {
      if (capacitorCleanup) {
        capacitorCleanup();
      } else if (pwaListenerAttached) {
        document.removeEventListener("ionBackButton", pwaHandler);
      }
    };
  }, [ionRouter]);
}
