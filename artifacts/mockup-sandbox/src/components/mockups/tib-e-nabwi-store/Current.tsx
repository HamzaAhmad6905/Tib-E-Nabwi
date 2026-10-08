import { useState, type AnchorHTMLAttributes, type ReactNode } from 'react';
import { ArrowRight, ArrowUpRight, CircleHelp, Leaf, Plus, ShieldCheck, ShoppingBag, Sprout } from 'lucide-react';
import './_group.css';

type Lang = 'en' | 'ur';
type Product = { slug: string; name: string; ur: string; localName: string; localUr: string; category: string; description: string; descriptionUr: string; art: string };

const STORE_CONFIG = { whatsappNumber: '03.........', shopName: 'Tib-E-Nabwi' };
const products: Product[] = [
  { slug: 'garden-seed-blend', name: 'Garden Seed Blend', ur: 'باغ کے بیجوں کا آمیزہ', localName: 'Mixed botanical seeds', localUr: 'مخلوط نباتاتی بیج', category: 'Seeds', description: 'An illustrative sample listing for a traditional pantry staple. Product details are not yet confirmed.', descriptionUr: 'روایتی گھریلو استعمال کی ایک نمائشی مثال۔ مصنوعات کی تفصیلات ابھی تصدیق شدہ نہیں ہیں۔', art: 'art-seed' },
  { slug: 'green-leaf-infusion', name: 'Green Leaf Infusion', ur: 'سبز پتوں کی چائے', localName: 'Herbal infusion', localUr: 'جڑی بوٹیوں کا مشروب', category: 'Herbal blends', description: 'A placeholder for a loose herbal blend. Ingredients and preparation details will be added by the shop owner.', descriptionUr: 'کھلی جڑی بوٹیوں کے آمیزے کی نمائشی مثال۔ اجزاء اور استعمال کی تفصیلات دکاندار شامل کریں گے۔', art: 'art-tea' },
  { slug: 'golden-kernel-oil', name: 'Golden Kernel Oil', ur: 'سنہری بیجوں کا تیل', localName: 'Botanical oil', localUr: 'نباتاتی تیل', category: 'Oils', description: 'An illustrative bottle concept only. No real formulation, size, or ingredient list has been provided.', descriptionUr: 'صرف بوتل کی نمائشی مثال۔ اصل ترکیب، مقدار یا اجزاء کی فہرست فراہم نہیں کی گئی۔', art: 'art-oil' },
  { slug: 'wild-garden-leaves', name: 'Wild Garden Leaves', ur: 'قدرتی باغی پتے', localName: 'Dried leaves', localUr: 'خشک پتے', category: 'Botanicals', description: 'A sample botanical listing with space for the real product story once available.', descriptionUr: 'نباتاتی مصنوعات کی نمائشی فہرست، اصل معلومات دستیاب ہونے پر شامل کی جائیں گی۔', art: 'art-leaf' },
];

const copy = (lang: Lang, en: string, ur: string) => lang === 'en' ? en : ur;
const productCopy = (product: Product, lang: Lang) => lang === 'en' ? product.name : product.ur;
const localCopy = (product: Product, lang: Lang) => lang === 'en' ? product.localName : product.localUr;
const productDescription = (product: Product, lang: Lang) => lang === 'en' ? product.description : product.descriptionUr;

