"use client";

import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppSettings } from "@/components/app-settings-provider";
import { CopyCodeBlock } from "@/components/copy-code-block";
import { ui } from "@/lib/i18n";

type IntegrationStatus = {
  hasApiKey: boolean;
  apiKeyUsedInEvaluate: boolean;
  readOnly: boolean;
  paperExecutionOnly: boolean;
  liveTradingEnabled: boolean;
  browserExposesSecrets: boolean;
  marketReachable: boolean;
  marketSource?: string;
  accountProbe?: {
    source: string;
    availableUsdt?: number;
    message?: string;
  } | null;
  command: string;
  modules: string[];
  paperLogUrl?: string | null;
};

const HUB_UPGRADE_COMMAND = "npx bitget-hub upgrade-all --target cursor";

export function DevelopersIntegration() {
  const { locale } = useAppSettings();
  const t = ui[locale];
  const [integration, setIntegration] = useState<IntegrationStatus | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadIntegration() {
    setLoading(true);
    try {
      const response = await fetch("/api/integrations/bitget", { cache: "no-store" });
      if (!response.ok) return;
      setIntegration((await response.json()) as IntegrationStatus);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadIntegration();
  }, []);

  const mcpCommand =
    integration?.command ??
    "npx -y bitget-mcp-server --read-only --modules spot,futures,account";

  const apiKeyLabel = integration?.apiKeyUsedInEvaluate
    ? t.apiKeyWired
    : integration?.hasApiKey
      ? t.apiKeyEnvOnly
      : t.apiKeyMissing;

  return (
    <>
      <section className="surface">
        <div className="history-head">
          <h2 className="section-title">{t.integrationHealth}</h2>
          <button
            aria-label={t.integrationHealth}
            className="icon-button"
            disabled={loading}
            onClick={loadIntegration}
            type="button"
          >
            <RefreshCw className={loading ? "spin" : undefined} size={14} />
          </button>
        </div>
        <div className="integration-grid">
          <div className="integration-item">
            <span>{t.apiKey}</span>
            <strong className={integration?.apiKeyUsedInEvaluate ? "ok" : integration?.hasApiKey ? "warn" : "bad"}>
              {apiKeyLabel}
            </strong>
          </div>
          <div className="integration-item">
            <span>{t.readOnly}</span>
            <strong className={integration?.readOnly ? "ok" : "bad"}>
              {integration?.readOnly ? t.passed : t.failed}
            </strong>
          </div>
          <div className="integration-item">
            <span>{t.paperOnly}</span>
            <strong className={integration?.paperExecutionOnly ? "ok" : "bad"}>
              {integration?.paperExecutionOnly ? t.passed : t.failed}
            </strong>
          </div>
          <div className="integration-item">
            <span>{t.liveTrading}</span>
            <strong className={integration?.liveTradingEnabled ? "bad" : "ok"}>
              {integration?.liveTradingEnabled ? t.failed : t.passed}
            </strong>
          </div>
          <div className="integration-item">
            <span>{t.browserSecrets}</span>
            <strong className={integration?.browserExposesSecrets ? "bad" : "ok"}>
              {integration?.browserExposesSecrets ? t.failed : t.passed}
            </strong>
          </div>
          <div className="integration-item">
            <span>{t.source}</span>
            <strong className={integration?.marketReachable ? "ok" : "bad"}>
              {integration?.marketReachable ? "Bitget public API" : t.fallback}
            </strong>
          </div>
          {integration?.accountProbe?.availableUsdt !== undefined ? (
            <div className="integration-item">
              <span>{t.accountAvailable}</span>
              <strong className="ok">{integration.accountProbe.availableUsdt.toLocaleString()} USDT</strong>
            </div>
          ) : null}
        </div>
        {integration?.accountProbe?.message ? (
          <p className="muted integration-note">{integration.accountProbe.message}</p>
        ) : null}
      </section>

      <section className="surface">
        <h2 className="section-title">{t.devOptionalIntegrations}</h2>
        <p className="muted">{t.devAgentHubCopy}</p>
        <p className="muted">{t.mcpCommand}</p>
        <CopyCodeBlock code={mcpCommand} />
        <p className="muted">{t.devHubUpgradeCopy}</p>
        <CopyCodeBlock code={HUB_UPGRADE_COMMAND} />
      </section>

      <section className="surface">
        <h2 className="section-title">{t.getAgentTitle}</h2>
        <p className="muted">{t.getAgentCopy}</p>
        {integration?.paperLogUrl ? (
          <a className="btn-secondary external-evidence-link" href={integration.paperLogUrl} rel="noreferrer" target="_blank">
            {t.getAgentLink}
          </a>
        ) : (
          <p className="muted integration-note">{t.paperLogMissing}</p>
        )}
      </section>
    </>
  );
}
