import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { created, badRequest, serverError } from "@/lib/api";
import { hashPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, username, password } = body as {
      email: string;
      username: string;
      password: string;
    };

    if (!email || !username || !password) {
      return badRequest("email, username et password sont requis");
    }

    const existing = await db.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      return badRequest("Email ou pseudo déjà utilisé");
    }

    const user = await db.user.create({
      data: { email, username, passwordHash: await hashPassword(password) },
      select: { id: true, email: true, username: true, role: true, createdAt: true },
    });

    return created(user);
  } catch {
    return serverError();
  }
}
