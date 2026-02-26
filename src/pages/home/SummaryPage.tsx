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
} from "ionicons/icons";
import { AnimatedSuccessIcon } from "./AnimatedSuccessIcon";
import "./SummaryPage.css";

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
            <IonBackButton defaultHref="/prints">
              <IonIcon slot="start" icon={arrowBack} />
            </IonBackButton>
          </IonButtons>
          <IonTitle>Status</IonTitle>
        </IonToolbar>
      </IonHeader>

      <AppContent fullscreen>
        <div className="mt-6 px-6 text-center">
          <div className="flex max-w-full min-w-full items-center justify-start gap-4">
            <AnimatedSuccessIcon />

            <div className="flex flex-col items-center justify-start">
              <h1
                className="!my-auto"
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
                className="mr-auto text-sm font-medium"
                slot="start"
                style={{
                  letterSpacing: "-0.3px",
                  color: "var(--ion-color-medium)",
                }}
              >
                Sent to{" "}
                <span
                  className="font-medium"
                  style={{
                    color: "var(--ion-color-dark)",
                  }}
                >
                  {vendorName}
                </span>
              </IonText>
            </div>
          </div>
        </div>

        <IonCard className="m-4 border-none! shadow-sm">
          <IonCardContent className="p-4">
            <div className="flex flex-col items-center gap-1">
              <IonNote className="text-xs font-semibold tracking-wider uppercase">
                Printit ID
              </IonNote>
              <div
                className="flex cursor-pointer items-center gap-3 rounded-lg px-4 py-2 transition-transform active:scale-95"
                style={{ color: "var(--ion-color-dark-tint)" }}
                onClick={() => void copyToClipboard()}
              >
                <span className="font-mono text-2xl font-bold tracking-widest">
                  {transaction.friendlyId.substring(0, 8)}
                </span>
                <IonIcon icon={copyOutline} />
              </div>
              <IonNote className="text-sm">
                Tap to copy • Share this with the vendor
              </IonNote>
            </div>
          </IonCardContent>
        </IonCard>

        <div className="px-5 pt-2 pb-6">
          <div
            className="mb-4 text-sm font-semibold"
            style={{
              letterSpacing: "0.2px",
              color: "var(--ion-color-medium)",
            }}
          >
            Status
          </div>

          <div
            style={{
              position: "relative",
              marginLeft: "14px",
              paddingBottom: "4px",
              borderLeft: "1.5px solid var(--ion-color-step-200)",
            }}
          >
            {steps.map((step, index) => {
              const state = getStepState(step.status);

              const isCompleted = state === "completed";
              const isCurrent = state === "current";
              const isUpcoming = state === "upcoming";

              return (
                <div
                  key={step.status}
                  style={{
                    position: "relative",
                    paddingLeft: "26px",
                    marginBottom: index !== steps.length - 1 ? "26px" : "0",
                    opacity: isUpcoming ? 0.35 : 1,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: "-8px",
                      top: "2px",
                      height: "12px",
                      width: "12px",
                      borderRadius: "50%",
                      background: isCompleted
                        ? "var(--ion-color-success)"
                        : isCurrent
                          ? "var(--ion-color-primary)"
                          : "var(--ion-color-step-400)",
                      transition: "all 0.25s ease",
                    }}
                  />

                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: isCurrent ? 600 : 500,
                      color: "var(--ion-color-dark)",
                      letterSpacing: "-0.2px",
                    }}
                  >
                    {step.label}
                  </div>

                  <div
                    style={{
                      marginTop: "4px",
                      fontSize: "14px",
                      color: "var(--ion-color-medium)",
                      lineHeight: "1.4",
                    }}
                  >
                    {step.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-2 pb-4">
          <div
            className="pl-5 text-sm font-semibold"
            style={{
              color: "var(--ion-color-medium)",
            }}
          >
            Documents
          </div>

          <IonList inset lines="inset" className="documents-list">
            {transaction.jobs.map((job) => (
              <IonItem
                key={job.id}
                detail={false}
                style={{
                  "--inner-padding-top": "0.5rem",
                  "--inner-padding-bottom": "0.5rem",
                }}
              >
                <IonIcon
                  icon={documentTextOutline}
                  slot="start"
                  color={"medium"}
                  className="text-xl"
                />

                <IonLabel>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: 500,
                      color: "var(--ion-color-dark)",
                      letterSpacing: "-0.2px",
                    }}
                  >
                    {job.document.filename}
                  </div>

                  <div
                    style={{
                      marginTop: "4px",
                      fontSize: "14px",
                      color: "var(--ion-color-medium)",
                    }}
                  >
                    {job.copyCount} {job.copyCount > 1 ? "copies" : "copy"} •{" "}
                    {job.outputColor === "Monochrome"
                      ? "Black & White"
                      : "Color"}
                  </div>
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        </div>
      </AppContent>
    </IonPage>
  );
}
