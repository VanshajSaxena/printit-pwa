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
    event.respondWith(
      (async () => {
        try {
          const formData = await event.request.formData();
          const file = formData.get("file") as File | undefined;

          const id = crypto.randomUUID();
          if (file) {
            const cache = await caches.open("printit-shared-files");
            await cache.put(
              `/shared-file/${id}`,
              new Response(file, {
                headers: {
                  "Content-Type": file.type,
                  "Content-Length": file.size.toString(),
                },
              }),
            );
          }

          return Response.redirect(`/?shared=${id}`, 303);
        } catch (error) {
          console.error("Error receiving shared file:", error);
          return Response.redirect("/", 303);
        }
      })(),
    );
  }
});
