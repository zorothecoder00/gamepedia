"use client";
import { useApi } from "./useApi";

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
 * Charge l'utilisateur courant via le cookie de session httpOnly
 * (envoyé automatiquement par le navigateur, pas besoin de le lire
 * ni de le transmettre manuellement). `silent: true` car un 401
 * (visiteur non connecté) est un état normal, pas une erreur à
 * signaler.
 */
export function useAuth() {
  const { data: me, loading, refetch } = useApi<AuthMe>(
    "/api/auth/me",
    [],
    undefined,
    { silent: true },
  );

  return { me, player: me?.player ?? null, loading, isAuthenticated: !!me, refetch };
}
