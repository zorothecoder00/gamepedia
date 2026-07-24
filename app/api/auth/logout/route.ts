import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth-edge";

export async function POST() {
  const response = NextResponse.json({ data: { message: "Déconnecté avec succès" } });
  response.cookies.set(AUTH_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}
