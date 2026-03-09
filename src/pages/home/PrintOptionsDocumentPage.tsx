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
  useIonViewDidEnter,
  useIonViewDidLeave,
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

  const [isActive, setIsActive] = useState(true);

  useIonViewDidEnter(() => {
    setIsActive(true);
  });
  useIonViewDidLeave(() => {
    setIsActive(false);
  });

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
  const updatePageConfigOutputColor = useDraftStore(
    (s) => s.updatePageConfigOutputColor,
  );
  const updatePageConfigCopyCount = useDraftStore(
    (s) => s.updatePageConfigCopyCount,
  );
  const documentFileId = currentJob.document.fileId;

  useEffect(() => {
    let cancelled = false;
    let pdf: pdfjsLib.PDFDocumentProxy | null = null;

    async function loadPdf() {
      const wrapper = await get<StoredFileWrapper>(documentFileId);
      if (!wrapper?.file || cancelled) return;

      const arrayBuffer = await wrapper.file.arrayBuffer();
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (cancelled) return;

      pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!cancelled) {
        setPdfDocument(pdf);
        setLoading(false);
      }
    }

    loadPdf().catch(console.error);

    return () => {
      cancelled = true;
      void pdf?.destroy();
    };
  }, [documentFileId]);

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

  function isPageOverridden(job: DraftJob, pageNumber: number): boolean {
    const cfg = job.pageConfigs.find((p) => p.pageNumber === pageNumber);
    return (
      !!cfg && (cfg.outputColor !== undefined || cfg.copyCount !== undefined)
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
          <IonGrid className="ion-padding pb-15!">
            <IonRow>
              {currentJob.pageConfigs.map((pageConfig) => (
                <IonCol key={pageConfig.pageNumber} size="6" sizeMd="4">
                  <PageThumbnail
                    isActive={isActive}
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
                    isOverridden={isPageOverridden(
                      currentJob,
                      pageConfig.pageNumber,
                    )}
                    onToggleExclusion={() => {
                      handleToggle(pageConfig.pageNumber);
                    }}
                    onOutputColorChange={(color) => {
                      updatePageConfigOutputColor(
                        currentTransactionId,
                        currentJob.id,
                        pageConfig.pageNumber,
                        color,
                      );
                    }}
                    onCopyCountChange={(count) => {
                      updatePageConfigCopyCount(
                        currentTransactionId,
                        currentJob.id,
                        pageConfig.pageNumber,
                        count,
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
