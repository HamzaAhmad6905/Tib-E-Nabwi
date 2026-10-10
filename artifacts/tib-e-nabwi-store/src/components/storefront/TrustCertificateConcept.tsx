import { Leaf } from 'lucide-react';

export function TrustCertificateConcept() {
  return (
    <section className="store-certificate-concept" aria-labelledby="store-certificate-title">
      <div className="storefront-section-inner container-wide">
        <article className="store-certificate-card" aria-label="Tib-E-Nabwi certificate of appreciation">
          <div className="store-certificate-content">
            <div className="certificate-letterhead">
              <span className="certificate-brand-mark" aria-hidden="true">
                <svg viewBox="0 0 64 64">
                  <path d="M31 51V23m0 16c-12 0-17-6-17-15 10 0 16 5 17 15Zm2-9c0-10 6-16 16-16 0 9-6 16-16 16Z" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="m23 51 8 4 9-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <span className="certificate-brand-name">
                <strong>Tib-E-Nabwi Dawakhana.store</strong>
                <span lang="ur" dir="rtl">طبِ نبوی دواخانہ اسٹور</span>
              </span>
              <span className="certificate-letterhead-note">BRAND-ISSUED</span>
            </div>

            <header className="store-certificate-header">
              <p className="store-certificate-overline">TIB-E-NABWI · PRIVATE BRAND APPRECIATION</p>
              <h2 id="store-certificate-title">
                Certificate of Appreciation
                <span lang="ur" dir="rtl">اظہارِ تشکر کا سرٹیفکیٹ</span>
              </h2>
              <span className="store-certificate-ornament" aria-hidden="true">— ✦ —</span>
            </header>

            <div className="store-certificate-body">
              <p className="store-certificate-intro">PROUDLY PRESENTED TO</p>
              <h3 className="store-certificate-recipient">Our Valued Customers</h3>
              <p className="store-certificate-recipient-ur" lang="ur" dir="rtl">ہمارے قابلِ قدر صارفین کے نام</p>
              <p className="store-certificate-description">
                With heartfelt thanks for being part of our journey. Your trust means so much to our family, and we look forward to serving you with care, honesty, and respect.
                <span lang="ur" dir="rtl">ہمارے سفر کا حصہ بننے پر دل سے شکریہ۔ آپ کا اعتماد ہمارے خاندان کے لیے بہت اہم ہے، اور ہم توجہ، ایمانداری اور احترام کے ساتھ آپ کی خدمت کرتے رہیں گے۔</span>
              </p>
            </div>

            <footer className="store-certificate-signoff">
              <div className="store-certificate-signature-block">
                <span className="store-certificate-signature">With warm regards,</span>
                <span className="store-certificate-signature-line" />
                <span className="store-certificate-issuer">THE TIB-E-NABWI FAMILY</span>
                <span lang="ur" dir="rtl">طبِ نبوی خاندان</span>
              </div>
              <div className="store-certificate-seal" aria-label="Tib-E-Nabwi appreciation seal">
                <Leaf aria-hidden="true" />
                <span>TN</span>
                <small>WITH THANKS</small>
              </div>
            </footer>
            <p className="store-certificate-note">
              A brand-issued note of appreciation · Not a government certificate
              <span lang="ur" dir="rtl">طبِ نبوی کی جانب سے اظہارِ تشکر · یہ سرکاری سرٹیفکیٹ نہیں ہے</span>
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
