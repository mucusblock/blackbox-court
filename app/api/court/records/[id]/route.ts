import { NextResponse } from "next/server";
import { getRecord } from "@/lib/blackbox-store";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const record = await getRecord(id);
  if (!record) {
    return NextResponse.json({ error: "Record not found" }, { status: 404 });
  }

  return NextResponse.json(record);
}
