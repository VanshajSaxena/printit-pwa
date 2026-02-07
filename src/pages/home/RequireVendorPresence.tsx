import { client } from "@api/client";
import {
  IonButton,
  IonHeader,
  IonIcon,
  IonNote,
  IonPage,
  IonSpinner,
  IonTitle,
  IonToolbar,
  useIonRouter,
} from "@ionic/react";
import AppContent from "@layout/AppContent";
import { usePresenceStore } from "@store/presenceStore";
import { arrowBackOutline, printOutline } from "ionicons/icons";
import { useEffect } from "react";
import { useParams } from "react-router";

interface RouteParams {
  selector: string;
}

export function RequireVendorPresence({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useIonRouter();
  const { selector } = useParams<RouteParams>();

  const setCurrentVendorId = usePresenceStore(
    (store) => store.setCurrentVendorId,
  );

  const { data, error, isLoading } = client.useQuery(
    "get",
    "/api/v1/vendors/{selector}",
    {
      params: { path: { selector } },
    },
    {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    },
  );

  // Set current vendor ID when data is available
  useEffect(() => {
    if (data?.id) {
      setCurrentVendorId(data.id);
    }

    // Cleanup: clear current vendor ID when component unmounts
    return () => {
      setCurrentVendorId(null);
    };
  }, [data?.id, setCurrentVendorId]);

  // Loading state
  if (isLoading) {
    return (
      <IonPage>
        <IonHeader translucent>
          <IonToolbar>
            <IonTitle>Loading...</IonTitle>
          </IonToolbar>
        </IonHeader>
        <AppContent
          fullscreen
          className="ion-padding flex min-h-full items-center justify-center"
        >
          <IonSpinner name="crescent" />
        </AppContent>
      </IonPage>
    );
  }

  // Success state - vendor found
  if (data && !error) {
    return <>{children}</>;
  }

  // Error state - vendor not found
  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonTitle>Printer Not Found</IonTitle>
        </IonToolbar>
      </IonHeader>
      <AppContent
        fullscreen
        className="ion-padding flex min-h-full flex-col justify-center"
      >
        <div className="text-center">
          <IonIcon icon={printOutline} className="text-5xl" />
          <p className="my-2 text-lg font-semibold">
            Oops! That printer isn't here.
          </p>
          <IonNote color="medium">
            It might have been removed or isn't available anymore.
          </IonNote>
          <IonButton
            expand="block"
            fill="solid"
            className="my-8"
            onClick={() => {
              router.push("/home", "back", "pop");
            }}
          >
            <IonIcon icon={arrowBackOutline} slot="start" />
            Go Back
          </IonButton>
        </div>
      </AppContent>
    </IonPage>
  );
}
