"use client";
import { useApi } from "./useApi";
import { useState } from "react";

export interface AuthPlayer {
  id: string;
  pseudo: string;
  avatar?: string | null;
  trustScore?: number;
  acceptedWagerCgu?: boolean;
  isAdult?: boolean;
}

export interface AuthMe {
  id: string;
  email: string;
  username: string;
  role: string;
  player?: AuthPlayer | null;
}

/**
 * Lit le token démo dans localStorage et charge l'utilisateur courant.
 * Renvoie aussi l'en-tête Authorization prêt à passer aux hooks.
 */
export function useAuth() {
  const [token] = useState<string | null>(() =>
    typeof window !== "undefined" ? localStorage.getItem("gp_token") : null,
  );

  const authHeader = token ? { Authorization: `Bearer ${token}` } : undefined;
  const { data: me, loading } = useApi<AuthMe>(
    token ? "/api/auth/me" : null,
    [token],
    authHeader,
  );

  return { token, me, player: me?.player ?? null, authHeader, loading };
}
