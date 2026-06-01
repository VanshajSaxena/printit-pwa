import { useEffect, useState } from "react";

export function ShareTargetPage() {
  const [label, setLabel] = useState("");
  useEffect(() => {
    setLabel(window.location.href);
    console.log(window.location.href);
  }, []);
  return (
    <>
      <h3>Share Target Page</h3>
      <p>{label}</p>
    </>
  );
}
