import { cookies } from "next/headers";
import { RecordReplayClient } from "./record-replay-client";
import { resolveLocale } from "@/lib/i18n";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string }>;
};

export default async function RecordReplayPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { lang } = await searchParams;
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("blackbox-court-locale")?.value;
  const locale = resolveLocale(lang, cookieLocale);

  return <RecordReplayClient id={id} locale={locale} />;
}
