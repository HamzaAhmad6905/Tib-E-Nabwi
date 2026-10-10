import { HeartHandshake, PackageCheck, Repeat2, Star } from 'lucide-react';
import { demoMetrics } from '@/data/storefront-preview';

export type TrustMetric = {
  id: string;
  value: string;
  label: string;
  labelUr: string;
  icon: 'orders' | 'customers' | 'rating' | 'satisfaction';
  source?: string;
  verified?: boolean;
};

type HomepageTrustStatsProps = {
  metrics?: readonly TrustMetric[];
  previewMode?: boolean;
};

const metricIcons = {
  orders: PackageCheck,
  customers: Repeat2,
  rating: Star,
  satisfaction: HeartHandshake,
};

export function HomepageTrustStats({
  metrics = [],
  previewMode = false,
}: HomepageTrustStatsProps) {
  const documentedMetrics = metrics.filter(
    metric =>
      metric.verified === true &&
      metric.value.trim() &&
      metric.label.trim() &&
      metric.labelUr.trim() &&
      metric.source?.trim(),
  );
  const showingDemo = previewMode && documentedMetrics.length === 0;
  const displayedMetrics = showingDemo ? demoMetrics : documentedMetrics;

  return (
    <section className="store-trust-stats" aria-labelledby="store-trust-stats-title">
      <div className="storefront-section-inner container-wide">
        <header className="storefront-section-heading">
          <div>
            <span className="storefront-eyebrow">Tib-E-Nabwi Dawakhana.store</span>
            <h2 id="store-trust-stats-title">
              Trust, built on clear information
              <span lang="ur" dir="rtl">واضح معلومات کے ساتھ اعتماد</span>
            </h2>
          </div>
        </header>

        {showingDemo ? (
          <p className="store-preview-label" role="note">
            Illustrative sample statistics · Preview figures
            <span lang="ur" dir="rtl">نمائشی اعداد و شمار · پیش نظارہ</span>
          </p>
        ) : displayedMetrics.length === 0 ? (
          <p className="store-stats-empty">
            Verified store statistics will be shared when documented data is available.
            <span lang="ur" dir="rtl">مستند کاروباری معلومات دستیاب ہونے پر اعداد یہاں دکھائے جائیں گے۔</span>
          </p>
        ) : null}

        {displayedMetrics.length > 0 && (
          <div className="store-trust-grid">
            {displayedMetrics.map(metric => {
              const Icon = metricIcons[metric.icon];
              return (
                <article className="store-trust-card" key={metric.id}>
                  <Icon aria-hidden="true" />
                  <strong dir="auto">{metric.value}</strong>
                  <span dir="auto">{metric.label}</span>
                  <span lang="ur" dir="rtl">{metric.labelUr}</span>
                  {!showingDemo && metric.source && (
                    <small>Source: {metric.source}</small>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
