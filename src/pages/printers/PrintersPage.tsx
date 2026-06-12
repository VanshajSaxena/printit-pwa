import { client } from "@api/client";
import { VendorResponseDto } from "@api/cloud-api-types";
import { PrinterGraphic } from "@components/graphics/PrinterGraphic";
import { PulseIcon } from "@components/graphics/PulseIcon";
import {
  IonAlert,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonChip,
  IonHeader,
  IonIcon,
  IonLabel,
  IonModal,
  IonNote,
  IonPage,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
  useIonLoading,
  useIonRouter,
} from "@ionic/react";
import AppContent from "@layout/AppContent";
import { useDraftStore } from "@store/draftStore";
import { usePresenceStore } from "@store/presenceStore";
import type { VendorProfile } from "@store/vendorStore";
import { useVendorStore } from "@store/vendorStore";
import { createDraftTransaction } from "@utils/createDraftTransaction";
import { formatDistance } from "@utils/formatDistance";
import { formatRelativeTime } from "@utils/formatRelativeTime";
import {
  alertCircle,
  close,
  cloudUploadOutline,
  earthOutline,
  location,
  mapOutline,
  navigate,
  navigateOutline,
  pin,
  print,
  printOutline,
  walk,
} from "ionicons/icons";
import React, { ChangeEvent, useMemo, useRef, useState } from "react";
import "./PrintersPage.css";

/**
 * Union of VendorResponseDto (from nearby search) and VendorProfile (from
 * the persisted store). `distance` is optional because store entries don't
 * carry it.
 */
type SelectedVendor = Omit<VendorResponseDto, "distance"> & {
  distance?: number;
};

type DistanceRange = "0-1" | "1-5" | "5+";

/**
 * idle      — no location permission; pin is tappable, no animation
 * searching — locating or fetching; animated radar, no popups
 * empty     — fetched, zero results; animated radar, updated label
 * found     — results returned; animated radar + vendor popups
 */
type RadarState = "idle" | "searching" | "empty" | "found";

const DISTANCE_RANGES: {
  label: string;
  value: DistanceRange;
  meters: number | undefined;
}[] = [
  { label: "Nearby", value: "0-1", meters: 1000 },
  { label: "Local", value: "1-5", meters: 5000 },
  { label: "Anywhere", value: "5+", meters: undefined },
];

const RADAR_LABEL: Record<RadarState, string | null> = {
  idle: "Tap to find printers near you",
  searching: "Searching printers nearby...",
  empty: "No printers found nearby",
  found: null,
};

const RADAR_SIZE_REM = 18;
const ORBIT_RADIUS_REM = (RADAR_SIZE_REM / 2) * 0.62;

const vendorDisplayName = (vendor: SelectedVendor | VendorProfile): string =>
  vendor.displayName ?? `${vendor.firstName} ${vendor.lastName}`;

interface VendorPopupProps {
  vendor: VendorResponseDto;
  index: number;
  total: number;
  onClick: (vendor: VendorResponseDto) => void;
}

const VendorPopup: React.FC<VendorPopupProps> = ({
  vendor,
  index,
  total,
  onClick,
}) => {
  const angleDeg = (index / total) * 360 - 90;
  const angleRad = (angleDeg * Math.PI) / 180;
  const x = ORBIT_RADIUS_REM * Math.cos(angleRad);
  const y = ORBIT_RADIUS_REM * Math.sin(angleRad);

  return (
    <div
      className="pp-vendor"
      style={{
        ["--pp-x" as string]: `${x.toString()}rem`,
        ["--pp-y" as string]: `${y.toString()}rem`,
        animationDelay: `${(index * 0.12).toString()}s`,
      }}
    >
      <button
        className="pp-vendor-popup"
        onClick={() => {
          onClick(vendor);
        }}
        aria-label={`Open ${vendorDisplayName(vendor)}`}
      >
        <IonIcon icon={printOutline} className="pp-vendor-popup__icon" />
      </button>

      <div
        className="flex items-center justify-center gap-1 p-2"
        style={{
          color: "var(--ion-color-medium)",
        }}
      >
        <IonIcon ios={navigate} md={pin}></IonIcon>
        <p
          className="pp-vendor-label m-0 text-sm font-semibold"
          style={{
            color: "var(--ion-color-medium)",
          }}
        >
          {formatDistance(vendor.distance)}
        </p>
      </div>
    </div>
  );
};

interface RadarDisplayProps {
  state: RadarState;
  vendors: VendorResponseDto[];
  onRequestLocation: () => void;
  onSelectVendor: (vendor: VendorResponseDto) => void;
}

