import { NextResponse } from "next/server";
import { buildAuditBundle } from "@/lib/audit-bundle";
import { getRecord } from "@/lib/blackbox-store";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const record = await getRecord(id);
  if (!record) {
    return NextResponse.json({ error: "Record not found" }, { status: 404 });
  }

  const bundle = buildAuditBundle(record);
  const filename = `blackbox-court-${record.id}-audit-bundle.json`;

  return new NextResponse(JSON.stringify(bundle, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`
    }
  });
}
