import {
  IonBackButton,
  IonButtons,
  IonCol,
  IonGrid,
  IonHeader,
  IonPage,
  IonRow,
  IonSpinner,
  IonTitle,
  IonToolbar,
  useIonRouter,
} from "@ionic/react";
import AppContent from "@layout/AppContent";
import { DraftJob, OutputColor, useDraftStore } from "@store/draftStore";
import { get } from "idb-keyval";
import * as pdfjsLib from "pdfjs-dist";
import { useCallback, useEffect, useState } from "react";
import type { StoredFileWrapper } from "./CheckoutPage";
import { PageThumbnail } from "./PageThumbnail";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.js",
  import.meta.url,
).toString();

export function PrintOptionsDocumentPage() {
  const router = useIonRouter();
  const [pdfDocument, setPdfDocument] =
    useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [loading, setLoading] = useState(true);

  const currentTransactionId = useDraftStore(
    (s) => s.state.currentDraftTransactionId,
  );

  if (!currentTransactionId) {
    throw new Error("CurrentDraftTransactionId doesn't exist");
  }

  const currentJob = useDraftStore((s) => {
    const transactionId = s.state.currentDraftTransactionId;
    const jobId = s.state.currentDraftJobId;
    if (!transactionId || !jobId) return null;
    return (
      s.state.transactions[transactionId].jobs.find((j) => j.id === jobId) ??
      null
    );
  });

  if (!currentJob) {
    throw new Error("CurrentDraftTransactionId doesn't exist");
  }

  const togglePageExclusion = useDraftStore((s) => s.togglePageExclusion);
  const updatePageConfig = useDraftStore((s) => s.updatePageConfig);

  useEffect(() => {
    const job = currentJob;
    let cancelled = false;

    async function loadPdf() {
      const wrapper = await get<StoredFileWrapper>(job.document.fileId);
      if (!wrapper?.file || cancelled) return;

      const arrayBuffer = await wrapper.file.arrayBuffer();
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (cancelled) return;

      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!cancelled) {
        setPdfDocument(pdf);
        setLoading(false);
      }
    }

    loadPdf().catch(console.error);

    return () => {
      cancelled = true;
    };
  }, [currentJob]);

  const handleToggle = useCallback(
    (pageNumber: number) => {
      if (!currentTransactionId) return;
      togglePageExclusion(currentTransactionId, currentJob.id, pageNumber);
    },
    [currentTransactionId, currentJob.id, togglePageExclusion],
  );

  function getEffectiveColor(job: DraftJob, pageNumber: number): OutputColor {
    return (
      job.pageConfigs.find((p) => p.pageNumber === pageNumber)?.outputColor ??
      job.outputColor
    );
  }

  function getEffectiveCopyCount(job: DraftJob, pageNumber: number): number {
    return (
      job.pageConfigs.find((p) => p.pageNumber === pageNumber)?.copyCount ??
      job.copyCount
    );
  }

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton
              defaultHref={`/${router.routeInfo.tab ?? "home"}/checkout/print-options`}
            />
          </IonButtons>
          <IonTitle>{currentJob.document.filename}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <AppContent fullscreen className="h-full">
        {loading || !pdfDocument ? (
          <div className="flex h-full items-center justify-center">
            <IonSpinner />
          </div>
        ) : (
          <IonGrid className="ion-padding">
            <IonRow>
              {currentJob.pageConfigs.map((pageConfig) => (
                <IonCol key={pageConfig.pageNumber} size="6" sizeMd="4">
                  <PageThumbnail
                    pdfDocument={pdfDocument}
                    pageNumber={pageConfig.pageNumber}
                    excluded={pageConfig.excluded}
                    outputColor={getEffectiveColor(
                      currentJob,
                      pageConfig.pageNumber,
                    )}
                    copyCount={getEffectiveCopyCount(
                      currentJob,
                      pageConfig.pageNumber,
                    )}
                    onToggleExclusion={() => {
                      handleToggle(pageConfig.pageNumber);
                    }}
                    onOutputColorChange={(color) => {
                      updatePageConfig(
                        currentTransactionId,
                        currentJob.id,
                        pageConfig.pageNumber,
                        { outputColor: color },
                      );
                    }}
                    onCopyCountChange={(count) => {
                      updatePageConfig(
                        currentTransactionId,
                        currentJob.id,
                        pageConfig.pageNumber,
                        { copyCount: count },
                      );
                    }}
                    onPress={() => {
                      // setCurrentDraftPageNumber(pageConfig.pageNumber);
                      // router.push(`.../orientation`);
                    }}
                  />
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
        )}
      </AppContent>
    </IonPage>
  );
}
