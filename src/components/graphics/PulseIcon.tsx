export function PulseIcon(
  props: React.SVGProps<SVGSVGElement> & {
    status: "online" | "offline" | "away";
  },
) {
  const { status } = props;
  const isOnline = status === "online";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="32"
      height="32"
      {...props}
    >
      <circle
        cx="12"
        cy="12"
        r="3"
        className={
          isOnline
            ? "fill-green-500"
            : status === "away"
              ? "fill-yellow-500"
              : "fill-red-500"
        }
      />

      <circle
        cx="12"
        cy="12"
        r="0"
        className={
          isOnline
            ? "fill-green-500"
            : status === "away"
              ? "fill-yellow-500"
              : "fill-red-500"
        }
      >
        <animate
          attributeName="r"
          calcMode="spline"
          keySplines=".52,.6,.25,.99"
          dur={isOnline ? "2s" : "0s"}
          repeatCount={isOnline ? "indefinite" : "0"}
          values={isOnline ? "0;11" : "11;11"}
        />
        <animate
          attributeName="opacity"
          calcMode="spline"
          keySplines=".52,.6,.25,.99"
          dur={isOnline ? "2s" : "0s"}
          repeatCount={isOnline ? "indefinite" : "0"}
          values={isOnline ? "1;0" : "0.4;1"}
        />
      </circle>
    </svg>
  );
}
