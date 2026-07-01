import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import {
  ok,
  badRequest,
  notFound,
  unauthorized,
  forbidden,
  serverError,
} from "@/lib/api";
import { getAuthUser, isStaff } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

interface ResultInput {
  id: string;
  score?: number | null;
  isForfeit?: boolean;
}

// POST /api/matches/[id]/result — saisir le résultat d'un match (staff)
//
// Corps attendu :
//   { participants: [{ id, score, isForfeit }], notes?, status? }
//
// Le vainqueur et le statut du match sont dérivés automatiquement :
//   - forfait      → statut FORFEITED, l'unique non-forfait l'emporte
//   - scores       → statut COMPLETED, le plus haut score l'emporte
//   - égalité      → match nul (aucun vainqueur), valide en poule/round-robin
//   - status=CANCELLED → réinitialise le match (scores/vainqueur effacés)
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const user = await getAuthUser(request);
    if (!user) return unauthorized();
    if (!isStaff(user.role)) return forbidden("Réservé à l'administration.");

    const match = await db.match.findUnique({
      where: { id },
      include: {
        participants: true,
        stage: { include: { tournament: { select: { name: true } } } },
      },
    });
    if (!match) return notFound("Match introuvable");
    if (match.participants.length < 2) {
      return badRequest("Le match n'a pas encore ses deux participants.");
    }

    const body = (await request.json()) as {
      participants?: ResultInput[];
      notes?: string;
      status?: string;
    };

    // ── Annulation : on réinitialise proprement ───────────────
    if (body.status === "CANCELLED") {
      const updated = await db.$transaction(async (tx) => {
        await tx.matchParticipant.updateMany({
          where: { matchId: id },
          data: { score: null, isWinner: null, isForfeit: false },
        });
        return tx.match.update({
          where: { id },
          data: { status: "CANCELLED", endedAt: null, notes: body.notes ?? null },
          include: { participants: { include: { team: { select: { name: true, tag: true } } } } },
        });
      });
      await writeAudit(user, match, "CANCEL");
      return ok(updated);
    }

    // ── Validation des entrées ────────────────────────────────
    const inputs = body.participants;
    if (!Array.isArray(inputs) || inputs.length !== match.participants.length) {
      return badRequest("Un résultat est attendu pour chaque participant.");
    }

    const knownIds = new Set(match.participants.map((p) => p.id));
    const byId = new Map<string, { score: number | null; isForfeit: boolean }>();
    for (const raw of inputs) {
      if (!raw?.id || !knownIds.has(raw.id)) {
        return badRequest("Participant inconnu pour ce match.");
      }
      if (byId.has(raw.id)) {
        return badRequest("Participant en double dans la requête.");
      }
      const isForfeit = raw.isForfeit === true;
      let score: number | null = null;
      if (raw.score !== null && raw.score !== undefined && String(raw.score).trim() !== "") {
        score = Number(raw.score);
        if (!Number.isInteger(score) || score < 0) {
          return badRequest("Les scores doivent être des entiers positifs.");
        }
      }
      byId.set(raw.id, { score, isForfeit });
    }

    const entries = match.participants.map((p) => ({
      id: p.id,
      ...byId.get(p.id)!,
    }));

    // ── Dérivation du vainqueur et du statut ──────────────────
    const forfeiters = entries.filter((e) => e.isForfeit);
    let status: "COMPLETED" | "FORFEITED";
    let winnerId: string | null = null;

    if (forfeiters.length > 0) {
      status = "FORFEITED";
      const remaining = entries.filter((e) => !e.isForfeit);
      if (remaining.length === 1) {
        winnerId = remaining[0].id;
      } else if (remaining.length > 1) {
        winnerId = uniqueMaxScore(remaining);
      }
      // tous forfait → aucun vainqueur (double no-show)
    } else {
      if (entries.some((e) => e.score === null)) {
        return badRequest("Renseignez le score de chaque participant.");
      }
      status = "COMPLETED";
      winnerId = uniqueMaxScore(entries);
    }

    const updated = await db.$transaction(async (tx) => {
      for (const e of entries) {
        await tx.matchParticipant.update({
          where: { id: e.id },
          data: {
            score: e.score,
            isForfeit: e.isForfeit,
            isWinner: winnerId ? e.id === winnerId : false,
          },
        });
      }
      return tx.match.update({
        where: { id },
        data: {
          status,
          endedAt: new Date(),
          notes: body.notes?.trim() || null,
        },
        include: { participants: { include: { team: { select: { name: true, tag: true } } } } },
      });
    });

    await writeAudit(user, match, "UPDATE");
    return ok(updated);
  } catch {
    return serverError();
  }
}

/** Renvoie l'id du participant au score strictement maximal, ou null si égalité. */
function uniqueMaxScore(entries: { id: string; score: number | null }[]): string | null {
  let best = -Infinity;
  let bestId: string | null = null;
  let tie = false;
  for (const e of entries) {
    const s = e.score ?? -Infinity;
    if (s > best) {
      best = s;
      bestId = e.id;
      tie = false;
    } else if (s === best) {
      tie = true;
    }
  }
  return tie ? null : bestId;
}

async function writeAudit(
  user: { id: string; username: string },
  match: { id: string; stage: { tournament: { name: string } } },
  action: "UPDATE" | "CANCEL",
) {
  await db.auditLog.create({
    data: {
      actorId: user.id,
      actorName: user.username,
      action,
      entityType: "MATCH",
      entityId: match.id,
      entityName: match.stage.tournament.name,
      meta: { kind: "match_result_entry" },
    },
  });
}