const RadarDisplay: React.FC<RadarDisplayProps> = ({
  state,
  vendors,
  onRequestLocation,
  onSelectVendor,
}) => {
  const isAnimating = state !== "idle";
  const isClickable = state === "idle";

  return (
    <div className="flex flex-col items-center justify-center gap-4 px-4 py-6 text-center">
      <div className="pp-radar">
        {isAnimating && (
          <>
            <div className="pp-radar__wave pp-radar__wave--1" />
            <div className="pp-radar__wave pp-radar__wave--2" />
            <div className="pp-radar__wave pp-radar__wave--3" />
          </>
        )}

        {state === "found" &&
          vendors.map((vendor, i) => (
            <VendorPopup
              key={vendor.id}
              vendor={vendor}
              index={i}
              total={vendors.length}
              onClick={onSelectVendor}
            />
          ))}

        <button
          className={`pp-radar__pin ${isClickable ? "pp-radar__pin--interactive" : ""}`}
          style={{
            width: isAnimating ? "2rem" : "3.25rem",
            height: isAnimating ? "2rem" : "3.25rem",
          }}
          onClick={isClickable ? onRequestLocation : undefined}
          disabled={!isClickable}
          aria-label="Use my location"
        >
          {isClickable && <IonIcon md={location} ios={navigate} />}
        </button>

        <IonNote
          className="absolute bottom-18 text-center text-sm font-semibold"
          style={{ color: "var(--ion-color-medium)" }}
        >
          {RADAR_LABEL[state]}
        </IonNote>
      </div>
    </div>
  );
};

interface VendorDialogProps {
  vendor: SelectedVendor | null;
  onDismiss: () => void;
}

