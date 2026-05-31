import { useDraftStore } from "@store/draftStore";
import { getPdfPageCount } from "@utils/getPdfPageCount";
import { getUUID } from "@utils/getUUID";
import { isPdfEncryptedFast } from "@utils/isPdfEncryptedFast";
import { setMany } from "idb-keyval";

export const createDraftTransaction = async (
  pdfFiles: File[],
  vendorId?: number,
) => {
  const encryptionChecks = await Promise.all(
    pdfFiles.map(async (file) => {
      const encrypted = await isPdfEncryptedFast(file);
      return {
        file,
        encrypted,
      };
    }),
  );

  const unencryptedFiles = encryptionChecks
    .filter(({ encrypted }) => !encrypted)
    .map(({ file }) => file);

  const processedData = await Promise.all(
    unencryptedFiles.map(async (file) => {
      const fileId = getUUID();
      const pageCount = await getPdfPageCount(file);
      const storageObject = {
        id: fileId,
        file: file,
        filename: file.name,
        mimeType: file.type,
      };
      return {
        idbEntry: [fileId, storageObject] as [string, typeof storageObject],
        metadata: {
          fileId,
          filename: file.name,
          contentType: file.type,
          pageCount,
        },
      };
    }),
  );

  const idbEntries = processedData.map((data) => data.idbEntry);
  const documentsMetadata = processedData.map((data) => data.metadata);

  await setMany(idbEntries);

  return useDraftStore
    .getState()
    .createDraftTransaction(documentsMetadata, vendorId);
};
