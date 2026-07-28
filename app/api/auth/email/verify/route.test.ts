import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeRequest } from "@/lib/test/request-helpers";

vi.mock("@/lib/email-verification", () => ({ consumeEmailVerificationToken: vi.fn() }));

const { POST } = await import("./route");
const { consumeEmailVerificationToken } = await import("@/lib/email-verification");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/auth/email/verify", () => {
  it("rejette un corps sans token (400 zod)", async () => {
    const res = await POST(makeRequest("http://localhost/api/auth/email/verify", {}));
    expect(res.status).toBe(400);
    expect(consumeEmailVerificationToken).not.toHaveBeenCalled();
  });

  it("400 avec message d'invalidité si le token est inconnu", async () => {
    (consumeEmailVerificationToken as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false, reason: "invalid" });
    const res = await POST(makeRequest("http://localhost/api/auth/email/verify", { token: "xxx" }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toMatch(/invalide/);
  });

  it("400 avec message d'expiration si le token est périmé", async () => {
    (consumeEmailVerificationToken as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false, reason: "expired" });
    const res = await POST(makeRequest("http://localhost/api/auth/email/verify", { token: "xxx" }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toMatch(/expiré/);
  });

  it("200 quand le token est valide", async () => {
    (consumeEmailVerificationToken as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true });
    const res = await POST(makeRequest("http://localhost/api/auth/email/verify", { token: "xxx" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.message).toMatch(/vérifiée avec succès/);
  });
});
