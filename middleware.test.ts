import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeRequest } from "@/lib/test/request-helpers";

vi.mock("@/lib/auth-edge", () => ({
  AUTH_COOKIE: "gp_session",
  verifyAuthToken: vi.fn(),
}));

const { middleware } = await import("./middleware");
const { verifyAuthToken } = await import("@/lib/auth-edge");

const fetchMock = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", fetchMock);
});

function reqWithCookie(url: string, cookie?: string) {
  return makeRequest(url, undefined, cookie ? { headers: { cookie } } : {});
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

describe("middleware — /admin/* et /api/admin/*", () => {
  it("redirige vers /auth/login pour une page admin sans cookie", async () => {
    const res = await middleware(reqWithCookie("http://localhost/admin/players"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/auth/login");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("401 JSON pour une route API admin sans cookie", async () => {
    const res = await middleware(reqWithCookie("http://localhost/api/admin/users"));
    const json = await res.json();
    expect(res.status).toBe(401);
    expect(json.error).toBe("Non authentifié");
  });

  it("401 si le JWT est invalide/expiré", async () => {
    (verifyAuthToken as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const res = await middleware(reqWithCookie("http://localhost/api/admin/users", "gp_session=perime"));
    expect(res.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("403 si le rôle du JWT n'est pas staff (aucun appel réseau nécessaire)", async () => {
    (verifyAuthToken as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: "u1", role: "PLAYER" });
    const res = await middleware(reqWithCookie("http://localhost/api/admin/users", "gp_session=tok"));
    expect(res.status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("revérifie en direct un JWT au rôle staff, et transmet le cookie à /api/auth/session", async () => {
    (verifyAuthToken as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: "u1", role: "ADMIN" });
    fetchMock.mockResolvedValue(jsonResponse({ data: { role: "ADMIN" } }));

    await middleware(reqWithCookie("http://localhost/api/admin/users", "gp_session=tok"));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/api/auth/session");
    expect(init.headers.cookie).toBe("gp_session=tok");
  });

  it("laisse passer un JWT staff confirmé actif par la revérification live", async () => {
    (verifyAuthToken as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: "u1", role: "ADMIN" });
    fetchMock.mockResolvedValue(jsonResponse({ data: { role: "ADMIN" } }));

    const res = await middleware(reqWithCookie("http://localhost/admin/players", "gp_session=tok"));

    expect(res.headers.get("location")).toBeNull();
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });

  it("refuse un compte suspendu/supprimé depuis l'émission du JWT (session check 401)", async () => {
    (verifyAuthToken as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: "u1", role: "ADMIN" });
    fetchMock.mockResolvedValue(jsonResponse({ error: "Non authentifié" }, 401));

    const res = await middleware(reqWithCookie("http://localhost/api/admin/users", "gp_session=tok"));
    expect(res.status).toBe(403);
  });

  it("refuse un rôle rétrogradé entre l'émission du JWT et maintenant (redirige la page)", async () => {
    (verifyAuthToken as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: "u1", role: "ADMIN" });
    fetchMock.mockResolvedValue(jsonResponse({ data: { role: "PLAYER" } }));

    const res = await middleware(reqWithCookie("http://localhost/admin/players", "gp_session=tok"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/auth/login");
  });

  it("refuse par défaut si l'appel réseau interne échoue (fail-closed)", async () => {
    (verifyAuthToken as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: "u1", role: "ADMIN" });
    fetchMock.mockRejectedValue(new Error("réseau interne indisponible"));

    const res = await middleware(reqWithCookie("http://localhost/api/admin/users", "gp_session=tok"));
    expect(res.status).toBe(403);
  });
});
