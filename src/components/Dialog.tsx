import { ReactNode, useEffect } from "react";

interface DialogProps {
  open?: boolean;
  onDismiss: () => void;
  children: ReactNode;

  ariaLabel?: string;

  maxWidthClassName?: string;
  className?: string;

  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
}

export function Dialog({
  open = true,
  onDismiss,
  children,
  ariaLabel = "Dialog",
  maxWidthClassName = "max-w-sm",
  className,
  closeOnBackdropClick = true,
  closeOnEscape = true,
}: DialogProps) {
  useEffect(() => {
    if (!closeOnEscape) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onDismiss();
      }
    };

    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, [closeOnEscape, onDismiss]);

  if (!open) return null;

  return (
    <div
      onClick={() => {
        if (closeOnBackdropClick) {
          onDismiss();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center px-8"
      style={{ background: "rgba(0,0,0,0.45)" }}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
        className={[
          "w-full overflow-hidden rounded-2xl",
          maxWidthClassName,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          background: "var(--ion-card-background, var(--ion-background-color))",
          boxShadow:
            "0 32px 80px rgba(0,0,0,0.35), 0 4px 16px rgba(0,0,0,0.15)",
          animation: "dialog-pop 0.22s cubic-bezier(0.34, 1.3, 0.64, 1) both",
        }}
      >
        {children}
      </div>
    </div>
  );
}
