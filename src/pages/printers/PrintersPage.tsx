import { client } from "@api/client";
import {
  IonButton,
  IonButtons,
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
} from "@ionic/react";
import AppContent from "@layout/AppContent";
import { locateOutline, locationSharp } from "ionicons/icons";
import React, { useState } from "react";
import "./PrintersPage.css";

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
            <IonFabButton>
              <IonIcon icon={locationSharp}></IonIcon>
            </IonFabButton>
          </IonFab>
        }
      >
        <div className="flex">
          <IonSearchbar
            placeholder="Search"
            animated={true}
            className="flex gap-2 py-4! pr-0! pl-4!"
          ></IonSearchbar>
          <IonButtons slot="end" className="px-1">
            <IonButton
              onClick={handleLocateMe}
              disabled={isLocating || isFetching}
            >
              {isLocating ? (
                <IonSpinner name="crescent" />
              ) : (
                <IonIcon
                  slot="icon-only"
                  icon={coordinates ? locationSharp : locateOutline}
                  color={"medium"}
                />
              )}
            </IonButton>
          </IonButtons>
        </div>
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

        {nearbyPrinters?.length && nearbyPrinters.length > 0 && (
          <IonList>
            {nearbyPrinters.map((vendor) => (
              <IonCard
                key={vendor.id}
                button
                routerLink={`/vendors/${vendor.slug}`}
              >
                <IonCardHeader>
                  <IonCardTitle>
                    {vendor.firstName} {vendor.lastName}
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
                    <p>
                      <strong>Distance:</strong> {vendor.distance} km
                    </p>
                  )}

                  {vendor.location && (
                    <p>
                      <strong>Coordinates:</strong>{" "}
                      {vendor.location.latitude?.toFixed(4)},{" "}
                      {vendor.location.longitude?.toFixed(4)}
                    </p>
                  )}

                  {vendor.givenName && (
                    <p>
                      <strong>Given Name:</strong> {vendor.givenName}
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
