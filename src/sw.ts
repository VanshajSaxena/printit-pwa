import { set } from "idb-keyval";
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";
import { NetworkFirst } from "workbox-strategies";

declare let self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);

cleanupOutdatedCaches();

const navigationHandler = new NetworkFirst({
  cacheName: "navigations",
  networkTimeoutSeconds: 3,
});

const navigationRoute = new NavigationRoute(navigationHandler);
registerRoute(navigationRoute);

interface SkipWaitingMessage {
  type: "SKIP_WAITING";
}

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("message", (event) => {
  const data = event.data as Partial<SkipWaitingMessage>;
  if (data.type === "SKIP_WAITING") {
    void self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (event.request.method === "POST" && url.pathname === "/share-target") {
    event.respondWith(handleShareTarget(event.request));
  }
});

export interface SharedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  buffer: File;
}

export interface ShareSession {
  id: `${string}-${string}-${string}-${string}-${string}`;
  createdAt: number;
  files: SharedFile[];
}

async function handleShareTarget(request: Request): Promise<Response> {
  try {
    const formData = await request.formData();

    const files = formData
      .getAll("file")
      .filter((v): v is File => v instanceof File);

    if (!files.length) {
      return Response.redirect("/", 303);
    }

    const shareId = crypto.randomUUID();

    const sharePayload: ShareSession = {
      id: shareId,
      createdAt: Date.now(),
      files: files.map((file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type,
        size: file.size,
        buffer: file,
      })),
    };

    await set(`share-session:${shareId}`, sharePayload);

    const clients = await self.clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    });

    for (const client of clients) {
      client.postMessage({
        type: "SHARE_SESSION",
        shareId,
      });
    }

    return Response.redirect(`/?share=${shareId}`, 303);
  } catch (err) {
    console.error("Share handling failed", err);
    return Response.redirect("/", 303);
  }
}
