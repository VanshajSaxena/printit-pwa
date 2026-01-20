import { createContext } from "react";
import { UpdateContextType } from "./UpdateProvider";

export const UpdateContext = createContext<UpdateContextType>(undefined);
