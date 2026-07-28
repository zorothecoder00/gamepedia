import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, verifyAuthToken } from "@/lib/auth-edge";

const STAFF_ROLES = ["ADMIN", "MODERATOR"];

function deny(isApi: boolean, request: NextRequest, authenticated: boolean) {
  if (isApi) {
    return NextResponse.json(
      { error: authenticated ? "Accès refusé" : "Non authentifié" },
      { status: authenticated ? 403 : 401 },
    );
  }
  return NextResponse.redirect(new URL("/auth/login", request.url));
}

export async function middleware(request: NextRequest) {
  const isApi = request.nextUrl.pathname.startsWith("/api/");

  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const result = token ? await verifyAuthToken(token) : null;

  if (!result || !STAFF_ROLES.includes(result.role)) {
    return deny(isApi, request, !!result);
  }

  // Le JWT (valable 7j) peut être obsolète : compte suspendu/supprimé
  // depuis l'émission, ou rôle rétrogradé entre-temps. L'Edge runtime ne
  // peut pas embarquer Prisma (adapter-pg est Node-only), donc on
  // revérifie en direct auprès d'une route Node dédiée avant de laisser
  // passer — /api/auth/session repasse par le même chokepoint (getAuthUser)
  // que le reste de l'app.
  try {
    const sessionCheck = await fetch(new URL("/api/auth/session", request.url), {
      headers: { cookie: request.headers.get("cookie") ?? "" },
    });
    if (!sessionCheck.ok) return deny(isApi, request, true);

    const { data } = await sessionCheck.json();
    if (!STAFF_ROLES.includes(data?.role)) return deny(isApi, request, true);
  } catch {
    // Échec réseau interne : on refuse par défaut plutôt que de laisser passer.
    return deny(isApi, request, true);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
