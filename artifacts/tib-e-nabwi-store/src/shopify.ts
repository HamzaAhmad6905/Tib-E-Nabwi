import { client } from './shopifyClient';

// Gets the variant ID of your product from Shopify (needed to build a cart)
async function getVariantId(): Promise<string> {
  const { data, errors } = await client.request(`{
    products(first: 1) {
      edges { node { variants(first: 1) { edges { node { id availableForSale } } } } }
    }
  }`);
  if (errors) throw new Error('Could not load the product from Shopify');
  const variant = data?.products?.edges?.[0]?.node?.variants?.edges?.[0]?.node;
  if (!variant) throw new Error('No product found. Check it is Active and published to Headless.');
  if (!variant.availableForSale) throw new Error('This product is out of stock.');
  return variant.id;
}

// Creates a Shopify cart and sends the customer to Shopify's checkout page
export async function startCheckout(quantity: number): Promise<void> {
  const variantId = await getVariantId();
  const { data, errors } = await client.request(
    `mutation cartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart { checkoutUrl }
        userErrors { message }
      }
    }`,
    { variables: { input: { lines: [{ merchandiseId: variantId, quantity }] } } }
  );
  const url = data?.cartCreate?.cart?.checkoutUrl;
  if (errors || !url) {
    throw new Error(data?.cartCreate?.userErrors?.[0]?.message || 'Could not start checkout');
  }
  console.log('Checkout URL:', url);
  window.location.href = url;
}