import { ok, serverError } from "@/lib/api";

export async function POST() {
  try {
    // TODO: implémenter le recalcul de tous les classements à partir des PointAttribution
    return ok({ message: "Recalcul des classements déclenché." });
  } catch {
    return serverError();
  }
}
