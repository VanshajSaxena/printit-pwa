export const formatDistance = (meters: number): string => {
  if (meters < 1000) return `${Math.round(meters).toString()} m`;
  return `${(meters / 1000).toFixed(1)} km`;
};
