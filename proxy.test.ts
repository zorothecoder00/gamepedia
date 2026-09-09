import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeRequest } from "@/lib/test/request-helpers";

vi.mock("@/lib/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth")>();
  return { ...actual, getAuthUser: vi.fn() };
});

const { proxy } = await import("./proxy");
const { getAuthUser } = await import("@/lib/auth");

beforeEach(() => {
  vi.clearAllMocks();
});

function reqWithCookie(url: string, cookie?: string) {
  return makeRequest(url, undefined, cookie ? { headers: { cookie } } : {});
}

describe("proxy — /admin/* et /api/admin/*", () => {
  it("redirige vers /auth/login pour une page admin sans session", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const res = await proxy(reqWithCookie("http://localhost/admin/players"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/auth/login");
  });

  it("401 JSON pour une route API admin sans session", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const res = await proxy(reqWithCookie("http://localhost/api/admin/users"));
    const json = await res.json();
    expect(res.status).toBe(401);
    expect(json.error).toBe("Non authentifié");
  });

  it("403 si le rôle de l'utilisateur n'est pas staff", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1", role: "PLAYER" });
    const res = await proxy(reqWithCookie("http://localhost/api/admin/users", "gp_session=tok"));
    expect(res.status).toBe(403);
  });

  it("laisse passer un utilisateur ADMIN actif", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1", role: "ADMIN" });
    const res = await proxy(reqWithCookie("http://localhost/admin/players", "gp_session=tok"));
    expect(res.headers.get("location")).toBeNull();
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });

  it("laisse passer un utilisateur MODERATOR actif", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1", role: "MODERATOR" });
    const res = await proxy(reqWithCookie("http://localhost/api/admin/users", "gp_session=tok"));
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });

  it("refuse un compte suspendu/supprimé (getAuthUser renvoie null pour !isActive)", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const res = await proxy(reqWithCookie("http://localhost/api/admin/users", "gp_session=tok"));
    expect(res.status).toBe(401);
  });

  it("refuse un rôle rétrogradé depuis l'émission du JWT (redirige la page)", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1", role: "PLAYER" });
    const res = await proxy(reqWithCookie("http://localhost/admin/players", "gp_session=tok"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/auth/login");
  });
});
