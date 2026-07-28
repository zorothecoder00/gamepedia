import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeRequest } from "@/lib/test/request-helpers";

function model() {
  return {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    upsert: vi.fn(),
    count: vi.fn(),
  };
}

const dbMock = {
  wager: model(),
  playerGameProfile: model(),
  suspension: model(),
};

vi.mock("@/lib/prisma", () => ({ db: dbMock }));
vi.mock("@/lib/auth", () => ({ getAuthUser: vi.fn() }));
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: vi.fn(() => true) }));

const { POST } = await import("./route");
const { getAuthUser } = await import("@/lib/auth");
const { checkRateLimit } = await import("@/lib/rate-limit");

function makeChallenger(overrides: Record<string, unknown> = {}) {
  return {
    id: "challenger-1",
    pseudo: "Chall",
    isActive: true,
    acceptedWagerCgu: true,
    isAdult: true,
    trustScore: 100,
    ...overrides,
  };
}

const validBody = {
  gameId: "game-1",
  stakeAmount: 500,
  title: "Défi FIFA du samedi",
};

beforeEach(() => {
  vi.clearAllMocks();
  (checkRateLimit as ReturnType<typeof vi.fn>).mockReturnValue(true);
  dbMock.suspension.findFirst.mockResolvedValue(null);
});

describe("POST /api/wagers", () => {
  it("refuse un appelant non authentifié (401)", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const res = await POST(makeRequest("http://localhost/api/wagers", validBody));
    expect(res.status).toBe(401);
  });

  it("refuse un utilisateur sans profil joueur (401)", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1", player: null });
    const res = await POST(makeRequest("http://localhost/api/wagers", validBody));
    expect(res.status).toBe(401);
  });

  it("applique le rate limit par joueur (429)", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1", player: makeChallenger() });
    (checkRateLimit as ReturnType<typeof vi.fn>).mockReturnValue(false);
    const res = await POST(makeRequest("http://localhost/api/wagers", validBody));
    expect(res.status).toBe(429);
  });

  it("rejette un corps invalide (titre manquant) avec un 400 zod", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1", player: makeChallenger() });
    const withoutTitle: Record<string, unknown> = { gameId: validBody.gameId, stakeAmount: validBody.stakeAmount };
    const res = await POST(makeRequest("http://localhost/api/wagers", withoutTitle));
    expect(res.status).toBe(400);
  });

  it("rejette un joueur inéligible (compte suspendu) avec un 403", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1", player: makeChallenger() });
    dbMock.suspension.findFirst.mockResolvedValue({ id: "s1" });
    const res = await POST(makeRequest("http://localhost/api/wagers", validBody));
    expect(res.status).toBe(403);
    expect(dbMock.wager.create).not.toHaveBeenCalled();
  });

  it("rejette une mise sous le minimum autorisé", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1", player: makeChallenger() });
    const res = await POST(
      makeRequest("http://localhost/api/wagers", { ...validBody, stakeAmount: 1 }),
    );
    expect(res.status).toBe(400);
  });

  it("refuse si le créateur n'a pas de profil sur le jeu", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1", player: makeChallenger() });
    dbMock.playerGameProfile.findUnique.mockResolvedValue(null);
    const res = await POST(makeRequest("http://localhost/api/wagers", validBody));
    expect(res.status).toBe(403);
    expect(dbMock.wager.create).not.toHaveBeenCalled();
  });

  it("refuse un défi direct contre soi-même", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1", player: makeChallenger() });
    dbMock.playerGameProfile.findUnique.mockResolvedValue({ id: "profile-1" });
    const res = await POST(
      makeRequest("http://localhost/api/wagers", { ...validBody, opponentId: "challenger-1" }),
    );
    expect(res.status).toBe(400);
    expect(dbMock.wager.create).not.toHaveBeenCalled();
  });

  it("crée un défi public avec la commission par défaut quand aucun adversaire n'est désigné", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1", player: makeChallenger() });
    dbMock.playerGameProfile.findUnique.mockResolvedValue({ id: "profile-1" });
    dbMock.wager.create.mockResolvedValue({ id: "w1" });

    const res = await POST(makeRequest("http://localhost/api/wagers", validBody));

    expect(res.status).toBe(201);
    expect(dbMock.wager.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        challengerId: "challenger-1",
        opponentId: null,
        visibility: "PUBLIC",
        commissionRate: 0,
      }),
    });
  });

  it("crée un défi privé quand un adversaire est désigné, après vérification d'éligibilité", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1", player: makeChallenger() });
    dbMock.playerGameProfile.findUnique.mockResolvedValue({ id: "profile-1" });
    dbMock.wager.create.mockResolvedValue({ id: "w1" });

    const res = await POST(
      makeRequest("http://localhost/api/wagers", { ...validBody, opponentId: "opponent-1" }),
    );

    expect(res.status).toBe(201);
    expect(dbMock.wager.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ opponentId: "opponent-1", visibility: "PRIVATE" }),
    });
  });

  it("refuse un défi direct si l'adversaire n'a pas de profil sur le jeu", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1", player: makeChallenger() });
    // 1er appel (challenger) ok, 2e appel (opponent, dans assertSameGameEligibility) échoue
    dbMock.playerGameProfile.findUnique
      .mockResolvedValueOnce({ id: "profile-1" })
      .mockResolvedValueOnce({ id: "profile-1" })
      .mockResolvedValueOnce(null);
    const res = await POST(
      makeRequest("http://localhost/api/wagers", { ...validBody, opponentId: "opponent-1" }),
    );
    expect(res.status).toBe(400);
    expect(dbMock.wager.create).not.toHaveBeenCalled();
  });
});
