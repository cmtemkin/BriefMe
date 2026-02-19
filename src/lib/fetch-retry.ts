/**
 * Fetch wrapper with exponential backoff retry.
 * Use for external API calls (weather, news, history, etc.)
 */

export interface FetchRetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
  timeoutMs?: number;
}

const DEFAULTS: Required<FetchRetryOptions> = {
  maxRetries: 2,
  baseDelayMs: 500,
  timeoutMs: 10_000,
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchWithRetry(
  input: string | URL,
  init?: RequestInit,
  options?: FetchRetryOptions,
): Promise<Response> {
  const { maxRetries, baseDelayMs, timeoutMs } = { ...DEFAULTS, ...options };

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(input, {
        ...init,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      // Don't retry client errors (4xx), only server errors (5xx)
      if (response.ok || (response.status >= 400 && response.status < 500)) {
        return response;
      }

      lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Fetch failed");
    }

    // Wait before retrying (exponential backoff)
    if (attempt < maxRetries) {
      await sleep(baseDelayMs * 2 ** attempt);
    }
  }

  throw lastError ?? new Error("Fetch failed after retries");
}
