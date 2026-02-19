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
  IonTitle,
  IonToolbar,
  useIonRouter,
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
  const router = useIonRouter();

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
      <IonHeader translucent>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={`/${router.routeInfo.tab ?? "home"}`}>
              <IonIcon slot="start" icon={arrowBack} />
            </IonBackButton>
          </IonButtons>
          <IonTitle>Progress</IonTitle>
        </IonToolbar>
      </IonHeader>

      <AppContent fullscreen>
        <div className="flex flex-col gap-3 p-4">
          <div className="mt-4 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <IonIcon icon={printOutline} className="text-5xl" />
            </div>
            <h1 className="text-2xl font-bold">Order Received</h1>
            <IonNote className="text-sm">
              Sent to{" "}
              <span className="font-semibold" color={"light"}>
                {vendorName}
              </span>
            </IonNote>
          </div>

          <IonCard className="mx-0 border shadow-sm">
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
            <div className="relative ml-3 space-y-8 border-l-2 border-gray-200 pb-2">
              {steps.map((step, index) => {
                const state = getStepState(step.status);
                const isLast = index === steps.length - 1;

                return (
                  <div key={step.status} className="relative pl-8">
                    {/* Dot Indicator */}
                    <div
                      className={`absolute top-0 -left-[9px] flex h-4 w-4 items-center justify-center rounded-full border-2 bg-white transition-colors duration-300 ${
                        state === "completed"
                          ? "border-green-500 bg-green-500"
                          : state === "current"
                            ? "border-blue-500"
                            : "border-gray-300"
                      } `}
                    >
                      {state === "current" && (
                        <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                      )}
                      {state === "completed" && (
                        <div className="h-2 w-2 rounded-full bg-white" />
                      )}
                    </div>

                    {/* Text Content */}
                    <div
                      className={
                        state === "upcoming" ? "opacity-40" : "opacity-100"
                      }
                    >
                      <h4
                        className={`text-base leading-none font-medium ${state === "current" ? "font-bold text-blue-600" : "text-gray-900"}`}
                      >
                        {step.label}
                      </h4>
                      <p className="mt-1 text-sm text-gray-500">{step.desc}</p>
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
            <IonList className="rounded-xl bg-transparent p-0">
              {transaction.jobs.map((job) => (
                <IonItem key={job.id} lines="none">
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
        </div>
      </AppContent>
    </IonPage>
  );
}
