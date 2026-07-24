import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { WagerError } from "./wagers";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

/**
 * Convertit une erreur en réponse HTTP. Une WagerError est mappée sur
 * son statut métier (400/403/409…), une ZodError sur un 400 détaillé,
 * un JSON malformé sur un 400 générique, tout le reste sur une 500.
 */
export function handleApiError(e: unknown) {
  if (e instanceof WagerError) {
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
  if (e instanceof ZodError) {
    return NextResponse.json(
      {
        error: "Requête invalide",
        details: e.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      },
      { status: 400 },
    );
  }
  if (e instanceof SyntaxError) {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }
  return serverError();
}

export function paginated<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
) {
  return NextResponse.json({
    data,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
}

export function created<T>(data: T) {
  return NextResponse.json({ data }, { status: 201 });
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

export function badRequest(message = "Requête invalide") {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function unauthorized(message = "Non authentifié") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbidden(message = "Accès refusé") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function notFound(message = "Ressource introuvable") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function serverError(message = "Erreur interne du serveur") {
  return NextResponse.json({ error: message }, { status: 500 });
}

export function tooManyRequests(message = "Trop de tentatives, réessayez plus tard.") {
  return NextResponse.json({ error: message }, { status: 429 });
}

/** Extrait page et limit depuis les searchParams */
export function getPagination(searchParams: URLSearchParams) {
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 20)));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}
