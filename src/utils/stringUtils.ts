/**
 * Capitalizes the first letter of a string
 * @param str The string to capitalize
 * @returns The string with the first letter capitalized
 */
export function capitalizeFirstLetter(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Converts a camelCase or snake_case string to Title Case
 * @param str The string to convert
 * @returns The string in Title Case with spaces
 */
export function formatToTitleCase(str: string): string {
  if (!str) return "";

  // Replace underscores and hyphens with spaces
  const spacedStr = str.replace(/[_-]/g, " ");

  // Handle camelCase by adding spaces before capital letters
  const withSpaces = spacedStr.replace(/([A-Z])/g, " $1");

  // Capitalize first letter of each word and trim extra spaces
  return withSpaces
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
    .trim();
}

/**
 * Truncates a string to a specified length and adds ellipsis if needed
 * @param str The string to truncate
 * @param length The maximum length
 * @returns The truncated string
 */
export function truncateString(str: string, length: number): string {
  if (!str) return "";
  if (str.length <= length) return str;
  return `${str.substring(0, length)}...`;
}

/**
 * Removes HTML tags from a string
 * @param html The HTML string
 * @returns The plain text string
 */
export function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>?/gm, "");
}

/**
 * Slugifies a string for use in URLs
 * @param str The string to slugify
 * @returns The slugified string
 */
export function slugify(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}
