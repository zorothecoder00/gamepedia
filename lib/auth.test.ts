import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeRequest } from "@/lib/test/request-helpers";

const dbMock = { user: { findUnique: vi.fn() } };

vi.mock("./prisma", () => ({ db: dbMock }));
vi.mock("./auth-edge", () => ({
  AUTH_COOKIE: "gp_session",
  verifyAuthToken: vi.fn(),
  signToken: vi.fn(),
}));

const {
  getUserIdFromRequest,
  getAuthUser,
  isStaff,
  hashPassword,
  verifyPassword,
} = await import("./auth");
const { verifyAuthToken } = await import("./auth-edge");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getUserIdFromRequest", () => {
  it("retourne null en l'absence de cookie et de header", async () => {
    const result = await getUserIdFromRequest(makeRequest("http://localhost/api/x"));
    expect(result).toBeNull();
    expect(verifyAuthToken).not.toHaveBeenCalled();
  });

  it("lit le token depuis le cookie gp_session", async () => {
    (verifyAuthToken as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: "u1", role: "PLAYER" });
    const req = makeRequest("http://localhost/api/x", undefined, { headers: { cookie: "gp_session=le-token" } });
    const result = await getUserIdFromRequest(req);
    expect(result).toBe("u1");
    expect(verifyAuthToken).toHaveBeenCalledWith("le-token");
  });

  it("se rabat sur l'en-tête Authorization: Bearer si aucun cookie", async () => {
    (verifyAuthToken as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: "u2", role: "PLAYER" });
    const req = makeRequest("http://localhost/api/x", undefined, { headers: { authorization: "Bearer le-token" } });
    const result = await getUserIdFromRequest(req);
    expect(result).toBe("u2");
    expect(verifyAuthToken).toHaveBeenCalledWith("le-token");
  });

  it("privilégie le cookie sur le header si les deux sont présents", async () => {
    (verifyAuthToken as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: "du-cookie", role: "PLAYER" });
    const req = makeRequest("http://localhost/api/x", undefined, {
      headers: { cookie: "gp_session=token-cookie", authorization: "Bearer token-header" },
    });
    await getUserIdFromRequest(req);
    expect(verifyAuthToken).toHaveBeenCalledWith("token-cookie");
  });

  it("retourne null si le token est invalide ou expiré", async () => {
    (verifyAuthToken as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const req = makeRequest("http://localhost/api/x", undefined, { headers: { cookie: "gp_session=perime" } });
    expect(await getUserIdFromRequest(req)).toBeNull();
  });
});

describe("getAuthUser — révocation de session sur isActive", () => {
  const req = () => makeRequest("http://localhost/api/x", undefined, { headers: { cookie: "gp_session=tok" } });

  it("retourne null si aucun token n'est présent", async () => {
    expect(await getAuthUser(makeRequest("http://localhost/api/x"))).toBeNull();
    expect(dbMock.user.findUnique).not.toHaveBeenCalled();
  });

  it("retourne null si le compte n'existe plus en base", async () => {
    (verifyAuthToken as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: "u1", role: "PLAYER" });
    dbMock.user.findUnique.mockResolvedValue(null);
    expect(await getAuthUser(req())).toBeNull();
  });

  it("retourne null pour un compte suspendu/supprimé (isActive=false) même avec un JWT valide", async () => {
    (verifyAuthToken as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: "u1", role: "PLAYER" });
    dbMock.user.findUnique.mockResolvedValue({ id: "u1", isActive: false, player: null });
    expect(await getAuthUser(req())).toBeNull();
  });

  it("retourne l'utilisateur (avec son joueur) pour un compte actif", async () => {
    (verifyAuthToken as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: "u1", role: "PLAYER" });
    const user = { id: "u1", isActive: true, player: { id: "p1" } };
    dbMock.user.findUnique.mockResolvedValue(user);
    expect(await getAuthUser(req())).toEqual(user);
  });
});

describe("isStaff", () => {
  it("vrai pour ADMIN et MODERATOR", () => {
    expect(isStaff("ADMIN")).toBe(true);
    expect(isStaff("MODERATOR")).toBe(true);
  });

  it("faux pour PLAYER et VISITOR", () => {
    expect(isStaff("PLAYER")).toBe(false);
    expect(isStaff("VISITOR")).toBe(false);
  });
});

describe("hashPassword / verifyPassword", () => {
  it("vérifie correctement un mot de passe correspondant à son hash", async () => {
    const hash = await hashPassword("mon-mot-de-passe");
    expect(await verifyPassword("mon-mot-de-passe", hash)).toBe(true);
  });

  it("rejette un mot de passe qui ne correspond pas au hash", async () => {
    const hash = await hashPassword("mon-mot-de-passe");
    expect(await verifyPassword("un-autre-mot-de-passe", hash)).toBe(false);
  });
});
