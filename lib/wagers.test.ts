import { describe, it, expect, vi, beforeEach } from "vitest";
import { WagerStatus, DepositStatus } from "@prisma/client";
import type { Player, WagerReport, WagerDeposit } from "@prisma/client";

const dbMock = {
  playerGameProfile: { findUnique: vi.fn() },
  suspension: { findFirst: vi.fn() },
  wager: { findFirst: vi.fn() },
};

vi.mock("./prisma", () => ({ db: dbMock }));

const {
  WAGER_TRANSITIONS,
  canTransition,
  assertTransition,
  assertCanWager,
  assertSameGameEligibility,
  assertValidStake,
  isParticipant,
  opponentOf,
  computePayout,
  resolveReports,
  bothDepositsConfirmed,
  markPaymentDefault,
  hasActiveWagers,
  TERMINAL_WAGER_STATUSES,
  MIN_STAKE,
  MAX_STAKE,
  MIN_TRUST_SCORE,
  WagerError,
} = await import("./wagers");

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: "p1",
    isActive: true,
    acceptedWagerCgu: true,
    isAdult: true,
    trustScore: 100,
    ...overrides,
  } as Player;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("machine à états des wagers", () => {
  const allStatuses = Object.keys(WAGER_TRANSITIONS) as WagerStatus[];

  it("n'autorise que les transitions déclarées dans WAGER_TRANSITIONS", () => {
    for (const from of allStatuses) {
      for (const to of allStatuses) {
        const expected = WAGER_TRANSITIONS[from].includes(to);
        expect(canTransition(from, to)).toBe(expected);
      }
    }
  });

  it("les statuts terminaux (SETTLED, CANCELLED, EXPIRED) n'ont aucune sortie", () => {
    expect(WAGER_TRANSITIONS[WagerStatus.SETTLED]).toEqual([]);
    expect(WAGER_TRANSITIONS[WagerStatus.CANCELLED]).toEqual([]);
    expect(WAGER_TRANSITIONS[WagerStatus.EXPIRED]).toEqual([]);
  });

  it("accepte une transition valide sans lever d'erreur", () => {
    expect(() => assertTransition(WagerStatus.OPEN, WagerStatus.ACCEPTED)).not.toThrow();
  });

  it("lève une WagerError 409 sur une transition invalide", () => {
    expect(() => assertTransition(WagerStatus.SETTLED, WagerStatus.ONGOING)).toThrow(WagerError);
    try {
      assertTransition(WagerStatus.OPEN, WagerStatus.SETTLED);
      expect.fail("devait lever");
    } catch (e) {
      expect(e).toBeInstanceOf(WagerError);
      expect((e as InstanceType<typeof WagerError>).status).toBe(409);
    }
  });

  it("refuse de revenir en arrière depuis DISPUTED vers ONGOING", () => {
    expect(canTransition(WagerStatus.DISPUTED, WagerStatus.ONGOING)).toBe(false);
  });
});

describe("computePayout", () => {
  it("répartit sans commission (taux 0)", () => {
    expect(computePayout(1000, 0)).toEqual({ pot: 2000, commission: 0, payout: 2000 });
  });

  it("prélève la commission et reverse le reste", () => {
    expect(computePayout(1000, 10)).toEqual({ pot: 2000, commission: 200, payout: 1800 });
  });

  it("arrondit la commission à l'entier (devise sans décimale)", () => {
    // pot=1000, taux=15% -> 150 exact ; on vérifie un cas avec arrondi réel
    expect(computePayout(333, 15)).toEqual({ pot: 666, commission: 100, payout: 566 });
  });

  it("clampe un taux de commission négatif à 0", () => {
    expect(computePayout(500, -20)).toEqual({ pot: 1000, commission: 0, payout: 1000 });
  });

  it("clampe un taux de commission > 100 à 100", () => {
    expect(computePayout(500, 250)).toEqual({ pot: 1000, commission: 1000, payout: 0 });
  });
});

