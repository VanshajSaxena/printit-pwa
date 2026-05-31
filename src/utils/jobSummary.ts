import type { DraftJob, OutputColor } from "@store/structure";

export interface JobDisplaySummary {
  activePagesCount: number;
  totalPagesCount: number;
  hasExclusions: boolean;
  hasMixedColor: boolean;
  hasMixedCopies: boolean;
  hasAnyOverride: boolean;
  /**
   * True total sheets accounting for per-page copy overrides and exclusions.
   * Use this for the right-side column and the grand total.
   */
  effectiveTotalSheets: number;
  effectiveOutputColor: OutputColor;
}

export function deriveJobSummary(job: DraftJob): JobDisplaySummary {
  const activeConfigs = job.pageConfigs.filter((p) => !p.excluded);
  const activePagesCount = activeConfigs.length;
  const totalPagesCount = job.pageConfigs.length;
  const hasExclusions = activePagesCount < totalPagesCount;

  const hasMixedColor = activeConfigs.some(
    (p) => p.outputColor !== undefined && p.outputColor !== job.outputColor,
  );
  const hasMixedCopies = activeConfigs.some(
    (p) => p.copyCount !== undefined && p.copyCount !== job.copyCount,
  );
  const hasAnyOverride = hasExclusions || hasMixedColor || hasMixedCopies;

  const effectiveTotalSheets = activeConfigs.reduce(
    (sum, p) => sum + (p.copyCount ?? job.copyCount),
    0,
  );

  return {
    activePagesCount,
    totalPagesCount,
    hasExclusions,
    hasMixedColor,
    hasMixedCopies,
    hasAnyOverride,
    effectiveTotalSheets,
    effectiveOutputColor: job.outputColor,
  };
}

/**
 * Subtitle beneath the filename.
 * Copies are omitted when mixed — chips surface that detail instead.
 *
 * "3 pages • 1 copy"
 * "2 of 3 pages • 2 copies"
 * "2 of 3 pages"             ← mixed copies, chips cover it
 * "3 pages"                  ← mixed copies, chips cover it
 */
export function formatSubtitle(
  job: DraftJob,
  summary: JobDisplaySummary,
): string {
  const pagesPart = summary.hasExclusions
    ? `${summary.activePagesCount.toString()} of ${summary.totalPagesCount.toString()} pages`
    : `${summary.totalPagesCount.toString()} ${summary.totalPagesCount === 1 ? "page" : "pages"}`;

  if (summary.hasMixedCopies) return pagesPart;

  const copies = job.copyCount;
  return `${pagesPart} • ${copies.toString()} ${copies === 1 ? "copy" : "copies"}`;
}
