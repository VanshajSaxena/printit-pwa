import { useRegisterSW } from "virtual:pwa-register/react";
import { UpdateContext } from "./UpdateContext";

export type UpdateContextType = ReturnType<typeof useRegisterSW> | undefined;

export function UpdateProvider({ children }: { children: React.ReactNode }) {
  const updateContext = useRegisterSW();

  return <UpdateContext value={updateContext}>{children}</UpdateContext>;
}
