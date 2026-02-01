export function PulseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="32"
      height="32"
      {...props}
    >
      <circle cx="12" cy="12" r="3" className="fill-green-500" />
      <circle cx="12" cy="12" r="0" className="fill-green-500">
        <animate
          attributeName="r"
          calcMode="spline"
          dur="2s"
          keySplines=".52,.6,.25,.99"
          repeatCount="indefinite"
          values="0;11"
        />
        <animate
          attributeName="opacity"
          calcMode="spline"
          dur="2s"
          keySplines=".52,.6,.25,.99"
          repeatCount="indefinite"
          values="1;0"
        />
      </circle>
    </svg>
  );
}
