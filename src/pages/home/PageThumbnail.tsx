import { IonSpinner } from "@ionic/react";
import * as pdfjsLib from "pdfjs-dist";
import { useCallback, useEffect, useRef, useState } from "react";

const PLACEHOLDER_ASPECT_RATIO = "210 / 297";

const INTERSECTION_MARGIN = "200px";

interface PageThumbnailProps {
  pdfDocument: pdfjsLib.PDFDocumentProxy;
  pageNumber: number;
  excluded: boolean;
  onToggle: () => void;
}

export function PageThumbnail({
  pdfDocument,
  pageNumber,
  excluded,
  onToggle,
}: PageThumbnailProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);
  const [rendered, setRendered] = useState(false);

  const renderPage = useCallback(async () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || rendered) return;

    const page = await pdfDocument.getPage(pageNumber);
    const containerWidth = container.clientWidth;
    const baseViewport = page.getViewport({ scale: 1 });
    const scale = containerWidth / baseViewport.width;
    const viewport = page.getViewport({ scale });

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Cancel any in-flight render before starting a new one
    renderTaskRef.current?.cancel();
    const task = page.render({ canvasContext: ctx, viewport });
    renderTaskRef.current = task;

    try {
      await task.promise;
      setRendered(true);
    } catch (e) {
      // RenderingCancelledException is expected, ignore it
      if ((e as Error).name !== "RenderingCancelledException") {
        console.error(`Failed to render page ${pageNumber.toString()}:`, e);
      }
    }
  }, [pdfDocument, pageNumber, rendered]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          void renderPage();
          // Once we've triggered the render, no need to keep observing
          observer.disconnect();
        }
      },
      { rootMargin: INTERSECTION_MARGIN },
    );

    observer.observe(container);
    return () => {
      observer.disconnect();
      renderTaskRef.current?.cancel();
    };
  }, [renderPage]);

  return (
    <button
      onClick={onToggle}
      className={[
        "flex w-full flex-col items-center gap-2 p-1",
        "transition-all duration-200 ease-in-out",
        "cursor-pointer border-0 bg-transparent",
        excluded ? "scale-95 opacity-50" : "scale-100 opacity-100",
      ].join(" ")}
      aria-pressed={!excluded}
    >
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-lg shadow-sm"
        style={{
          aspectRatio: PLACEHOLDER_ASPECT_RATIO,
          background: "var(--ion-color-light)",
        }}
      >
        {/* Placeholder spinner, visible until canvas is ready */}
        {!rendered && (
          <div className="absolute inset-0 flex items-center justify-center">
            <IonSpinner name="crescent" />
          </div>
        )}
        {/* Canvas is always mounted so the ref is stable, just hidden until rendered */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          style={{
            objectFit: "contain",
            opacity: rendered ? 1 : 0,
          }}
        />
      </div>
      <span
        className="text-xs font-medium"
        style={{
          color: excluded ? "var(--ion-color-medium)" : "var(--ion-color-dark)",
        }}
      >
        {pageNumber}
      </span>
    </button>
  );
}
