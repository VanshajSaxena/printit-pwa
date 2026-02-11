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

  const setPresence = usePresenceStore((store) => store.setPresence);

  const {
    data: vendor,
    error,
    isLoading,
  } = client.useQuery(
    "get",
    "/api/v1/vendors/{selector}",
    {
      params: { path: { selector } },
    },
    {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 5 * 60 * 1000,
    },
  );

  useEffect(() => {
    if (vendor?.id) {
      const { firstName, lastName, givenName, id } = vendor;
      setPresence(
        vendor.id,
        {
          firstName,
          lastName,
          givenName,
          id,
          status: undefined,
        },
        selector,
      );
    }
  });

  if (isLoading) {
    return (
      <IonPage>
        <IonHeader translucent>
          <IonToolbar>
            <IonTitle>Printer</IonTitle>
          </IonToolbar>
        </IonHeader>
        <AppContent
          fullscreen
          className="ion-padding flex min-h-full items-center justify-center"
        >
          <IonSpinner />
        </AppContent>
      </IonPage>
    );
  }

  if (vendor && !error) {
    return <>{children}</>;
  }

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
