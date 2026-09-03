export function resolveVenueLabel(venue: {
  type: string;
  name?: string | null;
}): string {
  const trimmed = venue.name?.trim();
  if (venue.type === "restaurant") {
    return trimmed && trimmed.length > 0 ? trimmed : "A restaurant";
  }
  if (venue.type === "home") {
    return trimmed && trimmed.length > 0 ? trimmed : "Home";
  }
  return trimmed && trimmed.length > 0 ? trimmed : "Elsewhere";
}

export function resolveErrorMessage(
  statusCode: number | null,
  error: string | null,
): string {
  if (statusCode === 403) {
    return "This table is set for its own circle.";
  }
  return error && error.length > 0 ? error : "This table could not be found.";
}
