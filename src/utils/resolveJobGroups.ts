import { PDFDocument } from "pdf-lib";
import { getUUID } from "@utils/getUUID";
import type { DraftJob, OutputColor } from "@store/draftStore";
import pLimit from "p-limit";

export interface PreparedJob {
  /** Ephemeral id used to match this job against the backend document response */
  draftId: string;
  file: File;
  filename: string;
  contentType: string;
  outputColor: OutputColor;
  copyCount: number;
}

/**
 * Takes a single DraftJob and its raw File binary and returns one PreparedJob
 * per unique (outputColor, copyCount) group of non-excluded pages.
 *
 * Pages within each group are extracted into a new PDF via pdf-lib, preserving
 * their original order within the group.
 */
export async function resolveJobGroups(
  job: DraftJob,
  file: File,
): Promise<PreparedJob[]> {
  const activeConfigs = job.pageConfigs.filter((p) => !p.excluded);

  if (activeConfigs.length === 0) return [];

  const arrayBuffer = await file.arrayBuffer();
  const srcPdf = await PDFDocument.load(arrayBuffer);

  const groupMap = new Map<
    string,
    { outputColor: OutputColor; copyCount: number; pageNumbers: number[] }
  >();

  for (const cfg of activeConfigs) {
    const effectiveColor = cfg.outputColor ?? job.outputColor;
    const effectiveCopy = cfg.copyCount ?? job.copyCount;
    const key = `${effectiveColor}::${effectiveCopy.toString()}`;

    if (!groupMap.has(key)) {
      groupMap.set(key, {
        outputColor: effectiveColor,
        copyCount: effectiveCopy,
        pageNumbers: [],
      });
    }
    groupMap.get(key)?.pageNumbers.push(cfg.pageNumber);
  }

  const limit = pLimit(4);

  const prepared = await Promise.all(
    Array.from(groupMap.values()).map((group) =>
      limit(async () => {
        const newPdf = await PDFDocument.create();

        const pageIndices = group.pageNumbers.map((n) => n - 1);
        const copiedPages = await newPdf.copyPages(srcPdf, pageIndices);
        copiedPages.forEach((p) => newPdf.addPage(p));

        const bytes = await newPdf.save();

        const blob = new Blob([bytes as Uint8Array<ArrayBuffer>], {
          type: job.document.contentType,
        });

        const extractedFile = new File([blob], job.document.filename, {
          type: job.document.contentType,
        });

        return {
          draftId: getUUID(),
          file: extractedFile,
          filename: job.document.filename,
          contentType: job.document.contentType,
          outputColor: group.outputColor,
          copyCount: group.copyCount,
        } satisfies PreparedJob;
      }),
    ),
  );

  return prepared;
}
