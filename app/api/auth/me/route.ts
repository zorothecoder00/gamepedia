import crypto from "node:crypto";
import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, unauthorized, forbidden, serverError, handleApiError } from "@/lib/api";
import { getAuthUser, hashPassword, verifyPassword } from "@/lib/auth";
import { AUTH_COOKIE } from "@/lib/auth-edge";
import { parseBody, mePatchSchema, accountDeleteSchema } from "@/lib/validation";
import { hasActiveWagers } from "@/lib/wagers";

export async function GET(request: NextRequest) {
  try {
    const authed = await getAuthUser(request);
    if (!authed) return unauthorized();

    const user = await db.user.findUnique({
      where: { id: authed.id },
      select: { id: true, email: true, username: true, role: true, createdAt: true, player: true },
    });

    if (!user) return unauthorized();
    return ok(user);
  } catch {
    return serverError();
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authed = await getAuthUser(request);
    if (!authed) return unauthorized();

    const { username, email } = await parseBody(request, mePatchSchema);

    const user = await db.user.update({
      where: { id: authed.id },
      data: { ...(username && { username }), ...(email && { email }) },
      select: { id: true, email: true, username: true, role: true },
    });

    return ok(user);
  } catch (e) {
    return handleApiError(e);
  }
}

// DELETE /api/auth/me — clôture du compte (soft delete + anonymisation)
//
// Le compte n'est jamais supprimé en base : les défis (Wager) et l'historique
// de tournoi référencent le Player, pas le User, et doivent rester intègres
// pour les autres joueurs et pour l'administration en cas de litige a
// posteriori. On désactive et on anonymise à la place.
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorized();

    const { password } = await parseBody(request, accountDeleteSchema);
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) return unauthorized("Mot de passe incorrect.");

    if (user.player && (await hasActiveWagers(user.player.id))) {
      return forbidden(
        "Vous avez des défis en cours (mise en séquestre ou litige non résolu). " +
          "Terminez-les ou annulez-les avant de supprimer votre compte.",
      );
    }

    const unusablePassword = await hashPassword(crypto.randomBytes(32).toString("hex"));

    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          isActive: false,
          email: `deleted-${user.id}@deleted.invalid`,
          username: `deleted_${user.id.slice(0, 10)}`,
          passwordHash: unusablePassword,
          avatar: null,
        },
      });
      if (user.player) {
        await tx.player.update({
          where: { id: user.player.id },
          data: { isActive: false },
        });
      }
    });

    const response = ok({ message: "Compte supprimé." });
    response.cookies.set(AUTH_COOKIE, "", { path: "/", maxAge: 0 });
    return response;
  } catch (e) {
    return handleApiError(e);
  }
}
