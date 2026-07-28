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
  wagerPayout: model(),
  player: model(),
  notification: model(),
  $transaction: vi.fn(),
};
dbMock.$transaction.mockImplementation(async (fn: (tx: typeof dbMock) => unknown) => fn(dbMock));

vi.mock("@/lib/prisma", () => ({ db: dbMock }));
vi.mock("@/lib/auth", () => ({
  getAuthUser: vi.fn(),
  isStaff: (role: string) => role === "ADMIN" || role === "MODERATOR",
}));

const { POST } = await import("./route");
const { getAuthUser } = await import("@/lib/auth");

const admin = { id: "admin-1", username: "root", role: "ADMIN" };

const awaitingPayoutWager = {
  id: "w1",
  status: "AWAITING_PAYOUT",
  winnerId: "challenger-1",
  stakeAmount: 1000,
  commissionRate: 10,
  currency: "XOF",
};

beforeEach(() => {
  vi.clearAllMocks();
  dbMock.$transaction.mockImplementation(async (fn: (tx: typeof dbMock) => unknown) => fn(dbMock));
});

describe("POST /api/wagers/[id]/payout", () => {
  it("refuse un appelant non authentifié (401)", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const res = await POST(
      makeRequest("http://localhost/api/wagers/w1/payout", { methodType: "MOBILE_MONEY" }),
      withParams("w1"),
    );
    expect(res.status).toBe(401);
  });

  it("refuse un appelant non staff (403)", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1", role: "PLAYER" });
    const res = await POST(
      makeRequest("http://localhost/api/wagers/w1/payout", { methodType: "MOBILE_MONEY" }),
      withParams("w1"),
    );
    expect(res.status).toBe(403);
  });

  it("404 si le défi n'existe pas", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue(admin);
    dbMock.wager.findUnique.mockResolvedValue(null);
    const res = await POST(
      makeRequest("http://localhost/api/wagers/w1/payout", { methodType: "MOBILE_MONEY" }),
      withParams("w1"),
    );
    expect(res.status).toBe(404);
  });

  it("refuse un versement hors du statut AWAITING_PAYOUT", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue(admin);
    dbMock.wager.findUnique.mockResolvedValue({ ...awaitingPayoutWager, status: "ONGOING" });
    const res = await POST(
      makeRequest("http://localhost/api/wagers/w1/payout", { methodType: "MOBILE_MONEY" }),
      withParams("w1"),
    );
    expect(res.status).toBe(403);
    expect(dbMock.wagerPayout.create).not.toHaveBeenCalled();
  });

  it("refuse si aucun vainqueur n'est désigné", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue(admin);
    dbMock.wager.findUnique.mockResolvedValue({ ...awaitingPayoutWager, winnerId: null });
    const res = await POST(
      makeRequest("http://localhost/api/wagers/w1/payout", { methodType: "MOBILE_MONEY" }),
      withParams("w1"),
    );
    expect(res.status).toBe(403);
  });

  it("400 si methodType est manquant", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue(admin);
    dbMock.wager.findUnique.mockResolvedValue(awaitingPayoutWager);
    const res = await POST(makeRequest("http://localhost/api/wagers/w1/payout", {}), withParams("w1"));
    expect(res.status).toBe(400);
  });

  it("calcule le montant net (mise×2 - commission), règle le défi et notifie le vainqueur", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue(admin);
    dbMock.wager.findUnique.mockResolvedValue(awaitingPayoutWager);
    dbMock.wagerPayout.create.mockResolvedValue({ id: "payout-1", amount: 1800, commission: 200 });
    dbMock.player.findUnique.mockResolvedValue({ userId: "user-winner" });

    const res = await POST(
      makeRequest("http://localhost/api/wagers/w1/payout", { methodType: "MOBILE_MONEY" }),
      withParams("w1"),
    );

    expect(res.status).toBe(201);
    // pot = 1000*2 = 2000, commission 10% = 200, payout = 1800
    expect(dbMock.wagerPayout.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        wagerId: "w1",
        recipientId: "challenger-1",
        amount: 1800,
        commission: 200,
        methodType: "MOBILE_MONEY",
        paidByUserId: "admin-1",
        paidByName: "root",
      }),
    });
    expect(dbMock.wager.update).toHaveBeenCalledWith({
      where: { id: "w1" },
      data: { status: "SETTLED", settledAt: expect.any(Date) },
    });
    expect(dbMock.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ userId: "user-winner" }) }),
    );
  });
});
