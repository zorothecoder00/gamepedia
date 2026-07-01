import { NextRequest } from "next/server";
import { handleImageUpload } from "@/lib/upload";

export async function POST(request: NextRequest) {
  return handleImageUpload(request, { maxSizeMB: 5 });
}
