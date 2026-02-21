import {
  IonBackButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
  useIonToast,
} from "@ionic/react";
import AppContent from "@layout/AppContent";
import { useTransactionStore } from "@store/transactionStore";
import { useVendorStore } from "@store/vendorStore";
import {
  arrowBack,
  checkmarkCircle,
  copyOutline,
  documentTextOutline,
  printOutline,
} from "ionicons/icons";

export function SummaryPage() {
  const [presentToast] = useIonToast();

  const currentTransactionId = useTransactionStore(
    (state) => state.state.currentTransactionId,
  );

  if (!currentTransactionId) {
    throw new Error("CurrentTransactionId doesn't exist");
  }

  const transaction = useTransactionStore(
    (store) => store.state.transactions[currentTransactionId],
  );

  const vendor = useVendorStore((state) =>
    state.getVendor(transaction.vendorId),
  );

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(transaction.friendlyId);
    await presentToast({
      message: "Order ID copied to clipboard!",
      duration: 2000,
      color: "success",
      icon: checkmarkCircle,
      translucent: true,
      positionAnchor: "header",
      position: "top",
    });
  };

  const steps = [
    { status: "PENDING", label: "Submitted", desc: "Order received" },
    { status: "QUEUED", label: "In Queue", desc: "Waiting for printer" },
    { status: "PRINTING", label: "Printing", desc: "Processing now" },
    { status: "COMPLETED", label: "Completed", desc: "Ready for pickup" },
  ];

  const getStepState = (stepStatus: string) => {
    const statusOrder = ["PENDING", "QUEUED", "PRINTING", "COMPLETED"];
    const currentIndex = statusOrder.indexOf(transaction.status);
    const stepIndex = statusOrder.indexOf(stepStatus);

    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "current";
    return "upcoming";
  };

  const vendorName = vendor
    ? (vendor.displayName ?? `${vendor.firstName} ${vendor.lastName}`)
    : "Unknown Printer";

  return (
    <IonPage>
      <IonHeader id="header" translucent>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/prints" text={"Your Prints"}>
              <IonIcon slot="start" icon={arrowBack} />
            </IonBackButton>
          </IonButtons>
          <IonTitle>Status</IonTitle>
        </IonToolbar>
      </IonHeader>

      <AppContent fullscreen>
        <div className="mt-6 px-6 text-center">
          <div
            className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full"
            style={{
              background: "var(--ion-color-success-tint)",
            }}
          >
            <IonIcon
              icon={printOutline}
              style={{
                fontSize: "28px",
                color: "var(--ion-color-success-shade)",
              }}
            />
          </div>

          <h1
            style={{
              fontSize: "22px",
              fontWeight: 600,
              letterSpacing: "-0.3px",
              color: "var(--ion-color-dark)",
            }}
          >
            Order Received
          </h1>

          <IonText
            style={{
              display: "block",
              marginTop: "6px",
              fontSize: "15px",
              color: "var(--ion-color-medium)",
            }}
          >
            Sent to{" "}
            <span
              style={{
                fontWeight: 500,
                color: "var(--ion-color-dark)",
              }}
            >
              {vendorName}
            </span>
          </IonText>
        </div>

        <IonCard className="m-4 border-none!">
          <IonCardContent className="p-4">
            <div className="flex flex-col items-center gap-1">
              <IonNote className="text-xs font-semibold tracking-wider uppercase">
                Printit ID
              </IonNote>
              <div
                className="flex cursor-pointer items-center gap-3 rounded-lg px-4 py-2 transition-transform active:scale-95"
                onClick={() => void copyToClipboard()}
              >
                <span className="font-mono text-2xl font-bold tracking-widest">
                  {transaction.friendlyId.substring(0, 8)}
                </span>
                <IonIcon icon={copyOutline} />
              </div>
              <IonNote className="text-xs">
                Tap to copy • Share this with the vendor
              </IonNote>
            </div>
          </IonCardContent>
        </IonCard>

        <div className="px-4 py-2">
          <h5 className="mb-6 text-sm font-bold tracking-wider uppercase">
            Status Timeline
          </h5>
          <div
            className="relative ml-3 space-y-8 pb-2"
            style={{
              borderLeft: "2px solid var(--ion-color-medium)",
            }}
          >
            {steps.map((step) => {
              const state = getStepState(step.status);

              return (
                <div key={step.status} className="relative pl-8">
                  <IonLabel
                    color={
                      state === "completed"
                        ? "success"
                        : state === "current"
                          ? "primary"
                          : "dark"
                    }
                    className="absolute top-0 -left-[9px] flex h-4 w-4 items-center justify-center rounded-full border-2 transition-colors duration-300"
                    style={{
                      background:
                        state === "completed"
                          ? "var(--ion-color-success)"
                          : "var(--ion-background-color)",
                      borderColor:
                        state === "completed"
                          ? "var(--ion-color-success)"
                          : state === "current"
                            ? "var(--ion-color-primary)"
                            : "var(--ion-color-dark)",
                    }}
                  >
                    {state === "current" && (
                      <div
                        className="h-2 w-2 animate-pulse rounded-full"
                        style={{
                          background: "var(--ion-color-primary)",
                        }}
                      />
                    )}

                    {state === "completed" && (
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{
                          background: "var(--ion-color-light)",
                        }}
                      />
                    )}
                  </IonLabel>

                  <div
                    style={{
                      opacity: state === "upcoming" ? 0.4 : 1,
                    }}
                  >
                    <h4
                      className="text-base leading-none font-medium"
                      style={{
                        fontWeight: state === "current" ? 700 : 500,
                        color:
                          state === "current"
                            ? "var(--ion-color-primary)"
                            : "var(--ion-color-dark)",
                      }}
                    >
                      {step.label}
                    </h4>

                    <p
                      className="mt-1 text-sm"
                      style={{
                        color: "var(--ion-color-medium)",
                      }}
                    >
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h5 className="mb-2 px-4 text-sm font-bold tracking-wider uppercase">
            Documents
          </h5>
          <IonList inset className="rounded-xl bg-transparent p-0">
            {transaction.jobs.map((job) => (
              <IonItem key={job.id}>
                <IonIcon
                  icon={documentTextOutline}
                  slot="start"
                  color="medium"
                />
                <IonLabel>
                  <IonLabel>{job.document.filename}</IonLabel>
                  <IonNote className="text-xs">
                    {job.copyCount} {job.copyCount > 1 ? "copies" : "copy"} •{" "}
                    {job.outputColor}
                  </IonNote>
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        </div>
      </AppContent>
    </IonPage>
  );
}
