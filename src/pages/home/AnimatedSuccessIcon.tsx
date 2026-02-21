import { useEffect, useState } from "react";

export function AnimatedSuccessIcon() {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setAnimate(true);
    }, 150);
    return () => {
      clearTimeout(t);
    };
  }, []);

  return (
    <div
      style={{
        height: "56px",
        width: "56px",
        borderRadius: "50%",
        background: "var(--ion-color-light-shade)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: animate ? "scale(1)" : "scale(0.85)",
        opacity: animate ? 1 : 0,
        transition:
          "transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 300ms ease",
      }}
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--ion-color-success)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: 48,
          strokeDashoffset: animate ? 0 : 48,
          transition: "stroke-dashoffset 500ms ease 200ms",
        }}
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    </div>
  );
}
