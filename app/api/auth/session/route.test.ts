import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeRequest } from "@/lib/test/request-helpers";

vi.mock("@/lib/auth", () => ({ getAuthUser: vi.fn() }));

const { GET } = await import("./route");
const { getAuthUser } = await import("@/lib/auth");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/auth/session", () => {
  it("401 si non authentifié (token absent/invalide, ou compte isActive=false via getAuthUser)", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const res = await GET(makeRequest("http://localhost/api/auth/session"));
    expect(res.status).toBe(401);
  });

  it("200 avec le rôle courant si authentifié", async () => {
    (getAuthUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1", role: "MODERATOR" });
    const res = await GET(makeRequest("http://localhost/api/auth/session"));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.role).toBe("MODERATOR");
  });
});
