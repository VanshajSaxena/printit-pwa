import { client } from "@api/client";
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonList,
  IonPage,
  IonSearchbar,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
  useIonRouter,
} from "@ionic/react";
import AppContent from "@layout/AppContent";
import { locationSharp } from "ionicons/icons";
import React, { useState } from "react";
import "./PrintersPage.css";

const PrintersPage: React.FC = () => {
  const router = useIonRouter();
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const {
    data: nearbyPrinters,
    isFetching,
    isError,
  } = client.useQuery(
    "get",
    "/api/v1/vendors/nearby",
    {
      params: {
        query: {
          lat: coordinates?.lat ?? 0,
          lng: coordinates?.lng ?? 0,
        },
      },
    },
    {
      enabled: !!coordinates,
      refetchOnWindowFocus: false,
    },
  );

  const handleLocateMe = () => {
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        setCoordinates({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        setIsLocating(false);
        console.error("Error getting location:", error);
        alert("Unable to retrieve your location");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters).toString()} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const handleSelectPrinter = (id: string) => {
    router.push(`/printers/${id}`);
  };

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonTitle>Printers</IonTitle>
        </IonToolbar>
      </IonHeader>

      <AppContent
        fullscreen
        fixed={
          <IonFab
            slot="fixed"
            vertical="bottom"
            horizontal="end"
            className="custom-fab"
          >
            <IonFabButton
              onClick={handleLocateMe}
              disabled={isLocating || isFetching}
            >
              {isFetching || isLocating ? (
                <IonSpinner name="crescent" color="light" />
              ) : (
                <IonIcon icon={locationSharp} />
              )}
            </IonFabButton>
          </IonFab>
        }
      >
        <IonSearchbar placeholder="Search printers..." className="p-4!" />

        {isError && (
          <div className="ion-padding ion-text-center">
            <IonText color="danger">
              <p>Failed to load nearby printers.</p>
            </IonText>
          </div>
        )}

        {!isFetching && coordinates && nearbyPrinters?.length === 0 && (
          <div className="ion-padding ion-text-center">
            <IonText color="medium">
              <p>No printers found around you.</p>
            </IonText>
          </div>
        )}

        {nearbyPrinters && nearbyPrinters.length > 0 && (
          <IonList inset className="m-0! bg-transparent! py-0!">
            {nearbyPrinters.map((vendor) => (
              <IonCard
                key={vendor.id}
                button
                className="border-none!"
                onClick={() => {
                  handleSelectPrinter(`@${vendor.username}`);
                }}
              >
                <IonCardHeader>
                  <IonCardTitle>
                    {vendor.displayName ??
                      vendor.firstName.concat(vendor.lastName)}
                  </IonCardTitle>
                  <IonCardSubtitle>@{vendor.username}</IonCardSubtitle>
                </IonCardHeader>

                <IonCardContent>
                  {vendor.address ? (
                    <p>
                      <strong>Address:</strong> {vendor.address}
                    </p>
                  ) : (
                    <p>
                      <em>Address not provided</em>
                    </p>
                  )}

                  {vendor.distance && (
                    <p
                      style={{
                        marginTop: "8px",
                        color: "var(--ion-color-primary)",
                      }}
                    >
                      <IonIcon
                        icon={locationSharp}
                        style={{ verticalAlign: "middle", marginRight: "4px" }}
                      />
                      <strong>{formatDistance(vendor.distance)}</strong> away
                    </p>
                  )}
                </IonCardContent>
              </IonCard>
            ))}
          </IonList>
        )}
      </AppContent>
    </IonPage>
  );
};

export default PrintersPage;