describe("assertValidStake", () => {
  it("rejette une mise sous le minimum", () => {
    expect(() => assertValidStake(MIN_STAKE - 1)).toThrow(WagerError);
  });

  it("accepte le minimum exact", () => {
    expect(() => assertValidStake(MIN_STAKE)).not.toThrow();
  });

  it("accepte le maximum exact", () => {
    expect(() => assertValidStake(MAX_STAKE)).not.toThrow();
  });

  it("rejette une mise au-dessus du maximum", () => {
    expect(() => assertValidStake(MAX_STAKE + 1)).toThrow(WagerError);
  });

  it("rejette une valeur non finie (NaN, Infinity)", () => {
    expect(() => assertValidStake(NaN)).toThrow(WagerError);
    expect(() => assertValidStake(Infinity)).toThrow(WagerError);
  });
});

describe("resolveReports", () => {
  it("signale un rapport incomplet avec moins de deux déclarations", () => {
    const reports = [{ reporterId: "p1", claimedWinnerId: "p1" }] as WagerReport[];
    expect(resolveReports(reports)).toEqual({ complete: false, agree: false, winnerId: null });
  });

  it("désigne le vainqueur quand les deux déclarations concordent", () => {
    const reports = [
      { reporterId: "p1", claimedWinnerId: "p1" },
      { reporterId: "p2", claimedWinnerId: "p1" },
    ] as WagerReport[];
    expect(resolveReports(reports)).toEqual({ complete: true, agree: true, winnerId: "p1" });
  });

  it("signale un litige quand les déclarations divergent", () => {
    const reports = [
      { reporterId: "p1", claimedWinnerId: "p1" },
      { reporterId: "p2", claimedWinnerId: "p2" },
    ] as WagerReport[];
    expect(resolveReports(reports)).toEqual({ complete: true, agree: false, winnerId: null });
  });
});

describe("isParticipant / opponentOf", () => {
  const wager = { challengerId: "p1", opponentId: "p2" };

  it("reconnaît le challenger et l'adversaire comme participants", () => {
    expect(isParticipant(wager, "p1")).toBe(true);
    expect(isParticipant(wager, "p2")).toBe(true);
  });

  it("rejette un tiers", () => {
    expect(isParticipant(wager, "p3")).toBe(false);
  });

  it("retourne l'adversaire correct selon le participant donné", () => {
    expect(opponentOf(wager, "p1")).toBe("p2");
    expect(opponentOf(wager, "p2")).toBe("p1");
  });

  it("retourne null pour un tiers", () => {
    expect(opponentOf(wager, "p3")).toBeNull();
  });
});

describe("bothDepositsConfirmed", () => {
  it("faux si moins de deux dépôts confirmés", () => {
    const deposits = [{ status: DepositStatus.CONFIRMED }] as WagerDeposit[];
    expect(bothDepositsConfirmed(deposits)).toBe(false);
  });

  it("vrai quand les deux dépôts sont confirmés", () => {
    const deposits = [
      { status: DepositStatus.CONFIRMED },
      { status: DepositStatus.CONFIRMED },
    ] as WagerDeposit[];
    expect(bothDepositsConfirmed(deposits)).toBe(true);
  });

  it("ignore les dépôts non confirmés (PENDING)", () => {
    const deposits = [
      { status: DepositStatus.CONFIRMED },
      { status: DepositStatus.PENDING },
    ] as WagerDeposit[];
    expect(bothDepositsConfirmed(deposits)).toBe(false);
  });
});

describe("assertCanWager", () => {
  it("laisse passer un joueur éligible", async () => {
    dbMock.suspension.findFirst.mockResolvedValue(null);
    await expect(assertCanWager(makePlayer())).resolves.toBeUndefined();
  });

  it("rejette un compte inactif", async () => {
    await expect(assertCanWager(makePlayer({ isActive: false }))).rejects.toThrow(WagerError);
  });

  it("rejette un joueur n'ayant pas accepté les CGU paris", async () => {
    await expect(assertCanWager(makePlayer({ acceptedWagerCgu: false }))).rejects.toThrow(WagerError);
  });

  it("rejette un mineur", async () => {
    await expect(assertCanWager(makePlayer({ isAdult: false }))).rejects.toThrow(WagerError);
  });

  it("rejette un score de confiance insuffisant", async () => {
    await expect(
      assertCanWager(makePlayer({ trustScore: MIN_TRUST_SCORE - 1 })),
    ).rejects.toThrow(WagerError);
  });

  it("accepte un score de confiance égal au seuil minimal", async () => {
    dbMock.suspension.findFirst.mockResolvedValue(null);
    await expect(
      assertCanWager(makePlayer({ trustScore: MIN_TRUST_SCORE })),
    ).resolves.toBeUndefined();
  });

  it("rejette un joueur suspendu", async () => {
    dbMock.suspension.findFirst.mockResolvedValue({ id: "s1" });
    await expect(assertCanWager(makePlayer())).rejects.toThrow(WagerError);
  });
});

