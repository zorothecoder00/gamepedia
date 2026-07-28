import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeRequest } from "@/lib/test/request-helpers";

const dbMock = {
  user: {
    findFirst: vi.fn(),
    create: vi.fn(),
  },
};

vi.mock("@/lib/prisma", () => ({ db: dbMock }));
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: vi.fn(() => true), getClientIp: vi.fn(() => "127.0.0.1") }));
vi.mock("@/lib/auth", () => ({ hashPassword: vi.fn(async (p: string) => `hashed:${p}`) }));
vi.mock("@/lib/email-verification", () => ({ issueEmailVerificationToken: vi.fn() }));
vi.mock("@/lib/mailer", () => ({ sendVerificationEmail: vi.fn() }));

const { POST } = await import("./route");
const { checkRateLimit } = await import("@/lib/rate-limit");
const { issueEmailVerificationToken } = await import("@/lib/email-verification");
const { sendVerificationEmail } = await import("@/lib/mailer");

const validBody = { email: "nouveau@x.com", username: "NouveauJoueur", password: "motdepasse123" };

beforeEach(() => {
  vi.clearAllMocks();
  (checkRateLimit as ReturnType<typeof vi.fn>).mockReturnValue(true);
  (issueEmailVerificationToken as ReturnType<typeof vi.fn>).mockResolvedValue("raw-token-abc");
  dbMock.user.findFirst.mockResolvedValue(null);
  dbMock.user.create.mockResolvedValue({
    id: "u1",
    email: validBody.email,
    username: validBody.username,
    role: "VISITOR",
    createdAt: new Date(),
  });
});

describe("POST /api/auth/register", () => {
  it("applique le rate limit par IP (429)", async () => {
    (checkRateLimit as ReturnType<typeof vi.fn>).mockReturnValue(false);
    const res = await POST(makeRequest("http://localhost/api/auth/register", validBody));
    expect(res.status).toBe(429);
  });

  it("refuse un email ou pseudo déjà utilisé", async () => {
    dbMock.user.findFirst.mockResolvedValue({ id: "existing" });
    const res = await POST(makeRequest("http://localhost/api/auth/register", validBody));
    expect(res.status).toBe(400);
    expect(dbMock.user.create).not.toHaveBeenCalled();
  });

  it("crée le compte puis émet et envoie un token de vérification", async () => {
    const res = await POST(makeRequest("http://localhost/api/auth/register", validBody));

    expect(res.status).toBe(201);
    expect(dbMock.user.create).toHaveBeenCalled();
    expect(issueEmailVerificationToken).toHaveBeenCalledWith("u1");
    expect(sendVerificationEmail).toHaveBeenCalledWith(
      validBody.email,
      expect.stringContaining("/auth/verify-email/confirm?token=raw-token-abc"),
    );
  });

  it("l'inscription réussit même si l'envoi de l'email échoue", async () => {
    (sendVerificationEmail as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Resend indisponible"));

    const res = await POST(makeRequest("http://localhost/api/auth/register", validBody));
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.data.id).toBe("u1");
  });
});
