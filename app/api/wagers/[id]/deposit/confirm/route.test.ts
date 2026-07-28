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
};

vi.mock("@/lib/prisma", () => ({ db: dbMock }));
vi.mock("@/lib/auth", () => ({
  getAuthUser: vi.fn(),
  isStaff: (role: string) => role === "ADMIN" || role === "MODERATOR",
}));

const { POST } = await import("./route");
const { getAuthUser } = await import("@/lib/auth");

const admin = { id: "admin-1", username: "root", role: "ADMIN" };

const wagerAwaitingDeposits = {
  id: "w1",
  status: "AWAITING_DEPOSITS",
  challengerId: "challenger-1",
  opponentId: "opponent-1",
  deposits: [
    { id: "dep-challenger", playerId: "challenger-1", status: "CONFIRMED" },
    { id: "dep-opponent", playerId: "opponent-1", status: "PENDING" },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/wagers/[id]/deposit/confirm", () => {
  it("refuse un appelant non authentifié (401)", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const res = await POST(
      makeRequest("http://localhost/api/wagers/w1/deposit/confirm", { playerId: "opponent-1" }),
      withParams("w1"),
    );
    expect(res.status).toBe(401);
  });

  it("refuse un appelant non staff (403)", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1", role: "PLAYER" });
    const res = await POST(
      makeRequest("http://localhost/api/wagers/w1/deposit/confirm", { playerId: "opponent-1" }),
      withParams("w1"),
    );
    expect(res.status).toBe(403);
  });

  it("400 si playerId est manquant", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue(admin);
    const res = await POST(makeRequest("http://localhost/api/wagers/w1/deposit/confirm", {}), withParams("w1"));
    expect(res.status).toBe(400);
  });

  it("404 si le défi n'existe pas", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue(admin);
    dbMock.wager.findUnique.mockResolvedValue(null);
    const res = await POST(
      makeRequest("http://localhost/api/wagers/w1/deposit/confirm", { playerId: "opponent-1" }),
      withParams("w1"),
    );
    expect(res.status).toBe(404);
  });

  it("refuse si le défi n'est plus en attente de dépôts", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue(admin);
    dbMock.wager.findUnique.mockResolvedValue({ ...wagerAwaitingDeposits, status: "ONGOING" });
    const res = await POST(
      makeRequest("http://localhost/api/wagers/w1/deposit/confirm", { playerId: "opponent-1" }),
      withParams("w1"),
    );
    expect(res.status).toBe(403);
  });

  it("404 si aucun dépôt n'existe pour ce joueur", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue(admin);
    dbMock.wager.findUnique.mockResolvedValue(wagerAwaitingDeposits);
    const res = await POST(
      makeRequest("http://localhost/api/wagers/w1/deposit/confirm", { playerId: "tiers-1" }),
      withParams("w1"),
    );
    expect(res.status).toBe(404);
  });

  it("confirme un seul dépôt sans faire basculer le défi en ONGOING (l'autre reste PENDING)", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue(admin);
    dbMock.wager.findUnique.mockResolvedValue(wagerAwaitingDeposits);
    dbMock.wagerDeposit.findMany.mockResolvedValue([
      { status: "CONFIRMED" },
      { status: "PENDING" },
    ]);

    const res = await POST(
      makeRequest("http://localhost/api/wagers/w1/deposit/confirm", { playerId: "opponent-1" }),
      withParams("w1"),
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.wagerStatus).toBe("AWAITING_DEPOSITS");
    expect(dbMock.wager.update).not.toHaveBeenCalled();
  });

  it("bascule le défi en ONGOING et notifie les deux joueurs quand les deux dépôts sont confirmés", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue(admin);
    dbMock.wager.findUnique.mockResolvedValue(wagerAwaitingDeposits);
    dbMock.wagerDeposit.findMany.mockResolvedValue([
      { status: "CONFIRMED" },
      { status: "CONFIRMED" },
    ]);
    dbMock.player.findUnique.mockResolvedValue({ userId: "user-x" });

    const res = await POST(
      makeRequest("http://localhost/api/wagers/w1/deposit/confirm", { playerId: "opponent-1" }),
      withParams("w1"),
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.wagerStatus).toBe("ONGOING");
    expect(dbMock.wager.update).toHaveBeenCalledWith({ where: { id: "w1" }, data: { status: "ONGOING" } });
    expect(dbMock.notification.create).toHaveBeenCalledTimes(2);
  });
});
