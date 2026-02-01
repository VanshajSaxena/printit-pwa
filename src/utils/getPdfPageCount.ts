import { PDFDocument } from "pdf-lib";

export async function getPdfPageCount(file: File): Promise<number> {
  try {
    const arrayBuffer = await file.arrayBuffer();

    const pdfDoc = await PDFDocument.load(arrayBuffer, {
      ignoreEncryption: true,
    });

    return pdfDoc.getPageCount();
  } catch (error) {
    console.error("Failed to count PDF pages", error);
    return 0;
  }
}
