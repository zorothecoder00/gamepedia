import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, isStaff } from "@/lib/auth";

function deny(isApi: boolean, request: NextRequest, authenticated: boolean) {
  if (isApi) {
    return NextResponse.json(
      { error: authenticated ? "Accès refusé" : "Non authentifié" },
      { status: authenticated ? 403 : 401 },
    );
  }
  return NextResponse.redirect(new URL("/auth/login", request.url));
}

// Proxy (ex-middleware) tourne toujours sur le runtime Node.js, donc
// getAuthUser (Prisma) peut être appelé directement ici — la revérification
// live (compte suspendu/supprimé ou rôle rétrogradé depuis l'émission du
// JWT) se fait en un seul appel, sans détour par une route HTTP interne.
export async function proxy(request: NextRequest) {
  const isApi = request.nextUrl.pathname.startsWith("/api/");

  const user = await getAuthUser(request);
  if (!user || !isStaff(user.role)) {
    return deny(isApi, request, !!user);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