describe("assertSameGameEligibility", () => {
  it("refuse qu'un joueur se défie lui-même", async () => {
    await expect(assertSameGameEligibility("p1", "p1", "g1")).rejects.toThrow(WagerError);
  });

  it("refuse si le challenger n'a pas de profil sur le jeu", async () => {
    dbMock.playerGameProfile.findUnique
      .mockResolvedValueOnce(null) // challenger
      .mockResolvedValueOnce({ id: "prof2" }); // opponent
    await expect(assertSameGameEligibility("p1", "p2", "g1")).rejects.toThrow(WagerError);
  });

  it("refuse si l'adversaire n'a pas de profil sur le jeu", async () => {
    dbMock.playerGameProfile.findUnique
      .mockResolvedValueOnce({ id: "prof1" }) // challenger
      .mockResolvedValueOnce(null); // opponent
    await expect(assertSameGameEligibility("p1", "p2", "g1")).rejects.toThrow(WagerError);
  });

  it("accepte quand les deux joueurs ont un profil sur le jeu", async () => {
    dbMock.playerGameProfile.findUnique
      .mockResolvedValueOnce({ id: "prof1" })
      .mockResolvedValueOnce({ id: "prof2" });
    await expect(assertSameGameEligibility("p1", "p2", "g1")).resolves.toBeUndefined();
  });
});

describe("markPaymentDefault", () => {
  it("incrémente les défauts de paiement et fait baisser le score de confiance", async () => {
    const tx = {
      player: {
        findUnique: vi.fn().mockResolvedValue({ trustScore: 40 }),
        update: vi.fn().mockResolvedValue({}),
      },
    };
    await markPaymentDefault(tx as never, "p1");
    expect(tx.player.update).toHaveBeenCalledWith({
      where: { id: "p1" },
      data: { paymentDefaults: { increment: 1 }, trustScore: 15 },
    });
  });

  it("plafonne le score de confiance à 0 (pas de négatif)", async () => {
    const tx = {
      player: {
        findUnique: vi.fn().mockResolvedValue({ trustScore: 10 }),
        update: vi.fn().mockResolvedValue({}),
      },
    };
    await markPaymentDefault(tx as never, "p1");
    expect(tx.player.update).toHaveBeenCalledWith({
      where: { id: "p1" },
      data: { paymentDefaults: { increment: 1 }, trustScore: 0 },
    });
  });

  it("ne fait rien si le joueur est introuvable", async () => {
    const tx = {
      player: {
        findUnique: vi.fn().mockResolvedValue(null),
        update: vi.fn(),
      },
    };
    await markPaymentDefault(tx as never, "p1");
    expect(tx.player.update).not.toHaveBeenCalled();
  });
});

describe("hasActiveWagers", () => {
  it("faux si aucun défi non terminal n'est trouvé", async () => {
    dbMock.wager.findFirst.mockResolvedValue(null);
    await expect(hasActiveWagers("p1")).resolves.toBe(false);
  });

  it("vrai si un défi non terminal existe (challenger ou adversaire)", async () => {
    dbMock.wager.findFirst.mockResolvedValue({ id: "w1" });
    await expect(hasActiveWagers("p1")).resolves.toBe(true);
  });

  it("interroge sur les deux rôles et exclut les statuts terminaux", async () => {
    dbMock.wager.findFirst.mockResolvedValue(null);
    await hasActiveWagers("p1");
    expect(dbMock.wager.findFirst).toHaveBeenCalledWith({
      where: {
        OR: [{ challengerId: "p1" }, { opponentId: "p1" }],
        status: { notIn: TERMINAL_WAGER_STATUSES },
      },
      select: { id: true },
    });
  });

  it("les statuts terminaux sont exactement SETTLED, CANCELLED, EXPIRED", () => {
    expect(TERMINAL_WAGER_STATUSES.sort()).toEqual(["CANCELLED", "EXPIRED", "SETTLED"].sort());
  });
});
