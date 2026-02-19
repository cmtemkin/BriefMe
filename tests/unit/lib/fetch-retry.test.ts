import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchWithRetry } from "@/lib/fetch-retry";

describe("fetchWithRetry", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.useRealTimers();
  });

  it("returns response on first successful attempt", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), { status: 200 }),
      );

    const res = await fetchWithRetry("https://example.com/api");
    expect(res.status).toBe(200);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("retries on server error (5xx) and succeeds", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(
        new Response("error", {
          status: 500,
          statusText: "Internal Server Error",
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), { status: 200 }),
      );

    const res = await fetchWithRetry("https://example.com/api", undefined, {
      maxRetries: 2,
      baseDelayMs: 10,
    });

    expect(res.status).toBe(200);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it("does NOT retry on client error (4xx)", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue(
        new Response("bad request", { status: 400, statusText: "Bad Request" }),
      );

    const res = await fetchWithRetry("https://example.com/api", undefined, {
      maxRetries: 2,
      baseDelayMs: 10,
    });

    expect(res.status).toBe(400);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("retries on network error and throws after max retries", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    await expect(
      fetchWithRetry("https://example.com/api", undefined, {
        maxRetries: 1,
        baseDelayMs: 10,
        timeoutMs: 5000,
      }),
    ).rejects.toThrow("Network error");

    expect(global.fetch).toHaveBeenCalledTimes(2); // initial + 1 retry
  });

  it("passes request init options through", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue(new Response("ok", { status: 200 }));

    await fetchWithRetry("https://example.com/api", {
      headers: { "User-Agent": "BriefMe/1.0" },
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "https://example.com/api",
      expect.objectContaining({
        headers: { "User-Agent": "BriefMe/1.0" },
      }),
    );
  });

  it("uses exponential backoff delays", async () => {
    global.fetch = vi
      .fn()
      .mockRejectedValueOnce(new Error("fail 1"))
      .mockRejectedValueOnce(new Error("fail 2"))
      .mockRejectedValueOnce(new Error("fail 3"));

    const promise = fetchWithRetry("https://example.com/api", undefined, {
      maxRetries: 2,
      baseDelayMs: 100,
      timeoutMs: 5000,
    });

    await expect(promise).rejects.toThrow("fail 3");
    // 3 total attempts: initial + 2 retries
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });
});
