import { NextRequest } from "next/server";
import { notFound, ok, handleApiError } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import { getWagerWithRelations, isParticipant } from "@/lib/wagers";

type Params = { params: Promise<{ id: string }> };

// GET /api/wagers/[id] — détail d'un défi
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const wager = await getWagerWithRelations(id);
    if (!wager) return notFound("Défi introuvable");

    // On expose les preuves de dépôt/versement uniquement aux participants
    const user = await getAuthUser(request);
    const viewerId = user?.player?.id;
    const participant = viewerId ? isParticipant(wager, viewerId) : false;

    if (!participant) {
      return ok({
        ...wager,
        deposits: wager.deposits.map((d) => ({
          ...d,
          proofUrl: undefined,
          reference: undefined,
        })),
      });
    }

    return ok(wager);
  } catch (e) {
    return handleApiError(e);
  }
}
