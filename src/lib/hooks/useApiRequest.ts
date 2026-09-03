"use client";

import { useCallback, useState } from "react";

export const HttpMethod = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE",
} as const;

export type HttpMethod = (typeof HttpMethod)[keyof typeof HttpMethod];

type RequestOptions = {
  method: HttpMethod;
  json?: unknown;
};

function extractErrorMessage(data: any, fallback: string): string {
  if (!data) return fallback;
  const fieldErrors = data.errors?.fieldErrors;
  if (data.message && fieldErrors) {
    const details = Object.values(fieldErrors).flat().join("\n");
    return details ? `${data.message}\n${details}` : data.message;
  }
  return data.message ?? fallback;
}

type RequestResult<T> = { ok: true; data: T } | { ok: false };

export function useApiRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(async <T = any>(
    url: string,
    options: RequestOptions,
    fallbackMessage = "処理に失敗しました"
  ): Promise<RequestResult<T>> => {
    setError(null);
    setLoading(true);
    try {
      const init: RequestInit = { method: options.method };
      if (options.json !== undefined) {
        init.headers = { "Content-Type": "application/json" };
        init.body = JSON.stringify(options.json);
      }

      const res = await fetch(url, init);
      const data = await res.json().catch(() => null);
      setLoading(false);
      if (!res.ok) {
        setError(extractErrorMessage(data, fallbackMessage));
        return { ok: false };
      }
      return { ok: true, data };
    } catch (e) {
      setLoading(false);
      setError(fallbackMessage);
      return { ok: false };
    }
  }, []);

  return { request, loading, error, setError };
}
