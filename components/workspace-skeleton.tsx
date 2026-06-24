type WorkspaceSkeletonProps = {
  variant?: "court" | "dashboard";
};

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`skeleton-block ${className}`.trim()} />;
}

export function WorkspaceSkeleton({ variant = "court" }: WorkspaceSkeletonProps) {
  if (variant === "dashboard") {
    return (
      <div aria-busy="true" aria-live="polite" className="panel-skeleton">
        <div className="skeleton-impact">
          <SkeletonBlock className="skeleton-line title" />
          <SkeletonBlock className="skeleton-line short" />
          <div className="skeleton-impact-metrics">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonBlock className="skeleton-impact-metric" key={index} />
            ))}
          </div>
        </div>
        <div className="skeleton-stats-grid">
          <div className="skeleton-surface">
            <SkeletonBlock className="skeleton-line title" />
            <SkeletonBlock className="skeleton-line" />
            <SkeletonBlock className="skeleton-line" />
            <SkeletonBlock className="skeleton-line wide" />
          </div>
          <div className="skeleton-surface">
            <SkeletonBlock className="skeleton-line title" />
            <SkeletonBlock className="skeleton-line" />
            <SkeletonBlock className="skeleton-line wide" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div aria-busy="true" aria-live="polite" className="panel-skeleton">
      <div className="skeleton-verdict">
        <div className="skeleton-verdict-body">
          <div className="skeleton-verdict-top">
            <SkeletonBlock className="skeleton-pill" />
            <SkeletonBlock className="skeleton-score" />
          </div>
          <div className="skeleton-verdict-copy">
            <SkeletonBlock className="skeleton-line meta" />
            <SkeletonBlock className="skeleton-line wide" />
          </div>
        </div>
        <div className="skeleton-actions">
          <SkeletonBlock className="skeleton-btn" />
          <SkeletonBlock className="skeleton-btn" />
          <SkeletonBlock className="skeleton-btn" />
        </div>
      </div>

      <div className="skeleton-market-row">
        <div className="skeleton-market-context">
          <div className="skeleton-surface-head">
            <SkeletonBlock className="skeleton-line title" />
            <SkeletonBlock className="skeleton-pill sm" />
          </div>
          <div className="skeleton-signal-grid">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonBlock className="skeleton-signal" key={index} />
            ))}
          </div>
          <div className="skeleton-metrics">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonBlock className="skeleton-metric" key={index} />
            ))}
          </div>
        </div>
        <SkeletonBlock className="skeleton-chart" />
      </div>

      <SkeletonBlock className="skeleton-details-toggle" />
    </div>
  );
}

export function HistorySkeleton() {
  return (
    <div aria-busy="true" aria-hidden="true" className="history-skeleton">
      {Array.from({ length: 3 }).map((_, index) => (
        <div className="skeleton-history-card" key={index}>
          <SkeletonBlock className="skeleton-pill sm" />
          <SkeletonBlock className="skeleton-line title" />
          <SkeletonBlock className="skeleton-line short" />
        </div>
      ))}
    </div>
  );
}
