import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeRequest, withParams } from "@/lib/test/request-helpers";

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
  player: model(),
  notification: model(),
};

vi.mock("@/lib/prisma", () => ({ db: dbMock }));
vi.mock("@/lib/auth", () => ({ getAuthUser: vi.fn() }));

const { POST } = await import("./route");
const { getAuthUser } = await import("@/lib/auth");

function makeOpponent(overrides: Record<string, unknown> = {}) {
  return {
    id: "opponent-1",
    pseudo: "Adversaire",
    isActive: true,
    acceptedWagerCgu: true,
    isAdult: true,
    trustScore: 100,
    ...overrides,
  };
}

const openWager = {
  id: "w1",
  status: "OPEN",
  challengerId: "challenger-1",
  opponentId: null,
  gameId: "game-1",
  title: "Défi FIFA",
};

beforeEach(() => {
  vi.clearAllMocks();
  dbMock.suspension.findFirst.mockResolvedValue(null);
  dbMock.playerGameProfile.findUnique.mockResolvedValue({ id: "profile" });
});

describe("POST /api/wagers/[id]/accept", () => {
  it("refuse un appelant non authentifié (401)", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const res = await POST(makeRequest("http://localhost/api/wagers/w1/accept", {}), withParams("w1"));
    expect(res.status).toBe(401);
  });

  it("404 si le défi n'existe pas", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1", player: makeOpponent() });
    dbMock.wager.findUnique.mockResolvedValue(null);
    const res = await POST(makeRequest("http://localhost/api/wagers/w1/accept", {}), withParams("w1"));
    expect(res.status).toBe(404);
  });

  it("refuse le challenger qui tente d'accepter son propre défi", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "u1",
      player: makeOpponent({ id: "challenger-1" }),
    });
    dbMock.wager.findUnique.mockResolvedValue(openWager);
    const res = await POST(makeRequest("http://localhost/api/wagers/w1/accept", {}), withParams("w1"));
    expect(res.status).toBe(403);
    expect(dbMock.wager.update).not.toHaveBeenCalled();
  });

  it("refuse un tiers sur un défi direct adressé à un autre joueur", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1", player: makeOpponent({ id: "tiers-1" }) });
    dbMock.wager.findUnique.mockResolvedValue({ ...openWager, opponentId: "opponent-1" });
    const res = await POST(makeRequest("http://localhost/api/wagers/w1/accept", {}), withParams("w1"));
    expect(res.status).toBe(403);
  });

  it("refuse d'accepter un défi qui n'est plus OPEN (transition invalide, 409)", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1", player: makeOpponent() });
    dbMock.wager.findUnique.mockResolvedValue({ ...openWager, status: "CANCELLED" });
    const res = await POST(makeRequest("http://localhost/api/wagers/w1/accept", {}), withParams("w1"));
    expect(res.status).toBe(409);
    expect(dbMock.wager.update).not.toHaveBeenCalled();
  });

  it("refuse un adversaire inéligible (ex : suspendu)", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1", player: makeOpponent() });
    dbMock.wager.findUnique.mockResolvedValue(openWager);
    dbMock.suspension.findFirst.mockResolvedValue({ id: "s1" });
    const res = await POST(makeRequest("http://localhost/api/wagers/w1/accept", {}), withParams("w1"));
    expect(res.status).toBe(403);
    expect(dbMock.wager.update).not.toHaveBeenCalled();
  });

  it("accepte un défi ouvert, passe à ACCEPTED et notifie le challenger", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1", player: makeOpponent() });
    dbMock.wager.findUnique.mockResolvedValue(openWager);
    dbMock.wager.update.mockResolvedValue({ ...openWager, status: "ACCEPTED", opponentId: "opponent-1" });
    dbMock.player.findUnique.mockResolvedValue({ userId: "user-challenger" });

    const res = await POST(makeRequest("http://localhost/api/wagers/w1/accept", {}), withParams("w1"));

    expect(res.status).toBe(200);
    expect(dbMock.wager.update).toHaveBeenCalledWith({
      where: { id: "w1" },
      data: expect.objectContaining({ opponentId: "opponent-1", status: "ACCEPTED" }),
    });
    expect(dbMock.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: "user-challenger", type: "WAGER" }),
      }),
    );
  });
});
