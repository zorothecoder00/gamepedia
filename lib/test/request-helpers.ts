import { NextRequest } from "next/server";

type NextRequestInit = ConstructorParameters<typeof NextRequest>[1];

/** Construit une NextRequest POST/GET avec un corps JSON optionnel. */
export function makeRequest(
  url: string,
  body?: unknown,
  init: NextRequestInit = {},
): NextRequest {
  return new NextRequest(url, {
    method: body !== undefined ? "POST" : "GET",
    headers: body !== undefined ? { "content-type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...init,
  });
}

/** Enveloppe un id de route dynamique dans la forme attendue par les handlers ({ params: Promise<...> }). */
export function withParams(id: string) {
  return { params: Promise.resolve({ id }) };
}
