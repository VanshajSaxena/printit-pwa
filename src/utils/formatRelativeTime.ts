/** Converts an ISO timestamp to a human-readable relative label. */
export const formatRelativeTime = (isoString: string): string => {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins.toString()}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours.toString()}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays.toString()}d ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  return `${diffWeeks.toString()}w ago`;
};
