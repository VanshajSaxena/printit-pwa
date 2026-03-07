import { IonIcon, IonSpinner } from "@ionic/react";
import { add, remove, checkmarkCircle, ellipseOutline } from "ionicons/icons";
import * as pdfjsLib from "pdfjs-dist";
import { useCallback, useEffect, useRef, useState } from "react";
import type { OutputColor } from "@store/draftStore";

const PLACEHOLDER_ASPECT_RATIO = "210 / 297";
const INTERSECTION_MARGIN = "200px";
const COLOR_CYCLE: OutputColor[] = ["Color", "Grayscale"];
const COLOR_LABEL: Record<string, string> = {
  Color: "Color",
  Grayscale: "B&W",
  Monochrome: "B&W",
};

interface PageThumbnailProps {
  isActive: boolean;
  pdfDocument: pdfjsLib.PDFDocumentProxy;
  pageNumber: number;
  excluded: boolean;
  outputColor: OutputColor;
  copyCount: number;
  onToggleExclusion: () => void;
  onOutputColorChange: (color: OutputColor) => void;
  onCopyCountChange: (count: number) => void;
  onPress: () => void;
}

export function PageThumbnail({
  isActive,
  pdfDocument,
  pageNumber,
  excluded,
  outputColor,
  copyCount,
  onToggleExclusion,
  onOutputColorChange,
  onCopyCountChange,
  onPress,
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
    const dpr = window.devicePixelRatio;
    const containerWidth = container.clientWidth;
    const baseViewport = page.getViewport({ scale: 1 });
    const scale = (containerWidth / baseViewport.width) * dpr;
    const viewport = page.getViewport({ scale });

    canvas.width = viewport.width;
    canvas.height = viewport.height;
    canvas.style.width = `${(viewport.width / dpr).toString()}px`;
    canvas.style.height = `${(viewport.height / dpr).toString()}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    renderTaskRef.current?.cancel();
    const task = page.render({ canvasContext: ctx, viewport });
    renderTaskRef.current = task;

    try {
      await task.promise;
      setRendered(true);
    } catch (e) {
      if ((e as Error).name !== "RenderingCancelledException") {
        console.error(`Failed to render page ${pageNumber.toString()}:`, e);
      }
    }
  }, [pdfDocument, pageNumber, rendered]);

  useEffect(() => {
    if (!isActive) {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = 0;
        canvas.height = 0;
      }
      setRendered(false);
      renderTaskRef.current?.cancel();
    }
  }, [isActive]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isActive || rendered) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          void renderPage();
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
  }, [renderPage, isActive, rendered]);

  const cycleColor = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next =
      COLOR_CYCLE[(COLOR_CYCLE.indexOf(outputColor) + 1) % COLOR_CYCLE.length];
    onOutputColorChange(next);
  };

  const adjustCopy = (e: React.MouseEvent, delta: number) => {
    e.stopPropagation();
    onCopyCountChange(Math.min(99, Math.max(1, copyCount + delta)));
  };

  return (
    <div
      className={[
        "flex w-full flex-col gap-1.5 transition-all duration-200 ease-in-out",
        excluded ? "scale-95 opacity-40" : "scale-100 opacity-100",
      ].join(" ")}
    >
      <div
        className="relative w-full overflow-hidden rounded-xl"
        style={{
          background: "var(--ion-card-background)",
          border: "1.5px solid var(--ion-color-light-shade)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        }}
      >
        <button
          onClick={onPress}
          className="block w-full border-0 bg-transparent p-0"
          aria-label={`Page ${pageNumber.toString()}`}
          tabIndex={excluded ? -1 : 0}
        >
          <div
            ref={containerRef}
            className="relative w-full"
            style={{
              aspectRatio: PLACEHOLDER_ASPECT_RATIO,
              background: "var(--ion-color-light)",
            }}
          >
            {!rendered && (
              <div className="absolute inset-0 flex items-center justify-center">
                <IonSpinner name="crescent" />
              </div>
            )}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 m-auto h-full w-full"
              style={{
                objectFit: "contain",
                opacity: rendered ? 1 : 0,
                filter: outputColor !== "Color" ? "grayscale(1)" : "none",
                transition: "filter 0.2s ease-in-out",
              }}
            />
          </div>
        </button>

        <div
          className={[
            "flex items-center justify-between px-2 py-1.5",
            "transition-opacity duration-200",
            excluded ? "pointer-events-none opacity-0" : "opacity-100",
          ].join(" ")}
          style={{ borderTop: "1px solid var(--ion-color-light-shade)" }}
        >
          <button
            onClick={cycleColor}
            className="rounded-md! border-0 p-1.5! text-xs"
            style={{
              background: "var(--ion-color-light)",
              color: "var(--ion-color-medium)",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            {COLOR_LABEL[outputColor]}
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                adjustCopy(e, -1);
              }}
              disabled={copyCount <= 1}
              className="flex h-6 w-6 items-center justify-center rounded-full border-0 text-base font-medium active:opacity-60 disabled:opacity-25"
              style={{
                background: "var(--ion-color-light)",
                color: "var(--ion-color-dark)",
              }}
              aria-label="Decrease copies"
            >
              <IonIcon icon={remove}></IonIcon>
            </button>
            <span
              className="w-5 text-center text-xs font-semibold tabular-nums"
              style={{ color: "var(--ion-color-dark)" }}
            >
              {copyCount}
            </span>
            <button
              onClick={(e) => {
                adjustCopy(e, 1);
              }}
              disabled={copyCount >= 99}
              className="flex h-6 w-6 items-center justify-center rounded-full border-0 text-base font-medium active:opacity-60 disabled:opacity-25"
              style={{
                background: "var(--ion-color-light)",
                color: "var(--ion-color-dark)",
              }}
              aria-label="Increase copies"
            >
              <IonIcon icon={add}></IonIcon>
            </button>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleExclusion();
          }}
          className="absolute top-1.5 right-1.5 flex cursor-pointer items-center justify-center border-0 bg-transparent p-1!"
          aria-label={excluded ? "Include page" : "Exclude page"}
          aria-pressed={!excluded}
        >
          <IonIcon
            icon={excluded ? ellipseOutline : checkmarkCircle}
            style={{
              fontSize: "26px",
              color: excluded
                ? "rgba(var(--ion-color-medium-rgb), 0.7)"
                : "var(--ion-color-success)",
              filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.25))",
            }}
          />
        </button>
      </div>

      <span
        className="text-center text-xs font-medium"
        style={{
          color: excluded
            ? "var(--ion-color-medium)"
            : "var(--ion-color-medium-shade)",
        }}
      >
        {pageNumber}
      </span>
    </div>
  );
}
