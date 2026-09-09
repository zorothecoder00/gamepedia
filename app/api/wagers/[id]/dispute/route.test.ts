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
  wagerDispute: model(),
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
};

beforeEach(() => {
  vi.clearAllMocks();
  dbMock.$transaction.mockImplementation(async (fn: (tx: typeof dbMock) => unknown) => fn(dbMock));
  (checkRateLimit as ReturnType<typeof vi.fn>).mockReturnValue(true);
});

describe("POST /api/wagers/[id]/dispute", () => {
  it("refuse un appelant non authentifié (401)", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const res = await POST(
      makeRequest("http://localhost/api/wagers/w1/dispute", { reason: "Litige" }),
      withParams("w1"),
    );
    expect(res.status).toBe(401);
  });

  it("applique le rate limit par joueur (429)", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1", player: { id: "challenger-1" } });
    (checkRateLimit as ReturnType<typeof vi.fn>).mockReturnValue(false);
    const res = await POST(
      makeRequest("http://localhost/api/wagers/w1/dispute", { reason: "Litige" }),
      withParams("w1"),
    );
    expect(res.status).toBe(429);
  });

  it("404 si le défi n'existe pas", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1", player: { id: "challenger-1" } });
    dbMock.wager.findUnique.mockResolvedValue(null);
    const res = await POST(
      makeRequest("http://localhost/api/wagers/w1/dispute", { reason: "Litige" }),
      withParams("w1"),
    );
    expect(res.status).toBe(404);
  });

  it("refuse un tiers non participant", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1", player: { id: "tiers-1" } });
    dbMock.wager.findUnique.mockResolvedValue(ongoingWager);
    const res = await POST(
      makeRequest("http://localhost/api/wagers/w1/dispute", { reason: "Litige" }),
      withParams("w1"),
    );
    expect(res.status).toBe(403);
  });

  it("refuse un litige hors des statuts éligibles (ex: OPEN)", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1", player: { id: "challenger-1" } });
    dbMock.wager.findUnique.mockResolvedValue({ ...ongoingWager, status: "OPEN" });
    const res = await POST(
      makeRequest("http://localhost/api/wagers/w1/dispute", { reason: "Litige" }),
      withParams("w1"),
    );
    expect(res.status).toBe(409);
    expect(dbMock.wagerDispute.upsert).not.toHaveBeenCalled();
  });

  it("rejette un motif trop court (validation zod)", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1", player: { id: "challenger-1" } });
    dbMock.wager.findUnique.mockResolvedValue(ongoingWager);
    const res = await POST(
      makeRequest("http://localhost/api/wagers/w1/dispute", { reason: "x" }),
      withParams("w1"),
    );
    expect(res.status).toBe(400);
  });

  it("ouvre le litige et passe le défi en DISPUTED", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1", player: { id: "opponent-1" } });
    dbMock.wager.findUnique.mockResolvedValue(ongoingWager);
    dbMock.wagerDispute.upsert.mockResolvedValue({ id: "dispute-1", wagerId: "w1", reason: "Il a triché" });

    const res = await POST(
      makeRequest("http://localhost/api/wagers/w1/dispute", { reason: "Il a triché" }),
      withParams("w1"),
    );

    expect(res.status).toBe(201);
    expect(dbMock.wagerDispute.upsert).toHaveBeenCalledWith({
      where: { wagerId: "w1" },
      create: { wagerId: "w1", openedById: "opponent-1", reason: "Il a triché" },
      update: { reason: "Il a triché", status: "OPEN" },
    });
    expect(dbMock.wager.update).toHaveBeenCalledWith({ where: { id: "w1" }, data: { status: "DISPUTED" } });
  });
});
