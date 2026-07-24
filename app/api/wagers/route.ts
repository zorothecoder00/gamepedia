import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import {
  paginated,
  created,
  unauthorized,
  forbidden,
  getPagination,
  tooManyRequests,
  handleApiError,
} from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import {
  assertCanWager,
  assertValidStake,
  assertSameGameEligibility,
  hasGameProfile,
  DEFAULT_COMMISSION_RATE,
} from "@/lib/wagers";
import { parseBody, wagerCreateSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";

// GET /api/wagers — lobby des défis (filtres : game, status, mine)
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const { page, limit, skip } = getPagination(sp);
    const game = sp.get("game") ?? undefined; // slug
    const status = sp.get("status") ?? undefined;
    const mine = sp.get("mine") === "true";

    let playerId: string | undefined;
    if (mine) {
      const user = await getAuthUser(request);
      playerId = user?.player?.id;
      if (!playerId) return unauthorized();
    }

    const where = {
      ...(status && { status: status as never }),
      ...(game && { game: { slug: game } }),
      ...(playerId
        ? { OR: [{ challengerId: playerId }, { opponentId: playerId }] }
        : { visibility: "PUBLIC" as const, status: "OPEN" as const }),
    };

    const [wagers, total] = await Promise.all([
      db.wager.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          game: { select: { name: true, slug: true, logo: true } },
          challenger: { select: { pseudo: true, avatar: true, trustScore: true } },
          opponent: { select: { pseudo: true, avatar: true } },
        },
      }),
      db.wager.count({ where }),
    ]);

    return paginated(wagers, total, page, limit);
  } catch (e) {
    return handleApiError(e);
  }
}

// POST /api/wagers — créer un défi
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user?.player) return unauthorized();
    const challenger = user.player;

    if (!checkRateLimit(`wager-create:${challenger.id}`, 20, 60_000)) {
      return tooManyRequests();
    }

    const {
      gameId,
      opponentId,
      stakeAmount,
      title,
      terms,
      visibility,
      commissionRate,
      acceptDeadline,
      playByDate,
    } = await parseBody(request, wagerCreateSchema);

    await assertCanWager(challenger);
    assertValidStake(stakeAmount);

    // Le créateur doit avoir un profil sur ce jeu
    if (!(await hasGameProfile(challenger.id, gameId))) {
      return forbidden("Vous n'avez pas de profil sur ce jeu.");
    }

    // Défi direct : on vérifie l'éligibilité de l'adversaire dès maintenant
    if (opponentId) {
      await assertSameGameEligibility(challenger.id, opponentId, gameId);
    }

    const wager = await db.wager.create({
      data: {
        gameId,
        challengerId: challenger.id,
        opponentId: opponentId ?? null,
        stakeAmount,
        title,
        terms: terms ?? null,
        visibility: visibility ?? (opponentId ? "PRIVATE" : "PUBLIC"),
        commissionRate: commissionRate ?? DEFAULT_COMMISSION_RATE,
        acceptDeadline: acceptDeadline ? new Date(acceptDeadline) : null,
        playByDate: playByDate ? new Date(playByDate) : null,
      },
    });

    return created(wager);
  } catch (e) {
    return handleApiError(e);
  }
}
