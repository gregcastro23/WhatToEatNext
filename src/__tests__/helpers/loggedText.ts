/**
 * Everything a jest spy was called with, as one searchable string.
 *
 * `JSON.stringify(new Error("secret"))` is `"{}"` (message and stack are not
 * enumerable), so asserting on a stringified `mock.calls` can NEVER catch an
 * Error object that was logged raw. Errors are expanded here instead.
 *
 * Not a test file: `testPathIgnorePatterns` keeps Jest from collecting it.
 */
export function loggedText(calls: ReadonlyArray<ReadonlyArray<unknown>>): string {
  return calls
    .flat()
    .map((arg) => {
      if (arg instanceof Error) return `${arg.name}: ${arg.message}\n${arg.stack ?? ""}`;
      return typeof arg === "string" ? arg : String(JSON.stringify(arg));
    })
    .join("\n");
}
