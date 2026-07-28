import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeRequest } from "@/lib/test/request-helpers";

function model() {
  return {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
  };
}

const dbMock = {
  user: model(),
  player: model(),
  $transaction: vi.fn(),
};
dbMock.$transaction.mockImplementation(async (fn: (tx: typeof dbMock) => unknown) => fn(dbMock));

vi.mock("@/lib/prisma", () => ({ db: dbMock }));
vi.mock("@/lib/auth", () => ({
  getAuthUser: vi.fn(),
  hashPassword: vi.fn(async () => "unusable-hash"),
  verifyPassword: vi.fn(),
}));
vi.mock("@/lib/wagers", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/wagers")>();
  return { ...actual, hasActiveWagers: vi.fn() };
});

const { GET, PATCH, DELETE } = await import("./route");
const { getAuthUser, verifyPassword } = await import("@/lib/auth");
const { hasActiveWagers } = await import("@/lib/wagers");

const userWithPlayer = {
  id: "user-1",
  email: "joueur@x.com",
  username: "Joueur",
  passwordHash: "stored-hash",
  player: { id: "player-1" },
};

beforeEach(() => {
  vi.clearAllMocks();
  dbMock.$transaction.mockImplementation(async (fn: (tx: typeof dbMock) => unknown) => fn(dbMock));
});

describe("GET /api/auth/me", () => {
  it("refuse un appelant non authentifié, y compris un compte suspendu (401)", async () => {
    // getAuthUser (mocké ici, réellement testé dans lib/auth.test.ts) renvoie null
    // pour un JWT valide mais rattaché à un compte isActive=false : la révocation
    // de session passe par ce chokepoint unique.
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const res = await GET(makeRequest("http://localhost/api/auth/me"));
    expect(res.status).toBe(401);
    expect(dbMock.user.findUnique).not.toHaveBeenCalled();
  });

  it("renvoie le profil de l'utilisateur authentifié", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue(userWithPlayer);
    dbMock.user.findUnique.mockResolvedValue({
      id: "user-1", email: "joueur@x.com", username: "Joueur", role: "PLAYER", createdAt: new Date(), player: null,
    });

    const res = await GET(makeRequest("http://localhost/api/auth/me"));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.id).toBe("user-1");
    expect(dbMock.user.findUnique).toHaveBeenCalledWith({
      where: { id: "user-1" },
      select: { id: true, email: true, username: true, role: true, createdAt: true, player: true },
    });
  });
});

describe("PATCH /api/auth/me", () => {
  it("refuse un appelant non authentifié, y compris un compte suspendu (401)", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const res = await PATCH(makeRequest("http://localhost/api/auth/me", { username: "Nouveau" }));
    expect(res.status).toBe(401);
    expect(dbMock.user.update).not.toHaveBeenCalled();
  });

  it("met à jour le profil de l'utilisateur authentifié", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue(userWithPlayer);
    dbMock.user.update.mockResolvedValue({ id: "user-1", email: "joueur@x.com", username: "Nouveau", role: "PLAYER" });

    const res = await PATCH(makeRequest("http://localhost/api/auth/me", { username: "Nouveau" }));

    expect(res.status).toBe(200);
    expect(dbMock.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { username: "Nouveau" },
      select: { id: true, email: true, username: true, role: true },
    });
  });
});

describe("DELETE /api/auth/me", () => {
  it("refuse un appelant non authentifié (401)", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const res = await DELETE(makeRequest("http://localhost/api/auth/me", { password: "x" }));
    expect(res.status).toBe(401);
  });

  it("rejette un corps sans mot de passe (400 zod)", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue(userWithPlayer);
    const res = await DELETE(makeRequest("http://localhost/api/auth/me", {}));
    expect(res.status).toBe(400);
  });

  it("refuse un mot de passe incorrect (401)", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue(userWithPlayer);
    (verifyPassword as ReturnType<typeof vi.fn>).mockResolvedValue(false);
    const res = await DELETE(makeRequest("http://localhost/api/auth/me", { password: "mauvais" }));
    expect(res.status).toBe(401);
    expect(dbMock.user.update).not.toHaveBeenCalled();
  });

  it("refuse la suppression si un défi est encore en cours (403)", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue(userWithPlayer);
    (verifyPassword as ReturnType<typeof vi.fn>).mockResolvedValue(true);
    (hasActiveWagers as ReturnType<typeof vi.fn>).mockResolvedValue(true);
    const res = await DELETE(makeRequest("http://localhost/api/auth/me", { password: "bon" }));
    expect(res.status).toBe(403);
    expect(dbMock.user.update).not.toHaveBeenCalled();
  });

  it("anonymise le compte, désactive le joueur et efface le cookie de session", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue(userWithPlayer);
    (verifyPassword as ReturnType<typeof vi.fn>).mockResolvedValue(true);
    (hasActiveWagers as ReturnType<typeof vi.fn>).mockResolvedValue(false);

    const res = await DELETE(makeRequest("http://localhost/api/auth/me", { password: "bon" }));

    expect(res.status).toBe(200);
    expect(dbMock.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: expect.objectContaining({
        isActive: false,
        email: "deleted-user-1@deleted.invalid",
        username: "deleted_user-1",
        passwordHash: "unusable-hash",
      }),
    });
    expect(dbMock.player.update).toHaveBeenCalledWith({
      where: { id: "player-1" },
      data: { isActive: false },
    });
    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain("gp_session=");
    expect(setCookie).toMatch(/max-age=0/i);
  });

  it("fonctionne pour un compte sans profil joueur lié (pas d'appel player.update)", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue({ ...userWithPlayer, player: null });
    (verifyPassword as ReturnType<typeof vi.fn>).mockResolvedValue(true);

    const res = await DELETE(makeRequest("http://localhost/api/auth/me", { password: "bon" }));

    expect(res.status).toBe(200);
    expect(hasActiveWagers).not.toHaveBeenCalled();
    expect(dbMock.player.update).not.toHaveBeenCalled();
  });
});
