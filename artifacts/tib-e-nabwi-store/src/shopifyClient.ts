import { createStorefrontApiClient } from '@shopify/storefront-api-client';

export const client = createStorefrontApiClient({
  storeDomain: import.meta.env.VITE_SHOPIFY_DOMAIN,
  apiVersion: '2026-10', // use a current supported version
  publicAccessToken: import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN,
});