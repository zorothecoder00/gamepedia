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
  wagerDeposit: model(),
  player: model(),
  notification: model(),
  $transaction: vi.fn(),
};
dbMock.$transaction.mockImplementation(async (fn: (tx: typeof dbMock) => unknown) => fn(dbMock));

vi.mock("@/lib/prisma", () => ({ db: dbMock }));
vi.mock("@/lib/auth", () => ({ getAuthUser: vi.fn() }));

const { POST } = await import("./route");
const { getAuthUser } = await import("@/lib/auth");

const openWagerNoDeposits = {
  id: "w1",
  status: "OPEN",
  challengerId: "challenger-1",
  opponentId: null,
  title: "Défi FIFA",
  deposits: [],
};

const awaitingDepositsWager = {
  id: "w1",
  status: "AWAITING_DEPOSITS",
  challengerId: "challenger-1",
  opponentId: "opponent-1",
  title: "Défi FIFA",
  deposits: [{ id: "dep-1", playerId: "challenger-1", status: "PENDING" }],
};

beforeEach(() => {
  vi.clearAllMocks();
  dbMock.$transaction.mockImplementation(async (fn: (tx: typeof dbMock) => unknown) => fn(dbMock));
});

describe("POST /api/wagers/[id]/cancel", () => {
  it("refuse un appelant non authentifié (401)", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const res = await POST(makeRequest("http://localhost/api/wagers/w1/cancel", {}), withParams("w1"));
    expect(res.status).toBe(401);
  });

  it("404 si le défi n'existe pas", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1", player: { id: "challenger-1" } });
    dbMock.wager.findUnique.mockResolvedValue(null);
    const res = await POST(makeRequest("http://localhost/api/wagers/w1/cancel", {}), withParams("w1"));
    expect(res.status).toBe(404);
  });

  it("refuse un tiers non participant", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1", player: { id: "tiers-1" } });
    dbMock.wager.findUnique.mockResolvedValue(openWagerNoDeposits);
    const res = await POST(makeRequest("http://localhost/api/wagers/w1/cancel", {}), withParams("w1"));
    expect(res.status).toBe(403);
  });

  it("refuse d'annuler un défi déjà réglé (transition invalide, 409)", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1", player: { id: "challenger-1" } });
    dbMock.wager.findUnique.mockResolvedValue({ ...openWagerNoDeposits, status: "SETTLED" });
    const res = await POST(makeRequest("http://localhost/api/wagers/w1/cancel", {}), withParams("w1"));
    expect(res.status).toBe(409);
    expect(dbMock.wager.update).not.toHaveBeenCalled();
  });

  it("annule un défi sans dépôt : pas de remboursement déclenché", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1", player: { id: "challenger-1" } });
    dbMock.wager.findUnique.mockResolvedValue(openWagerNoDeposits);

    const res = await POST(makeRequest("http://localhost/api/wagers/w1/cancel", {}), withParams("w1"));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.status).toBe("CANCELLED");
    expect(dbMock.wagerDeposit.updateMany).not.toHaveBeenCalled();
    expect(dbMock.wager.update).toHaveBeenCalledWith({ where: { id: "w1" }, data: { status: "CANCELLED" } });
  });

  it("annule un défi avec dépôts : rembourse les dépôts et notifie l'adversaire", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1", player: { id: "challenger-1" } });
    dbMock.wager.findUnique.mockResolvedValue(awaitingDepositsWager);
    dbMock.player.findUnique.mockResolvedValue({ userId: "user-opponent" });

    const res = await POST(makeRequest("http://localhost/api/wagers/w1/cancel", {}), withParams("w1"));

    expect(res.status).toBe(200);
    expect(dbMock.wagerDeposit.updateMany).toHaveBeenCalledWith({
      where: { wagerId: "w1" },
      data: { status: "REFUNDED" },
    });
    expect(dbMock.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ userId: "user-opponent" }) }),
    );
  });
});
