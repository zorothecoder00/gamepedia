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

const dbMock = { wager: model() };

vi.mock("@/lib/prisma", () => ({ db: dbMock }));
vi.mock("@/lib/auth", () => ({ getAuthUser: vi.fn() }));

const { GET } = await import("./route");
const { getAuthUser } = await import("@/lib/auth");

const wagerWithProofs = {
  id: "w1",
  challengerId: "challenger-1",
  opponentId: "opponent-1",
  deposits: [
    { id: "dep-1", playerId: "challenger-1", proofUrl: "https://proof.example/1.png", reference: "REF-1" },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/wagers/[id]", () => {
  it("404 si le défi n'existe pas", async () => {
    dbMock.wager.findUnique.mockResolvedValue(null);
    const res = await GET(makeRequest("http://localhost/api/wagers/w1"), withParams("w1"));
    expect(res.status).toBe(404);
  });

  it("masque les preuves de dépôt (proofUrl/reference) pour un visiteur non authentifié", async () => {
    dbMock.wager.findUnique.mockResolvedValue(wagerWithProofs);
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const res = await GET(makeRequest("http://localhost/api/wagers/w1"), withParams("w1"));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.deposits[0].proofUrl).toBeUndefined();
    expect(json.data.deposits[0].reference).toBeUndefined();
  });

  it("masque les preuves pour un joueur authentifié mais non participant", async () => {
    dbMock.wager.findUnique.mockResolvedValue(wagerWithProofs);
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1", player: { id: "tiers-1" } });

    const res = await GET(makeRequest("http://localhost/api/wagers/w1"), withParams("w1"));
    const json = await res.json();

    expect(json.data.deposits[0].proofUrl).toBeUndefined();
  });

  it("expose les preuves de dépôt aux participants (challenger et adversaire)", async () => {
    dbMock.wager.findUnique.mockResolvedValue(wagerWithProofs);
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1", player: { id: "opponent-1" } });

    const res = await GET(makeRequest("http://localhost/api/wagers/w1"), withParams("w1"));
    const json = await res.json();

    expect(json.data.deposits[0].proofUrl).toBe("https://proof.example/1.png");
    expect(json.data.deposits[0].reference).toBe("REF-1");
  });
});
