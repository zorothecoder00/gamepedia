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
  wagerReport: model(),
  wagerDispute: model(),
  player: model(),
  notification: model(),
  $transaction: vi.fn(),
};
dbMock.$transaction.mockImplementation(async (fn: (tx: typeof dbMock) => unknown) => fn(dbMock));

vi.mock("@/lib/prisma", () => ({ db: dbMock }));
vi.mock("@/lib/auth", () => ({ getAuthUser: vi.fn() }));
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: vi.fn(() => true) }));

const { POST } = await import("./route");
const { getAuthUser } = await import("@/lib/auth");
const { checkRateLimit } = await import("@/lib/rate-limit");

const ongoingWager = {
  id: "w1",
  status: "ONGOING",
  challengerId: "challenger-1",
  opponentId: "opponent-1",
  reports: [],
};

beforeEach(() => {
  vi.clearAllMocks();
  dbMock.$transaction.mockImplementation(async (fn: (tx: typeof dbMock) => unknown) => fn(dbMock));
  (checkRateLimit as ReturnType<typeof vi.fn>).mockReturnValue(true);
});

describe("POST /api/wagers/[id]/report", () => {
  it("refuse un appelant non authentifié (401)", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const res = await POST(
      makeRequest("http://localhost/api/wagers/w1/report", { claimedWinnerId: "challenger-1" }),
      withParams("w1"),
    );
    expect(res.status).toBe(401);
  });

  it("404 si le défi n'existe pas", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1", player: { id: "challenger-1" } });
    dbMock.wager.findUnique.mockResolvedValue(null);
    const res = await POST(
      makeRequest("http://localhost/api/wagers/w1/report", { claimedWinnerId: "challenger-1" }),
      withParams("w1"),
    );
    expect(res.status).toBe(404);
  });

  it("refuse un tiers non participant", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1", player: { id: "tiers-1" } });
    dbMock.wager.findUnique.mockResolvedValue(ongoingWager);
    const res = await POST(
      makeRequest("http://localhost/api/wagers/w1/report", { claimedWinnerId: "challenger-1" }),
      withParams("w1"),
    );
    expect(res.status).toBe(403);
  });

  it("refuse une déclaration hors des statuts autorisés (ex: AWAITING_DEPOSITS)", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1", player: { id: "challenger-1" } });
    dbMock.wager.findUnique.mockResolvedValue({ ...ongoingWager, status: "AWAITING_DEPOSITS" });
    const res = await POST(
      makeRequest("http://localhost/api/wagers/w1/report", { claimedWinnerId: "challenger-1" }),
      withParams("w1"),
    );
    expect(res.status).toBe(409);
  });

  it("rejette un claimedWinnerId hors des deux participants", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1", player: { id: "challenger-1" } });
    dbMock.wager.findUnique.mockResolvedValue(ongoingWager);
    const res = await POST(
      makeRequest("http://localhost/api/wagers/w1/report", { claimedWinnerId: "un-tiers" }),
      withParams("w1"),
    );
    expect(res.status).toBe(400);
    expect(dbMock.wagerReport.upsert).not.toHaveBeenCalled();
  });

  it("une première déclaration seule passe le défi en RESULT_REPORTED et notifie l'adversaire", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1", player: { id: "challenger-1" } });
    dbMock.wager.findUnique.mockResolvedValue(ongoingWager);
    dbMock.wagerReport.findMany.mockResolvedValue([
      { reporterId: "challenger-1", claimedWinnerId: "challenger-1" },
    ]);
    dbMock.player.findUnique.mockResolvedValue({ userId: "user-opponent" });

    const res = await POST(
      makeRequest("http://localhost/api/wagers/w1/report", { claimedWinnerId: "challenger-1" }),
      withParams("w1"),
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.status).toBe("RESULT_REPORTED");
    expect(dbMock.wager.update).toHaveBeenCalledWith({ where: { id: "w1" }, data: { status: "RESULT_REPORTED" } });
    expect(dbMock.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ userId: "user-opponent" }) }),
    );
  });

  it("deux déclarations concordantes désignent le vainqueur et passent en AWAITING_PAYOUT", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1", player: { id: "opponent-1" } });
    dbMock.wager.findUnique.mockResolvedValue(ongoingWager);
    dbMock.wagerReport.findMany.mockResolvedValue([
      { reporterId: "challenger-1", claimedWinnerId: "challenger-1" },
      { reporterId: "opponent-1", claimedWinnerId: "challenger-1" },
    ]);
    dbMock.player.findUnique.mockResolvedValue({ userId: "user-challenger" });

    const res = await POST(
      makeRequest("http://localhost/api/wagers/w1/report", { claimedWinnerId: "challenger-1" }),
      withParams("w1"),
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.status).toBe("AWAITING_PAYOUT");
    expect(dbMock.wager.update).toHaveBeenCalledWith({
      where: { id: "w1" },
      data: { status: "AWAITING_PAYOUT", winnerId: "challenger-1" },
    });
    // Réputation mise à jour pour les deux participants + le vainqueur
    expect(dbMock.player.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ["challenger-1", "opponent-1"] } },
      data: { wagersPlayed: { increment: 1 } },
    });
    expect(dbMock.player.update).toHaveBeenCalledWith({
      where: { id: "challenger-1" },
      data: { wagersWon: { increment: 1 } },
    });
    expect(dbMock.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ userId: "user-challenger" }) }),
    );
  });

  it("deux déclarations divergentes ouvrent un litige automatique (DISPUTED)", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1", player: { id: "opponent-1" } });
    dbMock.wager.findUnique.mockResolvedValue(ongoingWager);
    dbMock.wagerReport.findMany.mockResolvedValue([
      { reporterId: "challenger-1", claimedWinnerId: "challenger-1" },
      { reporterId: "opponent-1", claimedWinnerId: "opponent-1" },
    ]);

    const res = await POST(
      makeRequest("http://localhost/api/wagers/w1/report", { claimedWinnerId: "opponent-1" }),
      withParams("w1"),
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.status).toBe("DISPUTED");
    expect(dbMock.wager.update).toHaveBeenCalledWith({ where: { id: "w1" }, data: { status: "DISPUTED" } });
    expect(dbMock.wagerDispute.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { wagerId: "w1" },
        create: expect.objectContaining({ wagerId: "w1", openedById: "opponent-1" }),
      }),
    );
    expect(dbMock.player.updateMany).not.toHaveBeenCalled();
  });
});
