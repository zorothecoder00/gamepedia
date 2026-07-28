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
};

vi.mock("@/lib/prisma", () => ({ db: dbMock }));
vi.mock("@/lib/auth", () => ({ getAuthUser: vi.fn() }));
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: vi.fn(() => true) }));

const { POST } = await import("./route");
const { getAuthUser } = await import("@/lib/auth");
const { checkRateLimit } = await import("@/lib/rate-limit");

const awaitingDepositsWager = {
  id: "w1",
  status: "AWAITING_DEPOSITS",
  challengerId: "challenger-1",
  opponentId: "opponent-1",
  stakeAmount: 500,
};

const validBody = { methodType: "MOBILE_MONEY" };

beforeEach(() => {
  vi.clearAllMocks();
  (checkRateLimit as ReturnType<typeof vi.fn>).mockReturnValue(true);
});

describe("POST /api/wagers/[id]/deposit", () => {
  it("refuse un appelant non authentifié (401)", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const res = await POST(makeRequest("http://localhost/api/wagers/w1/deposit", validBody), withParams("w1"));
    expect(res.status).toBe(401);
  });

  it("applique le rate limit par joueur (429)", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1", player: { id: "challenger-1" } });
    (checkRateLimit as ReturnType<typeof vi.fn>).mockReturnValue(false);
    const res = await POST(makeRequest("http://localhost/api/wagers/w1/deposit", validBody), withParams("w1"));
    expect(res.status).toBe(429);
  });

  it("404 si le défi n'existe pas", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1", player: { id: "challenger-1" } });
    dbMock.wager.findUnique.mockResolvedValue(null);
    const res = await POST(makeRequest("http://localhost/api/wagers/w1/deposit", validBody), withParams("w1"));
    expect(res.status).toBe(404);
  });

  it("refuse un tiers non participant", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1", player: { id: "tiers-1" } });
    dbMock.wager.findUnique.mockResolvedValue(awaitingDepositsWager);
    const res = await POST(makeRequest("http://localhost/api/wagers/w1/deposit", validBody), withParams("w1"));
    expect(res.status).toBe(403);
  });

  it("refuse un dépôt hors de la fenêtre AWAITING_DEPOSITS", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1", player: { id: "challenger-1" } });
    dbMock.wager.findUnique.mockResolvedValue({ ...awaitingDepositsWager, status: "ONGOING" });
    const res = await POST(makeRequest("http://localhost/api/wagers/w1/deposit", validBody), withParams("w1"));
    expect(res.status).toBe(403);
    expect(dbMock.wagerDeposit.upsert).not.toHaveBeenCalled();
  });

  it("rejette un corps invalide (methodType manquant) avec un 400 zod", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1", player: { id: "challenger-1" } });
    dbMock.wager.findUnique.mockResolvedValue(awaitingDepositsWager);
    const res = await POST(makeRequest("http://localhost/api/wagers/w1/deposit", {}), withParams("w1"));
    expect(res.status).toBe(400);
  });

  it("enregistre le dépôt pour le montant exact de la mise convenue", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1", player: { id: "challenger-1" } });
    dbMock.wager.findUnique.mockResolvedValue(awaitingDepositsWager);
    dbMock.wagerDeposit.upsert.mockResolvedValue({ id: "d1", amount: 500, status: "PENDING" });

    const res = await POST(makeRequest("http://localhost/api/wagers/w1/deposit", validBody), withParams("w1"));

    expect(res.status).toBe(200);
    expect(dbMock.wagerDeposit.upsert).toHaveBeenCalledWith({
      where: { wagerId_playerId: { wagerId: "w1", playerId: "challenger-1" } },
      create: expect.objectContaining({ amount: 500, methodType: "MOBILE_MONEY", status: "PENDING" }),
      update: expect.objectContaining({ amount: 500, methodType: "MOBILE_MONEY", status: "PENDING" }),
    });
  });
});
