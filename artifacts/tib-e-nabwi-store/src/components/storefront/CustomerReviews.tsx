import { useId, type ReactNode } from 'react';
import { demoReviews } from '@/data/storefront-preview';

export type ReviewLanguage = 'en' | 'ur' | 'ur-Latn';

export type CustomerReview = {
  id: string;
  name: string;
  title?: string;
  text: string;
  rating: number;
  language: ReviewLanguage;
  date?: string;
};

type CustomerReviewsProps = {
  reviews?: readonly CustomerReview[];
  previewMode?: boolean;
  emptyAction?: ReactNode;
  id?: string;
};

function getDirection(language: ReviewLanguage) {
  return language === 'ur' ? 'rtl' : 'ltr';
}

function ReviewStars({ rating }: { rating: number }) {
  const idPrefix = useId().replaceAll(':', '');
  const accessibleRating = `${rating} out of 5 stars`;
  return (
    <span className="store-review-rating-row">
      <span className="store-review-stars" role="img" aria-label={accessibleRating}>
      {Array.from({ length: 5 }, (_, index) => {
        const fraction = Math.max(0, Math.min(1, rating - index));
        const gradientId = `${idPrefix}-star-${index}`;
        return (
          <svg className="store-review-star" viewBox="0 0 24 24" aria-hidden="true" key={index}>
            <defs>
              <linearGradient id={gradientId}>
                <stop offset={`${fraction * 100}%`} stopColor="#c7a354" />
                <stop offset={`${fraction * 100}%`} stopColor="#e4ddcf" />
              </linearGradient>
            </defs>
            <path d="m12 2.4 2.94 5.96 6.58.96-4.76 4.64 1.12 6.55L12 17.42l-5.88 3.09 1.12-6.55-4.76-4.64 6.58-.96L12 2.4Z" fill={`url(#${gradientId})`} stroke="#a8833d" strokeWidth="1.1" strokeLinejoin="round" />
          </svg>
        );
      })}
      </span>
      <span className="store-review-rating-value">{rating.toFixed(1)}<span>/5</span></span>
    </span>
  );
}

export function CustomerReviews({
  reviews = [],
  previewMode = false,
  emptyAction,
  id,
}: CustomerReviewsProps) {
  const genuineReviews = reviews.filter(
    review =>
      review.name.trim() &&
      review.text.trim() &&
      Number.isFinite(review.rating) &&
      review.rating > 0 &&
      review.rating <= 5,
  );
  const showingDemo = previewMode && genuineReviews.length === 0;
  const displayedReviews = showingDemo ? demoReviews : genuineReviews;

  return (
    <section id={id} className="store-reviews" aria-labelledby="store-reviews-title">
      <div className="storefront-section-inner container-wide">
        <header className="storefront-section-heading">
          <div>
            <span className="storefront-eyebrow">Tib-E-Nabwi Dawakhana.store</span>
            <h2 id="store-reviews-title">
              Customer Reviews
              <span lang="ur" dir="rtl">صارفین کی آراء</span>
            </h2>
          </div>
          {genuineReviews.length > 0 && !showingDemo && (
            <p className="store-review-summary">
              <strong>
                {(
                  genuineReviews.reduce((total, review) => total + review.rating, 0) /
                  genuineReviews.length
                ).toFixed(1)}
                <span aria-hidden="true"> ★</span>
              </strong>
              <span>{genuineReviews.length} customer reviews</span>
            </p>
          )}
        </header>

        {showingDemo ? (
          <p className="store-preview-label" role="note">
            Fictional sample reviews · Preview content
            <span lang="ur" dir="rtl">فرضی نمونہ جائزے · پیش نظارہ</span>
          </p>
        ) : displayedReviews.length === 0 ? (
          <div className="store-reviews-empty">
            <p>Be the first to share your experience.</p>
            <p lang="ur" dir="rtl">اپنا تجربہ بتانے والے پہلے فرد بنیں۔</p>
            {emptyAction}
          </div>
        ) : null}

        {displayedReviews.length > 0 && (
          <div className="store-reviews-grid">
            {displayedReviews.map(review => (
              <article className="store-review-card" key={review.id}>
                <ReviewStars rating={review.rating} />
                {review.title && <h3 className="store-review-title">{review.title}</h3>}
                <blockquote lang={review.language} dir={getDirection(review.language)}>
                  {review.text}
                </blockquote>
                <footer className="store-review-byline">
                  <strong>{review.name}</strong>
                  {review.date && <time dateTime={review.date}>{review.date}</time>}
                </footer>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
