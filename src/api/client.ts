import createFetchClient from "openapi-fetch";
import type { paths } from "./cloud-api-types";
import createClient from "openapi-react-query";
import { QueryClient } from "@tanstack/react-query";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

export const fetchClient = createFetchClient<paths>({ baseUrl });

export const queryClient = new QueryClient();

export const client = createClient<paths>(fetchClient);
