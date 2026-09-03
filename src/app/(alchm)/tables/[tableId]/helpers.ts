export function resolveVenueLabel(venue: {
  type: string;
  name?: string | null;
}): string {
  if (venue.type === "restaurant") {
    return venue.name || "A restaurant";
  }
  if (venue.type === "home") {
    return venue.name || "Home";
  }
  return venue.name || "Elsewhere";
}

export function resolveErrorMessage(
  statusCode: number | null,
  error: string | null,
): string {
  if (statusCode === 403) {
    return "This table is set for its own circle.";
  }
  return error || "This table could not be found.";
}
