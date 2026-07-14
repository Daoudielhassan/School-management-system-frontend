/**
 * Centralised API error message extraction.
 *
 * The HTTP layer (`src/config/api-http.ts`) throws an `Error` whose message is
 * formatted as `"{status}: {message}"` and which carries `.status` and `.data`
 * (the parsed backend body, e.g. Spring's `{ status, error, message, timestamp }`).
 *
 * `extractErrorMessage` unwraps the most specific, user-friendly message from
 * that shape. Use it wherever an API error must be surfaced to the user so the
 * behaviour stays consistent across every feature.
 */

export interface ApiError extends Error {
  status?: number;
  data?: unknown;
}

/** Returns true for the augmented error thrown by the HTTP layer. */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof Error;
}

/**
 * Extract the clearest human-readable message from an unknown thrown value.
 *
 * @param error    The caught value (usually an {@link ApiError}).
 * @param fallback Message used when nothing more specific can be derived.
 */
export function extractErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (!error) return fallback;

  const data = (error as ApiError).data;
  if (data && typeof data === 'object') {
    const body = data as Record<string, unknown>;
    if (typeof body.message === 'string' && body.message) return body.message;
    if (typeof body.error === 'string' && body.error) return body.error;
  }
  if (typeof data === 'string' && data) return data;

  if (error instanceof Error && error.message) {
    const msg = error.message;
    // Strip a leading "404: " / "409: " status prefix added by the HTTP layer.
    const colonIdx = msg.indexOf(': ');
    if (colonIdx !== -1 && !Number.isNaN(Number(msg.slice(0, colonIdx)))) {
      return msg.slice(colonIdx + 2);
    }
    return msg;
  }

  return fallback;
}
