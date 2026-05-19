"use client";
import { useState, useCallback } from "react";
import { toast } from "sonner";

type Method = "POST" | "PATCH" | "PUT" | "DELETE";

interface MutationState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook pour les mutations (POST, PATCH, PUT, DELETE).
 * - Affiche un toast.error en cas d'erreur
 * - Affiche un toast.success si `successMessage` est fourni
 *
 * @example
 * const { mutate, loading, error } = useMutation<User>("/api/auth/login", "POST");
 * await mutate({ email, password });
 */
export function useMutation<T = unknown>(
  url: string,
  method: Method = "POST",
  extraHeaders?: Record<string, string>,
  successMessage?: string,
) {
  const [state, setState] = useState<MutationState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = useCallback(
    async (body?: unknown): Promise<T | null> => {
      setState({ data: null, loading: true, error: null });
      try {
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json", ...extraHeaders },
          body: body !== undefined ? JSON.stringify(body) : undefined,
        });
        const json = await res.json();
        if (!res.ok || json.error) {
          const errorMsg = json.error ?? `Erreur ${res.status}`;
          setState({ data: null, loading: false, error: errorMsg });
          toast.error(errorMsg);
          return null;
        }
        setState({ data: json.data ?? null, loading: false, error: null });
        if (successMessage) toast.success(successMessage);
        return json.data ?? null;
      } catch {
        const errorMsg = "Erreur réseau";
        setState({ data: null, loading: false, error: errorMsg });
        toast.error(errorMsg);
        return null;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [url, method, JSON.stringify(extraHeaders), successMessage],
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, mutate, reset };
}
