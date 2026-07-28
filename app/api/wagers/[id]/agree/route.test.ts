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
  player: model(),
  notification: model(),
};

vi.mock("@/lib/prisma", () => ({ db: dbMock }));
vi.mock("@/lib/auth", () => ({ getAuthUser: vi.fn() }));

const { POST } = await import("./route");
const { getAuthUser } = await import("@/lib/auth");

const acceptedWager = {
  id: "w1",
  status: "ACCEPTED",
  challengerId: "challenger-1",
  opponentId: "opponent-1",
  challengerAgreed: false,
  opponentAgreed: false,
  title: "Défi FIFA",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/wagers/[id]/agree", () => {
  it("refuse un appelant non authentifié (401)", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const res = await POST(makeRequest("http://localhost/api/wagers/w1/agree", {}), withParams("w1"));
    expect(res.status).toBe(401);
  });

  it("404 si le défi n'existe pas", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1", player: { id: "challenger-1" } });
    dbMock.wager.findUnique.mockResolvedValue(null);
    const res = await POST(makeRequest("http://localhost/api/wagers/w1/agree", {}), withParams("w1"));
    expect(res.status).toBe(404);
  });

  it("refuse un tiers non participant", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1", player: { id: "tiers-1" } });
    dbMock.wager.findUnique.mockResolvedValue(acceptedWager);
    const res = await POST(makeRequest("http://localhost/api/wagers/w1/agree", {}), withParams("w1"));
    expect(res.status).toBe(403);
  });

  it("refuse la confirmation avant acceptation du défi (statut OPEN)", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1", player: { id: "challenger-1" } });
    dbMock.wager.findUnique.mockResolvedValue({ ...acceptedWager, status: "OPEN" });
    const res = await POST(makeRequest("http://localhost/api/wagers/w1/agree", {}), withParams("w1"));
    expect(res.status).toBe(403);
    expect(dbMock.wager.update).not.toHaveBeenCalled();
  });

  it("le challenger seul confirmant ne fait pas basculer le statut", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1", player: { id: "challenger-1" } });
    dbMock.wager.findUnique.mockResolvedValue(acceptedWager);
    dbMock.wager.update.mockResolvedValue({ ...acceptedWager, challengerAgreed: true });

    const res = await POST(makeRequest("http://localhost/api/wagers/w1/agree", {}), withParams("w1"));

    expect(res.status).toBe(200);
    expect(dbMock.wager.update).toHaveBeenCalledWith({
      where: { id: "w1" },
      data: { challengerAgreed: true, opponentAgreed: false },
    });
    expect(dbMock.notification.create).not.toHaveBeenCalled();
  });

  it("bascule en AWAITING_DEPOSITS et notifie l'adversaire quand les deux ont confirmé", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1", player: { id: "opponent-1" } });
    dbMock.wager.findUnique.mockResolvedValue({ ...acceptedWager, challengerAgreed: true });
    dbMock.wager.update.mockResolvedValue({
      ...acceptedWager,
      challengerAgreed: true,
      opponentAgreed: true,
      status: "AWAITING_DEPOSITS",
    });
    dbMock.player.findUnique.mockResolvedValue({ userId: "user-challenger" });

    const res = await POST(makeRequest("http://localhost/api/wagers/w1/agree", {}), withParams("w1"));

    expect(res.status).toBe(200);
    expect(dbMock.wager.update).toHaveBeenCalledWith({
      where: { id: "w1" },
      data: { challengerAgreed: true, opponentAgreed: true, status: "AWAITING_DEPOSITS" },
    });
    expect(dbMock.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: "user-challenger" }),
      }),
    );
  });
});
