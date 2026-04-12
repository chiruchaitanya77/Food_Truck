/**
 * Returns the full API URL for a given path.
 * The generated API client uses root-relative paths like /api/...
 * which are routed to the API server by the Replit proxy.
 * This helper centralises that pattern for manual fetch calls.
 */
export function getApiUrl(path: string): string {
  return path;
}
