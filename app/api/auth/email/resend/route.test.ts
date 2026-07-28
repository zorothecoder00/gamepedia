import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeRequest } from "@/lib/test/request-helpers";

const dbMock = { user: { findUnique: vi.fn() } };

vi.mock("@/lib/prisma", () => ({ db: dbMock }));
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: vi.fn(() => true), getClientIp: vi.fn(() => "127.0.0.1") }));
vi.mock("@/lib/email-verification", () => ({ issueEmailVerificationToken: vi.fn() }));
vi.mock("@/lib/mailer", () => ({ sendVerificationEmail: vi.fn() }));

const { POST } = await import("./route");
const { checkRateLimit } = await import("@/lib/rate-limit");
const { issueEmailVerificationToken } = await import("@/lib/email-verification");
const { sendVerificationEmail } = await import("@/lib/mailer");

beforeEach(() => {
  vi.clearAllMocks();
  (checkRateLimit as ReturnType<typeof vi.fn>).mockReturnValue(true);
  (issueEmailVerificationToken as ReturnType<typeof vi.fn>).mockResolvedValue("raw-token-123");
});

describe("POST /api/auth/email/resend", () => {
  it("applique le rate limit par IP (429)", async () => {
    (checkRateLimit as ReturnType<typeof vi.fn>).mockReturnValue(false);
    const res = await POST(makeRequest("http://localhost/api/auth/email/resend", { email: "a@b.com" }));
    expect(res.status).toBe(429);
  });

  it("rejette un email invalide (400 zod)", async () => {
    const res = await POST(makeRequest("http://localhost/api/auth/email/resend", { email: "pas-un-email" }));
    expect(res.status).toBe(400);
  });

  it("renvoie le message générique sans rien envoyer si le compte n'existe pas", async () => {
    dbMock.user.findUnique.mockResolvedValue(null);
    const res = await POST(makeRequest("http://localhost/api/auth/email/resend", { email: "inconnu@x.com" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.message).toMatch(/Si ce compte existe/);
    expect(issueEmailVerificationToken).not.toHaveBeenCalled();
    expect(sendVerificationEmail).not.toHaveBeenCalled();
  });

  it("renvoie le même message générique sans rien envoyer si l'email est déjà vérifié", async () => {
    dbMock.user.findUnique.mockResolvedValue({ id: "u1", email: "verifie@x.com", emailVerifiedAt: new Date() });
    const res = await POST(makeRequest("http://localhost/api/auth/email/resend", { email: "verifie@x.com" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.message).toMatch(/Si ce compte existe/);
    expect(issueEmailVerificationToken).not.toHaveBeenCalled();
    expect(sendVerificationEmail).not.toHaveBeenCalled();
  });

  it("émet un nouveau token et envoie l'email pour un compte non vérifié", async () => {
    dbMock.user.findUnique.mockResolvedValue({ id: "u1", email: "nonverifie@x.com", emailVerifiedAt: null });

    const res = await POST(makeRequest("http://localhost/api/auth/email/resend", { email: "nonverifie@x.com" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.message).toMatch(/Si ce compte existe/);
    expect(issueEmailVerificationToken).toHaveBeenCalledWith("u1");
    expect(sendVerificationEmail).toHaveBeenCalledWith(
      "nonverifie@x.com",
      expect.stringContaining("/auth/verify-email/confirm?token=raw-token-123"),
    );
  });

  it("renvoie quand même le message générique (200) si l'envoi d'email échoue", async () => {
    dbMock.user.findUnique.mockResolvedValue({ id: "u1", email: "nonverifie@x.com", emailVerifiedAt: null });
    (sendVerificationEmail as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Resend indisponible"));

    const res = await POST(makeRequest("http://localhost/api/auth/email/resend", { email: "nonverifie@x.com" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.message).toMatch(/Si ce compte existe/);
  });
});
