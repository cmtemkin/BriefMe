"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body className="flex min-h-screen items-center justify-center bg-white text-gray-900">
        <div className="px-4 text-center">
          <div className="mb-4 text-5xl">⚠️</div>
          <h2 className="text-xl font-bold">Something went wrong</h2>
          <p className="mt-2 text-sm text-gray-500">
            A critical error occurred. Please try refreshing the page.
          </p>
          <button
            onClick={reset}
            className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
