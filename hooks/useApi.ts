"use client";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

interface ApiState<T> {
  data: T | null;
  meta: { total: number; page: number; limit: number; totalPages: number } | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook pour les requêtes GET.
 * - `url` : null pour ne pas déclencher le fetch (ex: url conditionnelle)
 * - `deps` : dépendances supplémentaires qui re-déclenchent le fetch
 * - `headers` : headers optionnels (ex: Authorization)
 */
export function useApi<T>(
  url: string | null,
  deps: unknown[] = [],
  headers?: Record<string, string>,
) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    meta: null,
    loading: !!url,
    error: null,
  });

  const headersStr = headers ? JSON.stringify(headers) : null;

  const refetch = useCallback(() => {
    if (!url) return;
    setState((s) => ({ ...s, loading: true, error: null }));
    fetch(url, headersStr ? { headers: JSON.parse(headersStr) as Record<string, string> } : undefined)
      .then((r) => r.json())
      .then((res) => {
        if (res.error) {
          setState((s) => ({ ...s, loading: false, error: res.error }));
          toast.error(res.error);
        } else {
          setState({
            data: res.data ?? null,
            meta: res.meta ?? null,
            loading: false,
            error: null,
          });
        }
      })
      .catch(() => {
        const msg = "Erreur réseau";
        setState((s) => ({ ...s, loading: false, error: msg }));
        toast.error(msg);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, headersStr, ...deps]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { ...state, refetch };
}
