import { client } from "@api/client";
import { Redirect, useParams } from "react-router";

interface RequireVendorPresence {
  selector: string;
}

export function RequireVendorPresence({
  children,
}: {
  children: React.ReactNode;
}) {
  const { selector } = useParams<RequireVendorPresence>();
  const { data } = client.useQuery("get", "/api/v1/vendors/{selector}", {
    params: { path: { selector } },
  });

  if (!currentDraftTransactionId) {
    return <Redirect to={"/home"}></Redirect>;
  }
  return children;
}
