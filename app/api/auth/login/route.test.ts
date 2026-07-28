import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeRequest } from "@/lib/test/request-helpers";

const dbMock = { user: { findUnique: vi.fn() } };

vi.mock("@/lib/prisma", () => ({ db: dbMock }));
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: vi.fn(() => true), getClientIp: vi.fn(() => "127.0.0.1") }));
vi.mock("@/lib/auth", () => ({ signToken: vi.fn(async () => "jwt-token"), verifyPassword: vi.fn() }));

const { POST } = await import("./route");
const { checkRateLimit } = await import("@/lib/rate-limit");
const { verifyPassword, signToken } = await import("@/lib/auth");

const activeUser = {
  id: "u1",
  email: "joueur@x.com",
  username: "Joueur",
  role: "PLAYER",
  passwordHash: "stored-hash",
  isActive: true,
};

const validBody = { email: "joueur@x.com", password: "bonmotdepasse" };

beforeEach(() => {
  vi.clearAllMocks();
  (checkRateLimit as ReturnType<typeof vi.fn>).mockReturnValue(true);
});

describe("POST /api/auth/login", () => {
  it("applique le rate limit par IP (429)", async () => {
    (checkRateLimit as ReturnType<typeof vi.fn>).mockReturnValue(false);
    const res = await POST(makeRequest("http://localhost/api/auth/login", validBody));
    expect(res.status).toBe(429);
  });

  it("refuse un email inconnu avec un message générique (401)", async () => {
    dbMock.user.findUnique.mockResolvedValue(null);
    const res = await POST(makeRequest("http://localhost/api/auth/login", validBody));
    const json = await res.json();
    expect(res.status).toBe(401);
    expect(json.error).toBe("Identifiants invalides");
  });

  it("refuse un mauvais mot de passe avec le même message générique (401)", async () => {
    dbMock.user.findUnique.mockResolvedValue(activeUser);
    (verifyPassword as ReturnType<typeof vi.fn>).mockResolvedValue(false);
    const res = await POST(makeRequest("http://localhost/api/auth/login", validBody));
    const json = await res.json();
    expect(res.status).toBe(401);
    expect(json.error).toBe("Identifiants invalides");
  });

  it("refuse un compte suspendu/désactivé même avec le bon mot de passe (403)", async () => {
    dbMock.user.findUnique.mockResolvedValue({ ...activeUser, isActive: false });
    (verifyPassword as ReturnType<typeof vi.fn>).mockResolvedValue(true);
    const res = await POST(makeRequest("http://localhost/api/auth/login", validBody));
    const json = await res.json();
    expect(res.status).toBe(403);
    expect(json.error).toMatch(/suspendu ou désactivé/);
    expect(signToken).not.toHaveBeenCalled();
  });

  it("un mauvais mot de passe sur un compte suspendu reste un 401 générique (pas de fuite d'existence)", async () => {
    dbMock.user.findUnique.mockResolvedValue({ ...activeUser, isActive: false });
    (verifyPassword as ReturnType<typeof vi.fn>).mockResolvedValue(false);
    const res = await POST(makeRequest("http://localhost/api/auth/login", validBody));
    const json = await res.json();
    expect(res.status).toBe(401);
    expect(json.error).toBe("Identifiants invalides");
  });

  it("connecte un compte actif avec les bons identifiants et pose le cookie de session", async () => {
    dbMock.user.findUnique.mockResolvedValue(activeUser);
    (verifyPassword as ReturnType<typeof vi.fn>).mockResolvedValue(true);

    const res = await POST(makeRequest("http://localhost/api/auth/login", validBody));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.user).toEqual({ id: "u1", email: "joueur@x.com", username: "Joueur", role: "PLAYER" });
    expect(signToken).toHaveBeenCalledWith({ id: "u1", role: "PLAYER" });
    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain("gp_session=jwt-token");
  });
});
