import { PDFDocument } from "pdf-lib";

export async function isPdfEncrypted(file: File): Promise<boolean> {
  try {
    const arrayBuffer = await file.arrayBuffer();

    const pdfDoc = await PDFDocument.load(arrayBuffer, {
      ignoreEncryption: true,
    });

    return pdfDoc.isEncrypted;
  } catch (error) {
    console.error("Failed to load PDF", error);
    return false;
  }
}
