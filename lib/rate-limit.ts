// ============================================================
// GAMEPEDIA TG — Rate limiting basique (fenêtre fixe, en mémoire)
//
// Store en mémoire du process : correct pour un déploiement
// `next start` mono-process (le cas actuel), mais ne partage pas
// l'état entre plusieurs instances (serverless multi-région).
// Migrer vers Upstash Redis si le déploiement évolue en ce sens.
// ============================================================

import { NextRequest } from "next/server";

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/** Retourne true si l'appel est autorisé, false si la limite est atteinte. */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();

  // Purge légère pour éviter une croissance non bornée de la Map.
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) {
      if (now > b.resetAt) buckets.delete(k);
    }
  }

  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

/** Adresse IP du client, au mieux (proxy/CDN en amont). */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
