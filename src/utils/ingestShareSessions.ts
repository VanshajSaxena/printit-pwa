import { useDraftStore } from "@store/draftStore";
import { del, get, set } from "idb-keyval";
import { ShareSession } from "../sw";
import { createDraftTransaction } from "./createDraftTransaction";
import { getPdfPageCount } from "./getPdfPageCount";

const processedShares = new Set<string>();

export async function ingestShareSession(shareId: string) {
  if (processedShares.has(shareId)) return;
  processedShares.add(shareId);
  const session = await get<ShareSession>(`share-session:${shareId}`);

  if (!session) return;

  const files = [];
  const store = useDraftStore.getState();
  for (const file of session.files) {
    const fileId = file.id;

    await set(`document:${fileId}`, file.buffer);

    store.addDocument(fileId, {
      fileId,
      filename: file.name,
      contentType: file.type,
      createdAt: new Date().toUTCString(),
      pageCount: await getPdfPageCount(file.buffer),
    });
    files.push(file.buffer);
  }
  await del(`share-session:${shareId}`);

  const transactionId = await createDraftTransaction(files, null);
  store.setCurrentDraftTransactionId(transactionId);

  window.dispatchEvent(
    new CustomEvent("navigate", {
      detail: "/home/checkout",
    }),
  );
}
