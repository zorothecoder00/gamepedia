import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, verifyAuthToken } from "@/lib/auth-edge";

const STAFF_ROLES = ["ADMIN", "MODERATOR"];

export async function middleware(request: NextRequest) {
  const isApi = request.nextUrl.pathname.startsWith("/api/");

  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const result = token ? await verifyAuthToken(token) : null;

  if (!result || !STAFF_ROLES.includes(result.role)) {
    if (isApi) {
      return NextResponse.json(
        { error: result ? "Accès refusé" : "Non authentifié" },
        { status: result ? 403 : 401 },
      );
    }
    const loginUrl = new URL("/auth/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
