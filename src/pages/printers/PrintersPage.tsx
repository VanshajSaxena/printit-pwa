import React, { useState } from "react";
import {
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonSearchbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonSpinner,
  IonText,
} from "@ionic/react";
import { locateOutline, locationSharp } from "ionicons/icons";
import AppContent from "@layout/AppContent";
import { client } from "@api/client";

const PrintersPage: React.FC = () => {
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const {
    data: nearbyPrinters,
    isFetching,
    error,
  } = client.useQuery(
    "get",
    "/api/v1/vendors/nearby",
    {
      params: {
        query: {
          lat: coordinates?.lat ?? 0,
          lng: coordinates?.lng ?? 0,
          range: 5000,
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
    );
  };

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonTitle>Printers</IonTitle>
        </IonToolbar>
        <IonToolbar>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              paddingRight: "8px",
            }}
          >
            <IonSearchbar
              placeholder="Search printers..."
              animated={true}
              style={{ paddingBottom: 0 }}
            />
            <IonButtons slot="end">
              <IonButton
                onClick={handleLocateMe}
                disabled={isLocating || isFetching}
              >
                {isLocating ? (
                  <IonSpinner
                    name="crescent"
                    style={{ width: "24px", height: "24px" }}
                  />
                ) : (
                  <IonIcon
                    slot="icon-only"
                    icon={coordinates ? locationSharp : locateOutline}
                    color={coordinates ? "primary" : "medium"}
                  />
                )}
              </IonButton>
            </IonButtons>
          </div>
        </IonToolbar>
      </IonHeader>

      <AppContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Printers</IonTitle>
          </IonToolbar>
        </IonHeader>

        {error && (
          <div className="ion-padding ion-text-center">
            <IonText color="danger">
              <p>Failed to load nearby printers.</p>
            </IonText>
          </div>
        )}

        {isFetching && (
          <div className="ion-padding ion-text-center">
            <IonSpinner />
            <p>Finding printers near you...</p>
          </div>
        )}

        {!isFetching && coordinates && nearbyPrinters?.length === 0 && (
          <div className="ion-padding ion-text-center">
            <IonText color="medium">
              <p>No printers found around you.</p>
            </IonText>
          </div>
        )}

        <IonList>
          {nearbyPrinters?.map((vendor) => (
            <IonItem key={vendor.id} button>
              <IonLabel>
                <h2>
                  {vendor.firstName} {vendor.lastName}
                </h2>
                <p>@{vendor.username}</p>
                {vendor.address && <IonNote>{vendor.distance}</IonNote>}
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
      </AppContent>
    </IonPage>
  );
};

export default PrintersPage;
