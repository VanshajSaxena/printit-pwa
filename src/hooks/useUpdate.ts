import { UpdateContext } from "@context/UpdateContext";
import { use } from "react";

export function useUpdate() {
  const context = use(UpdateContext);

  if (!context) {
    throw new Error("useUpdate must be used within an UpdateProvider");
  }

  return context;
}
