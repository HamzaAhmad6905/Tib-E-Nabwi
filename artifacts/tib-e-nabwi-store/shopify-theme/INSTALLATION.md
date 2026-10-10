# Shopify theme sections for Tib-E-Nabwi

The Replit preview is a React/Vite storefront, not an installable Shopify theme. These native Shopify Online Store 2.0 sections are provided separately so they can be copied into a Dawn-compatible Shopify theme without changing the React app.

## Files

```text
shopify-theme/
├── INSTALLATION.md
├── assets/
│   ├── tib-nabwi-homepage-trust-stats.css
│   └── tib-nabwi-product-reviews.css
└── sections/
    ├── tib-nabwi-homepage-trust-stats.liquid
    └── tib-nabwi-product-reviews.liquid
```

## Install in Shopify

1. Duplicate your active theme as a backup.
2. In Shopify Admin, go to **Online Store → Themes → Edit code**.
3. Copy the two `.liquid` files into the theme's `sections/` directory and the two `.css` files into its `assets/` directory. Keep the filenames unchanged.
4. Open **Customize** on the duplicate theme.
5. On a product template, add **Tib-E-Nabwi reviews** below the product-details section. Add individual **Genuine customer review** blocks only for real feedback you have permission to publish. Choose the correct language for each review. The section calculates its average and count from those blocks.
6. Open that product template in **Customize**. The **Show fictional sample reviews in the theme editor only** setting is enabled by default for a new section; the 12 cards appear in the editor only while there are no genuine review blocks. Turn the setting off to confirm the empty state. The cards, dates, and ratings never contribute to live review totals and are never rendered to storefront visitors.
7. On the homepage, add **Tib-E-Nabwi trust statistics**. The four example figures are shown only in the theme editor when **Show sample statistics in the theme editor only** is on. Public storefronts never receive those sample figures.
8. For live statistics, add a statistic block, enter the value and a customer-facing label, name its source or calculation method, then enable **This live value has a documented, verifiable source**. A live block is hidden unless all four fields are present. Base order totals on Shopify order records, document how returning customers are counted, use only genuine review data for average ratings, and use documented survey results for satisfaction. These editable fields do not fetch or calculate Shopify reports automatically.
9. Preview the duplicate theme at desktop and mobile widths before publishing it.

## React preview mode

The React storefront displays its sample reviews, illustrative statistics, and brand-commitment certificate during Vite development only. The shared switch is in `src/App.tsx`:

```ts
const showDevelopmentPreview = import.meta.env.DEV;
```

Run the development server normally to see the preview. A production build always turns preview mode off. Production reviews and metrics must be supplied separately from genuine review submissions and documented business records; with no such data, the components render their empty states.

The React development preview also includes a formal, in-house **Certificate of Brand Commitment**. It communicates the shop's own commitment to clear product information, not product testing, certification, or an independent endorsement.

## Review-app integration

These sections use Shopify theme-editor blocks; they are not connected to a review provider. When you adopt a legitimate review app, use its Shopify theme app block or documented theme integration for synchronized, authentic reviews. Do not copy app-managed reviews into both systems or display unverified purchase badges. The section intentionally does not create a verified-purchase indicator.

## Storefront preview ordering

The Replit storefront remains a React prototype. Its product buttons add the selected item and take the shopper to a bilingual details form. Submitting opens a prefilled WhatsApp draft for the shopper to review and send to **+92 329 7976370**. This preview does not create a Shopify order, charge a payment method, or confirm a delivery price. Shopify checkout and the theme sections require installation and testing in a Shopify store; that has not been performed from this project.