function StoreLink({ href, children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const target = href === '/' ? '#top' : href === '/checkout' ? '#preview-note' : '#collection';
  return <a href={target} {...props}>{children}</a>;
}

function Header({ lang, setLang, count }: { lang: Lang; setLang: (lang: Lang) => void; count: number }) {
  const nav = [
    { href: '/', en: 'Home', ur: 'صفحۂ اول' },
    { href: '/products', en: 'The collection', ur: 'مصنوعات' },
    { href: '/checkout', en: 'Preview checkout', ur: 'چیک آؤٹ کا پیش منظر' },
  ];
  return <>
    <div className="announcement" data-testid="notice-contact">
      <div className="announcement-inner">
        <span>{copy(lang, 'Contact on WhatsApp to order', 'آرڈر کے لیے واٹس ایپ پر رابطہ کریں')}</span>
        <span aria-hidden="true">·</span>
        <span>{copy(lang, 'Contact no.:', 'رابطہ نمبر:')} <bdi>{STORE_CONFIG.whatsappNumber}</bdi></span>
      </div>
    </div>
    <header className="site-header">
      <div className="container-wide header-main">
        <StoreLink href="/" className="brand-mark" aria-label={copy(lang, 'Tib-E-Nabwi home', 'طبِ نبوی صفحۂ اول')} data-testid="link-brand">
          <span className="brand-symbol"><Sprout size={20} strokeWidth={1.5} /></span>
          <span><span className="brand-name">{STORE_CONFIG.shopName}</span><span className="brand-subtitle">{copy(lang, 'Botanical goods', 'نباتاتی اشیاء')}</span></span>
        </StoreLink>
        <nav className="nav-links" aria-label={copy(lang, 'Main navigation', 'مرکزی نیویگیشن')}>
          {nav.map((item) => <StoreLink key={item.href} href={item.href} className="nav-link" aria-current={item.href === '/' ? 'page' : undefined} data-testid={`link-nav-${item.href === '/' ? 'home' : item.href.slice(1)}`}>{copy(lang, item.en, item.ur)}</StoreLink>)}
        </nav>
        <div className="header-actions">
          <button className="language-toggle" onClick={() => setLang(lang === 'en' ? 'ur' : 'en')} aria-label={copy(lang, 'Switch language to Urdu', 'زبان انگریزی میں تبدیل کریں')} data-testid="button-language">{lang === 'en' ? 'اردو' : 'English'}</button>
          <button className="icon-button" aria-label={`${copy(lang, 'Open shopping bag', 'خریداری کا بیگ کھولیں')}, ${count}`} data-testid="button-open-cart"><ShoppingBag size={16} /><span className="cart-label">{copy(lang, 'Bag', 'بیگ')}</span><span className="cart-count" data-testid="text-cart-count">{count}</span></button>
        </div>
      </div>
    </header>
  </>;
}

function ProductCard({ product, lang, add }: { product: Product; lang: Lang; add: () => void }) {
  return <article className={`product-card ${product.art}`} data-testid={`card-product-${product.slug}`}>
    <StoreLink href={`/product/${product.slug}`} className="product-card-link" aria-label={`${copy(lang, 'View', 'دیکھیں')} ${productCopy(product, lang)}`}>
      <div className={`product-art ${product.art}`} aria-label={copy(lang, 'Illustrative sample botanical product', 'نباتاتی مصنوعات کی نمائشی تصویر')} role="img">
        <span className="sample-pill">{copy(lang, 'Sample', 'نمونہ')}</span><span className="botanical" aria-hidden="true" />
      </div>
    </StoreLink>
    <div className="product-card-body">
      <h3><StoreLink href={`/product/${product.slug}`} className="product-title-link" data-testid={`link-product-${product.slug}`}>{productCopy(product, lang)}</StoreLink></h3>
      <div className="local-name">{localCopy(product, lang)}</div>
      <p className="product-description">{productDescription(product, lang)}</p>
      <span className="price-note">{copy(lang, 'Price to be confirmed', 'قیمت کی تصدیق باقی ہے')}</span>
      <div className="product-footer">
        <StoreLink href={`/product/${product.slug}`}>{copy(lang, 'Explore sample', 'نمونہ دیکھیں')} <ArrowRight size={13} aria-hidden="true" /></StoreLink>
        <button className="add-button" onClick={add} aria-label={`${copy(lang, 'Add sample to demo bag', 'نمونہ ڈیمو بیگ میں شامل کریں')}: ${productCopy(product, lang)}`} data-testid={`button-add-${product.slug}`}><Plus size={16} /></button>
      </div>
    </div>
  </article>;
}

function Value({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return <div className="value-item"><div className="value-icon">{icon}</div><div><h3>{title}</h3><p>{text}</p></div></div>;
}

function Footer({ lang }: { lang: Lang }) {
  return <footer className="footer"><div className="container-wide">
    <div className="footer-main">
      <div><StoreLink href="/" className="brand-mark"><span className="brand-symbol"><Sprout size={20} /></span><span><span className="brand-name">{STORE_CONFIG.shopName}</span><span className="brand-subtitle">{copy(lang, 'Botanical goods', 'نباتاتی اشیاء')}</span></span></StoreLink><p>{copy(lang, 'A contemporary neighborhood herbal shop, currently presented as a sample storefront.', 'ایک جدید محلے کی جڑی بوٹیوں کی دکان، فی الحال نمائشی اسٹور کی صورت میں۔')}</p></div>
      <div><h4>{copy(lang, 'Find your way', 'اپنی منزل منتخب کریں')}</h4><div className="footer-links"><StoreLink href="/">{copy(lang, 'Home', 'صفحۂ اول')}</StoreLink><StoreLink href="/products">{copy(lang, 'Sample catalogue', 'نمائشی کیٹلاگ')}</StoreLink><StoreLink href="/checkout">{copy(lang, 'Checkout preview', 'چیک آؤٹ کا پیش منظر')}</StoreLink></div></div>
      <div><h4>{copy(lang, 'A note from the shop', 'دکان کی جانب سے ایک نوٹ')}</h4><p>{copy(lang, 'WhatsApp contact', 'واٹس ایپ رابطہ')}: <bdi>{STORE_CONFIG.whatsappNumber}</bdi><br />{copy(lang, 'The number is a placeholder; this preview does not contact anyone.', 'یہ نمبر عارضی ہے؛ یہ پیش منظر کسی سے رابطہ نہیں کرتا۔')}</p></div>
    </div>
    <div className="footer-bottom"><span>{copy(lang, '© Tib-E-Nabwi · storefront preview', '© طبِ نبوی · اسٹور فرنٹ پیش منظر')}</span><span>{copy(lang, 'Illustrative products · no live orders', 'نمائشی مصنوعات · کوئی حقیقی آرڈر نہیں')}</span></div>
  </div></footer>;
}

export function Current() {
  const [lang, setLang] = useState<Lang>('en');
  const [count, setCount] = useState(0);
  const add = () => setCount((current) => current + 1);
  const heroImg = '/__mockup/images/herbal-courtyard.jpg';

  return <div className="site-shell" id="top" dir={lang === 'ur' ? 'rtl' : 'ltr'}>
    <a className="skip-link" href="#main-content">{copy(lang, 'Skip to content', 'مواد پر جائیں')}</a>
    <Header lang={lang} setLang={setLang} count={count} />
    <main id="main-content" data-testid="page-home">
      <section className="hero">
        <div className="hero-image" style={{ backgroundImage: `url("${heroImg}")` }} aria-hidden="true" />
        <div className="hero-content">
          <div className="eyebrow fade-up">{copy(lang, 'A neighborhood apothecary, reimagined', 'محلے کی جڑی بوٹیوں کی دکان، ایک نئے انداز میں')}</div>
          <h1 className="fade-up delay-1">{copy(lang, 'A little closer to the garden.', 'قدرت کی خوشبو، آپ کے قریب۔')}</h1>
          <p className="fade-up delay-2">{copy(lang, 'A thoughtful home for botanical goods, familiar traditions and the small rituals that make a place feel like yours.', 'نباتاتی اشیاء، مانوس روایات اور روزمرہ کے ان چھوٹے معمولات کے لیے ایک پیارا سا گوشہ جو گھر جیسا احساس دیں۔')}</p>
          <p className="hero-urdu fade-up delay-2" lang="ur" dir="rtl">{copy(lang, 'Thoughtfully gathered. Warmly shared.', 'محبت سے چنی ہوئی چیزیں، خلوص سے پیش کی گئی۔')}</p>
          <div className="button-row fade-up delay-3">
            <StoreLink href="/products" className="button-primary" data-testid="link-hero-products">{copy(lang, 'Browse the collection', 'مصنوعات دیکھیں')} <ArrowUpRight size={15} /></StoreLink>
            <StoreLink href="/checkout" className="button-outline" data-testid="link-hero-checkout">{copy(lang, 'Checkout preview', 'چیک آؤٹ کا پیش منظر')}</StoreLink>
          </div>
        </div>
      </section>

      <section className="section" id="collection">
        <div className="container-wide">
          <div className="section-head">
            <div><span className="eyebrow">{copy(lang, 'From the sample shelf', 'نمائشی شیلف سے')}</span><h2>{copy(lang, 'A collection in the making', 'ایک مجموعہ جو تشکیل پا رہا ہے')}</h2></div>
            <div><p>{copy(lang, 'These illustrative listings show how a future catalogue might feel. Every product, ingredient and price is a sample until confirmed by the shop.', 'یہ نمائشی فہرستیں مستقبل کے کیٹلاگ کا انداز دکھاتی ہیں۔ دکان سے تصدیق ہونے تک ہر مصنوعات، جزو اور قیمت صرف نمونہ ہے۔')}</p><StoreLink className="button-quiet" href="/products" data-testid="link-home-all-samples">{copy(lang, 'See all samples', 'تمام نمونے دیکھیں')} <ArrowRight size={14} /></StoreLink></div>
          </div>
          <div className="product-grid">{products.map((product) => <ProductCard key={product.slug} product={product} lang={lang} add={add} />)}</div>
        </div>
      </section>

      <section className="section" style={{ background: '#f0eee4' }}>
        <div className="container-wide story-grid">
          <div className="story-visual" role="img" aria-label={copy(lang, 'Abstract botanical still life in a sunlit courtyard', 'دھوپ سے روشن صحن میں نباتاتی اشیاء کا تجریدی منظر')}><span className="story-orb" /><span className="story-leaf" /><span className="story-note">{copy(lang, 'Rooted in everyday rituals', 'روزمرہ روایتوں سے جڑا')}</span></div>
          <div className="story-copy">
            <span className="eyebrow">{copy(lang, 'A little about our way', 'ہمارے انداز کے بارے میں')}</span>
            <h2>{copy(lang, 'A familiar feeling, with room to grow.', 'مانوس احساس، آگے بڑھنے کی گنجائش کے ساتھ۔')}</h2>
            <div className="story-rule" />
            <p>{copy(lang, 'Tib-E-Nabwi is a welcoming place to discover botanical goods and everyday objects. We are preparing this storefront as a home for a real catalogue, with clear details to come from the people who know each product best.', 'طبِ نبوی نباتاتی اشیاء اور روزمرہ کی چیزوں کو دریافت کرنے کی ایک پُرخلوص جگہ ہے۔ ہم اس اسٹور کو حقیقی کیٹلاگ کے لیے تیار کر رہے ہیں، جس میں ہر مصنوعات کی درست تفصیل فراہم کی جائے گی۔')}</p>
            <p lang="ur" dir="rtl" className="urdu">{copy(lang, 'ہر چیز کے بارے میں درست اور واضح معلومات ہماری ترجیح ہیں۔', 'ہر چیز کے بارے میں درست اور واضح معلومات ہماری ترجیح ہیں۔')}</p>
            <StoreLink href="/products" className="button-outline">{copy(lang, 'Explore the sample shelf', 'نمائشی شیلف دیکھیں')} <ArrowUpRight size={14} /></StoreLink>
          </div>
        </div>
      </section>

      <section className="values-band">
        <div className="container-wide values-grid">
          <Value icon={<Leaf size={18} />} title={copy(lang, 'A gentler point of view', 'نرم اور سادہ نقطۂ نظر')} text={copy(lang, 'A considered space for botanicals, without promises or guesswork.', 'نباتاتی اشیاء کے لیے ایک باوقار جگہ، بغیر کسی غیر مصدقہ دعوے کے۔')} />
          <Value icon={<CircleHelp size={18} />} title={copy(lang, 'Details before decisions', 'فیصلے سے پہلے تفصیل')} text={copy(lang, 'Ingredients, sizes and prices will be confirmed by the shop.', 'اجزاء، مقدار اور قیمتوں کی تصدیق دکان کی جانب سے کی جائے گی۔')} />
          <Value icon={<Sprout size={18} />} title={copy(lang, 'Made to feel familiar', 'مانوس احساس کے لیے')} text={copy(lang, 'English and Urdu, with a distinctly local sense of welcome.', 'انگریزی اور اردو، ایک مقامی اور اپنائیت بھرے انداز میں۔')} />
        </div>
      </section>

      <section className="section" id="preview-note">
        <div className="container-wide journal-card">
          <div className="journal-art" role="img" aria-label={copy(lang, 'Soft abstract botanical forms', 'نرم تجریدی نباتاتی اشکال')} />
          <div className="journal-copy">
            <span className="eyebrow">{copy(lang, 'A note on the preview', 'اس پیش منظر کے بارے میں')}</span>
            <h2>{copy(lang, 'Good information grows from real beginnings.', 'اچھی معلومات حقیقی بنیاد سے جنم لیتی ہیں۔')}</h2>
            <p>{copy(lang, 'The items you see are sample concepts, not a live catalogue. Once genuine product details are ready, this space can share ingredients, sizes and care notes in both languages.', 'یہاں دکھائی گئی اشیاء نمائشی مثالیں ہیں، فعال کیٹلاگ نہیں۔ حقیقی معلومات دستیاب ہونے پر یہاں اجزاء، مقدار اور استعمال کی تفصیلات دونوں زبانوں میں شامل کی جا سکتی ہیں۔')}</p>
            <StoreLink href="/products" className="button-quiet">{copy(lang, 'View sample products', 'نمائشی مصنوعات دیکھیں')} <ArrowRight size={14} /></StoreLink>
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="container-wide proof-note" data-testid="note-no-social-proof">
          <ShieldCheck className="proof-icon" size={22} />
          <p>{copy(lang, 'Verified reviews and store statistics will appear here only after genuine orders and real data exist. This preview does not display customer quotes, ratings or sales claims.', 'تصدیق شدہ جائزے اور دکان کے اعداد و شمار حقیقی آرڈرز اور مستند معلومات کے بعد ہی یہاں دکھائے جائیں گے۔ اس پیش منظر میں صارفین کے تبصرے، درجہ بندی یا فروخت کے دعوے شامل نہیں ہیں۔')}</p>
          <p className="urdu" lang="ur" dir="rtl">{copy(lang, 'شفافیت، ہر دعوے سے زیادہ اہم ہے۔', 'شفافیت، ہر دعوے سے زیادہ اہم ہے۔')}</p>
        </div>
      </section>

      <section className="final-cta">
        <div className="container-wide">
          <span className="eyebrow" style={{ justifyContent: 'center' }}>{copy(lang, 'Come have a look', 'آئیے، ایک نظر دیکھیں')}</span>
          <h2>{copy(lang, 'The first page of something good.', 'ایک اچھی شروعات کا پہلا صفحہ۔')}</h2>
          <p>{copy(lang, 'Browse sample products or try the bilingual checkout preview. Nothing is sold or submitted from this demo.', 'نمائشی مصنوعات دیکھیں یا دو لسانی چیک آؤٹ کا پیش منظر آزمائیں۔ اس ڈیمو سے کوئی آرڈر جمع یا فروخت نہیں ہوتا۔')}</p>
          <div className="button-row" style={{ justifyContent: 'center' }}>
            <StoreLink href="/products" className="button-primary" data-testid="link-cta-products">{copy(lang, 'Visit the collection', 'مصنوعات دیکھیں')} <ArrowRight size={15} /></StoreLink>
            <StoreLink href="/checkout" className="button-outline" data-testid="link-cta-checkout">{copy(lang, 'Try checkout preview', 'چیک آؤٹ پیش منظر آزمائیں')}</StoreLink>
          </div>
        </div>
      </section>
    </main>
    <Footer lang={lang} />
  </div>;
}
