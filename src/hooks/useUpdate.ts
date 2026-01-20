import { useContext } from "react";
import { UpdateContext } from "../context/UpdateContext";

export function useUpdate() {
  const context = useContext(UpdateContext);

  if (!context) {
    throw new Error("useUpdate must be used within an UpdateProvider");
  }

  return context;
}
