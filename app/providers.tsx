"use client";

import { Suspense } from "react";
import { AppSettingsProvider } from "@/components/app-settings-provider";
import type { Locale } from "@/lib/types";

function ProvidersInner({
  children,
  initialLocale
}: {
  children: React.ReactNode;
  initialLocale: Locale;
}) {
  return <AppSettingsProvider initialLocale={initialLocale}>{children}</AppSettingsProvider>;
}

export default function Providers({
  children,
  initialLocale
}: {
  children: React.ReactNode;
  initialLocale: Locale;
}) {
  return (
    <Suspense fallback={null}>
      <ProvidersInner initialLocale={initialLocale}>{children}</ProvidersInner>
    </Suspense>
  );
}
