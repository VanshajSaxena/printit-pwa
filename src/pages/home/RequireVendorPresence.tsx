import { client } from "@api/client";
import {
  IonButton,
  IonHeader,
  IonIcon,
  IonNote,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonRouter,
} from "@ionic/react";
import AppContent from "@layout/AppContent";
import { arrowBackOutline, printOutline } from "ionicons/icons";
import { useParams } from "react-router";

interface RequireVendorPresence {
  selector: string;
}

export function RequireVendorPresence({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useIonRouter();
  const { selector } = useParams<RequireVendorPresence>();
  const { data, error, isLoading } = client.useQuery(
    "get",
    "/api/v1/vendors/{selector}",
    {
      params: { path: { selector } },
    },
    { refetchOnWindowFocus: false, retry: false },
  );

  if (isLoading) {
    return null;
  }

  if (!error && data) {
    return children;
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
        className="ion-padding flex min-h-full flex-col justify-evenly"
      >
        <div>
          <IonIcon icon={printOutline} className="text-5xl" />
          <p className="my-2 text-lg font-semibold">
            Oops! That printer isn’t here.
          </p>
          <IonNote color={"medium"}>
            It might have been removed or isn’t available anymore.
          </IonNote>

          <IonButton
            expand="block"
            fill="solid"
            className="my-8"
            onClick={() => {
              router.push("/home", "back");
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
