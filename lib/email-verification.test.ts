import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "node:crypto";

const dbMock = {
  emailVerificationToken: {
    deleteMany: vi.fn(),
    create: vi.fn(),
    findUnique: vi.fn(),
    delete: vi.fn(),
  },
  user: {
    update: vi.fn(),
  },
};

vi.mock("./prisma", () => ({ db: dbMock }));

const { issueEmailVerificationToken, consumeEmailVerificationToken } = await import("./email-verification");

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("issueEmailVerificationToken", () => {
  it("invalide les tokens précédents de l'utilisateur avant d'en créer un nouveau", async () => {
    await issueEmailVerificationToken("user-1");
    expect(dbMock.emailVerificationToken.deleteMany).toHaveBeenCalledWith({ where: { userId: "user-1" } });
  });

  it("retourne un token brut aléatoire (256 bits, hex) et stocke uniquement son hash", async () => {
    const rawToken = await issueEmailVerificationToken("user-1");

    expect(rawToken).toMatch(/^[0-9a-f]{64}$/);
    expect(dbMock.emailVerificationToken.create).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        tokenHash: sha256(rawToken),
        expiresAt: expect.any(Date),
      },
    });
  });

  it("fixe l'expiration à environ 24h dans le futur", async () => {
    const before = Date.now();
    await issueEmailVerificationToken("user-1");
    const after = Date.now();

    const { expiresAt } = dbMock.emailVerificationToken.create.mock.calls[0][0].data as { expiresAt: Date };
    const ttl = expiresAt.getTime() - before;
    expect(ttl).toBeGreaterThanOrEqual(24 * 60 * 60 * 1000 - 5000);
    expect(expiresAt.getTime()).toBeLessThanOrEqual(after + 24 * 60 * 60 * 1000 + 5000);
  });
});

describe("consumeEmailVerificationToken", () => {
  it("retourne invalid si le token est inconnu", async () => {
    dbMock.emailVerificationToken.findUnique.mockResolvedValue(null);
    const result = await consumeEmailVerificationToken("un-token-inexistant");
    expect(result).toEqual({ ok: false, reason: "invalid" });
    expect(dbMock.emailVerificationToken.delete).not.toHaveBeenCalled();
    expect(dbMock.user.update).not.toHaveBeenCalled();
  });

  it("supprime le token et retourne expired s'il est périmé, sans vérifier l'email", async () => {
    dbMock.emailVerificationToken.findUnique.mockResolvedValue({
      id: "tok-1",
      userId: "user-1",
      expiresAt: new Date(Date.now() - 1000),
    });

    const result = await consumeEmailVerificationToken("token-expire");

    expect(result).toEqual({ ok: false, reason: "expired" });
    expect(dbMock.emailVerificationToken.delete).toHaveBeenCalledWith({ where: { id: "tok-1" } });
    expect(dbMock.user.update).not.toHaveBeenCalled();
  });

  it("consomme un token valide : supprime le token et marque l'email vérifié", async () => {
    dbMock.emailVerificationToken.findUnique.mockResolvedValue({
      id: "tok-1",
      userId: "user-1",
      expiresAt: new Date(Date.now() + 60_000),
    });

    const result = await consumeEmailVerificationToken("token-valide");

    expect(result).toEqual({ ok: true });
    expect(dbMock.emailVerificationToken.delete).toHaveBeenCalledWith({ where: { id: "tok-1" } });
    expect(dbMock.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { emailVerifiedAt: expect.any(Date) },
    });
  });

  it("cherche le token par le hash sha256 du brut, jamais le brut lui-même", async () => {
    dbMock.emailVerificationToken.findUnique.mockResolvedValue(null);
    const raw = "mon-token-brut";
    await consumeEmailVerificationToken(raw);
    expect(dbMock.emailVerificationToken.findUnique).toHaveBeenCalledWith({
      where: { tokenHash: sha256(raw) },
    });
  });
});