const VendorDialog: React.FC<VendorDialogProps> = ({ vendor, onDismiss }) => {
  const modal = useRef<HTMLIonModalElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useIonRouter();
  const [present, dismiss] = useIonLoading();

  const upsertVendor = useVendorStore((store) => store.upsertVendor);
  const setPresence = usePresenceStore((store) => store.setPresence);
  const setCurrentDraftTransactionId = useDraftStore(
    (store) => store.setCurrentDraftTransactionId,
  );

  const { data: presenceData, isLoading: isPresenceLoading } = client.useQuery(
    "get",
    "/api/v1/vendors/{selector}/presence",
    { params: { path: { selector: vendor?.id ?? 0 } } },
    {
      enabled: !!vendor,
      refetchOnWindowFocus: false,
    },
  );

  React.useEffect(() => {
    if (presenceData && vendor) {
      setPresence(vendor.id, presenceData.status);
    }
  }, [presenceData, vendor, setPresence]);

  const presenceStatus = presenceData?.status;
  const isOnline = presenceStatus === "online";

  const dismissModal = () => modal.current?.dismiss();

  const pickFiles = () => fileInputRef.current?.click();

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!vendor) return;

    const eventTargetFiles = event.target.files;
    if (!eventTargetFiles || eventTargetFiles.length === 0) return;

    const onlyPdfFiles = Array.from(eventTargetFiles).filter(
      (file) => file.type === "application/pdf",
    );
    if (onlyPdfFiles.length === 0) return;

    await dismissModal();
    await present({ message: "Processing files..." });

    try {
      const transactionId = await createDraftTransaction(
        onlyPdfFiles,
        vendor.id,
      );

      setCurrentDraftTransactionId(transactionId);

      router.push(`/${router.routeInfo.tab ?? "home"}/checkout`);
    } catch (error) {
      console.error("Failed to process files:", error);
    } finally {
      const {
        id,
        firstName,
        lastName,
        displayName,
        username,
        slug,
        address,
        location,
      } = vendor;
      upsertVendor({
        id,
        firstName,
        lastName,
        displayName,
        username,
        slug,
        address,
        location: location ?? null,
      });
      event.target.value = "";
      await dismiss();
    }
  };

  return (
    <IonModal
      id="pp-vendor-dialog"
      ref={modal}
      isOpen={vendor !== null}
      onDidDismiss={onDismiss}
    >
      {vendor && (
        <div className="relative flex min-h-fit min-w-fit flex-col items-stretch gap-[0.875rem] overflow-hidden rounded-[1.125rem] bg-[var(--ion-background-color)] px-4.5 pt-6 pb-4.5">
          {isPresenceLoading ? (
            <div className="flex h-46 min-w-full items-center justify-center">
              <IonSpinner name="dots" />
            </div>
          ) : (
            <>
              {/* Printer status card */}
              <div className="grid grid-cols-[6rem_1fr] items-center gap-4 rounded-[0.875rem]">
                <div className="h-auto w-full">
                  <PrinterGraphic height={90} />
                </div>

                <div className="flex min-w-0 flex-col gap-[0.375rem]">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col gap-0.5">
                      <IonText>
                        <p
                          className="m-0"
                          style={{
                            fontSize: "1rem",
                            fontWeight: 600,
                            letterSpacing: "-0.2px",
                            color: "var(--ion-color-dark)",
                          }}
                        >
                          {isOnline ? "Printer Ready" : "Printer Offline"}
                        </p>
                      </IonText>
                      <IonNote
                        style={{
                          fontSize: "0.8125rem",
                          color: "var(--ion-color-medium)",
                        }}
                      >
                        {vendorDisplayName(vendor)}
                      </IonNote>
                    </div>
                    {isOnline ? (
                      <PulseIcon
                        status={presenceStatus}
                        className="h-7 w-7 shrink-0"
                      />
                    ) : (
                      <IonIcon
                        icon={alertCircle}
                        color="danger"
                        className="shrink-0"
                        style={{ fontSize: "1.75rem" }}
                      />
                    )}
                  </div>

                  {!isOnline && (
                    <p
                      className="m-0"
                      style={{
                        fontSize: "0.8125rem",
                        fontWeight: "600",
                        color: "var(--ion-color-danger-tint)",
                      }}
                    >
                      This printer is currently unavailable.
                    </p>
                  )}
                </div>
              </div>

              {/* Detail pills */}
              <div className="flex flex-wrap gap-2">
                {vendor.distance != null && (
                  <div
                    className="inline-flex items-center rounded-full px-3 font-medium"
                    style={{
                      gap: "0.3rem",
                      paddingTop: "0.3rem",
                      paddingBottom: "0.3rem",
                      fontSize: "0.8125rem",
                      background: "var(--ion-color-light)",
                      color: "var(--ion-text-color)",
                    }}
                  >
                    <IonIcon
                      ios={navigate}
                      md={pin}
                      className="shrink-0"
                      style={{
                        fontSize: "0.875rem",
                        color: "var(--ion-color-primary)",
                      }}
                    />
                    <span>{formatDistance(vendor.distance)}</span>
                  </div>
                )}

                {vendor.address && (
                  <div
                    className="inline-flex items-center rounded-full px-3 font-medium"
                    style={{
                      gap: "0.3rem",
                      paddingTop: "0.3rem",
                      paddingBottom: "0.3rem",
                      fontSize: "0.8125rem",
                      background: "var(--ion-color-light)",
                      color: "var(--ion-text-color)",
                    }}
                  >
                    <span>{vendor.address}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col items-stretch">
                <IonButton
                  onClick={pickFiles}
                  size="default"
                  className="flex gap-4"
                >
                  <IonIcon icon={cloudUploadOutline} slot="start" />
                  <IonLabel className="font-semibold">Upload Files</IonLabel>
                </IonButton>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                style={{ display: "none" }}
                multiple
                accept=".pdf"
                onChange={(e) => void handleFileChange(e)}
              />
            </>
          )}

          <IonIcon
            className="absolute top-3 right-3 cursor-pointer p-1 text-2xl"
            icon={close}
            color={"medium"}
            onClick={() => void dismissModal()}
          ></IonIcon>
        </div>
      )}
    </IonModal>
  );
};

interface PreviousPrinterCardProps {
  vendor: VendorProfile;
  onSelect: (vendor: VendorProfile) => void;
}

const PreviousPrinterCard: React.FC<PreviousPrinterCardProps> = ({
  vendor,
  onSelect,
}) => {
  return (
    <IonCard
      button
      className="mx-4 my-2 border-none! shadow-sm"
      onClick={() => {
        onSelect(vendor);
      }}
    >
      <IonCardHeader className="py-5">
        <div className="flex items-start justify-between">
          <div className="mr-3 min-w-0 flex-1">
            <IonCardSubtitle
              className="flex items-center justify-start gap-1.5 text-xs font-bold tracking-wider uppercase"
              color="primary"
            >
              <IonIcon icon={print}></IonIcon>
              Printer
            </IonCardSubtitle>
            <IonCardTitle className="mt-1.5 text-base font-bold">
              {vendorDisplayName(vendor)}
            </IonCardTitle>
            <IonNote className="text-sm">@{vendor.username}</IonNote>
          </div>
          <div className="flex flex-shrink-0 flex-col items-end gap-1">
            {vendor.lastUsedAt && (
              <IonNote className="text-sm">
                {formatRelativeTime(vendor.lastUsedAt)}
              </IonNote>
            )}
          </div>
        </div>
      </IonCardHeader>

      {vendor.address && (
        <IonCardContent className="pt-0">
          <div className="flex items-center gap-2">
            <IonIcon icon={navigateOutline} />
            <IonLabel className="text-sm">{vendor.address}</IonLabel>
          </div>
        </IonCardContent>
      )}
    </IonCard>
  );
};

const PrintersPage: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState<DistanceRange>("0-1");
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isLocationError, setIsLocationError] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<SelectedVendor | null>(
    null,
  );

  const vendorsRecord = useVendorStore((store) => store.vendors);
  const previousVendors = useMemo(
    () =>
      Object.values(vendorsRecord).sort((a, b) => {
        const dateA = a.lastUsedAt ? new Date(a.lastUsedAt).getTime() : 0;
        const dateB = b.lastUsedAt ? new Date(b.lastUsedAt).getTime() : 0;
        return dateB - dateA;
      }),
    [vendorsRecord],
  );

  const activeRange = DISTANCE_RANGES.find((r) => r.value === selectedRange);

  const { data: nearbyPrinters, isFetching } = client.useQuery(
    "get",
    "/api/v1/vendors/nearby",
    {
      params: {
        query: {
          lat: coordinates?.lat ?? 0,
          lng: coordinates?.lng ?? 0,
          range: activeRange?.meters,
        },
      },
    },
    { enabled: !!coordinates, refetchOnWindowFocus: false },
  );

  const radarState: RadarState = (() => {
    if (isLocating || (coordinates && isFetching)) return "searching";
    if (!coordinates) return "idle";
    if (nearbyPrinters && nearbyPrinters.length > 0) return "found";
    return "empty";
  })();

  const requestLocation = () => {
    setIsLocationError(false);
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
        setIsLocationError(true);
        console.error("Error getting location:", error);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleRangeSelect = (value: DistanceRange) => {
    setSelectedRange(value);
    if (!coordinates && !isLocating) requestLocation();
  };

  /** Adapt VendorProfile → SelectedVendor for the dialog (no distance). */
  const handleSelectPreviousVendor = (vendor: VendorProfile) => {
    setSelectedVendor({
      id: vendor.id,
      firstName: vendor.firstName,
      lastName: vendor.lastName,
      displayName: vendor.displayName,
      username: vendor.username,
      slug: vendor.slug,
      address: vendor.address,
      location: vendor.location,
    });
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
        className="flex min-h-full flex-col justify-center"
      >
        <RadarDisplay
          state={radarState}
          vendors={nearbyPrinters ?? []}
          onRequestLocation={requestLocation}
          onSelectVendor={setSelectedVendor}
        />

        <div className="flex flex-row justify-evenly gap-1 overflow-x-auto px-4 pb-4">
          {DISTANCE_RANGES.map((range) => {
            const icon =
              range.value === "0-1"
                ? walk
                : range.value === "1-5"
                  ? mapOutline
                  : earthOutline;
            return (
              <IonChip
                key={range.value}
                className="rounded-full"
                color={selectedRange === range.value ? "primary" : undefined}
                onClick={() => {
                  handleRangeSelect(range.value);
                }}
              >
                <IonIcon icon={icon} className="shrink-0"></IonIcon>
                <IonLabel className="font-semibold">{range.label}</IonLabel>
              </IonChip>
            );
          })}
        </div>
        {previousVendors.length > 0 && (
          <div className="pp-prev-section">
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 600,
                margin: "1rem",
                color: "var(--ion-color-dark)",
              }}
            >
              Printers
            </h2>
            {previousVendors.map((vendor) => (
              <PreviousPrinterCard
                key={vendor.id}
                vendor={vendor}
                onSelect={handleSelectPreviousVendor}
              />
            ))}
          </div>
        )}

        <VendorDialog
          vendor={selectedVendor}
          onDismiss={() => {
            setSelectedVendor(null);
          }}
        />

        <IonAlert
          isOpen={isLocationError}
          header="Unable to get location"
          message="Please allow location access to find printers near you."
          buttons={[
            {
              text: "OK",
              handler: () => {
                setIsLocationError(false);
              },
            },
          ]}
          onDidDismiss={() => {
            setIsLocationError(false);
          }}
        />
      </AppContent>
    </IonPage>
  );
};

export default PrintersPage;
