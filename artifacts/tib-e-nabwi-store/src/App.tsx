import { createContext, useContext, useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, CircleHelp, Leaf, Minus, PackageOpen, Plus, Search, ShieldCheck, ShoppingBag, Sprout, Trash2, X } from 'lucide-react';
import { Link, Route, Switch, useLocation, Router as WouterRouter, useRoute } from 'wouter';
import './index.css';

type Lang = 'en' | 'ur';
type Product = { slug: string; name: string; ur: string; localName: string; localUr: string; category: string; description: string; descriptionUr: string; art: string };
type CartLine = { slug: string; quantity: number };

const STORE_CONFIG = {
  // Replace this placeholder when the store's WhatsApp number is confirmed.
  whatsappNumber: '03.........',
  shopName: 'Tib-E-Nabwi',
};

const products: Product[] = [
  { slug: 'garden-seed-blend', name: 'Garden Seed Blend', ur: 'باغ کے بیجوں کا آمیزہ', localName: 'Mixed botanical seeds', localUr: 'مخلوط نباتاتی بیج', category: 'Seeds', description: 'An illustrative sample listing for a traditional pantry staple. Product details are not yet confirmed.', descriptionUr: 'روایتی گھریلو استعمال کی ایک نمائشی مثال۔ مصنوعات کی تفصیلات ابھی تصدیق شدہ نہیں ہیں۔', art: 'art-seed' },
  { slug: 'green-leaf-infusion', name: 'Green Leaf Infusion', ur: 'سبز پتوں کی چائے', localName: 'Herbal infusion', localUr: 'جڑی بوٹیوں کا مشروب', category: 'Herbal blends', description: 'A placeholder for a loose herbal blend. Ingredients and preparation details will be added by the shop owner.', descriptionUr: 'کھلی جڑی بوٹیوں کے آمیزے کی نمائشی مثال۔ اجزاء اور استعمال کی تفصیلات دکاندار شامل کریں گے۔', art: 'art-tea' },
  { slug: 'golden-kernel-oil', name: 'Golden Kernel Oil', ur: 'سنہری بیجوں کا تیل', localName: 'Botanical oil', localUr: 'نباتاتی تیل', category: 'Oils', description: 'An illustrative bottle concept only. No real formulation, size, or ingredient list has been provided.', descriptionUr: 'صرف بوتل کی نمائشی مثال۔ اصل ترکیب، مقدار یا اجزاء کی فہرست فراہم نہیں کی گئی۔', art: 'art-oil' },
  { slug: 'wild-garden-leaves', name: 'Wild Garden Leaves', ur: 'قدرتی باغی پتے', localName: 'Dried leaves', localUr: 'خشک پتے', category: 'Botanicals', description: 'A sample botanical listing with space for the real product story once available.', descriptionUr: 'نباتاتی مصنوعات کی نمائشی فہرست، اصل معلومات دستیاب ہونے پر شامل کی جائیں گی۔', art: 'art-leaf' },
];

const queryClient = new QueryClient();
const StoreContext = createContext<{ lang: Lang; setLang: (lang: Lang) => void; cart: CartLine[]; add: (slug: string) => void; change: (slug: string, delta: number) => void; remove: (slug: string) => void; count: number } | null>(null);
const useStore = () => {
  const value = useContext(StoreContext);
  if (!value) throw new Error('Store context is missing');
  return value;
};
const copy = (lang: Lang, en: string, ur: string) => lang === 'en' ? en : ur;
const productCopy = (product: Product, lang: Lang) => lang === 'en' ? product.name : product.ur;
const localCopy = (product: Product, lang: Lang) => lang === 'en' ? product.localName : product.localUr;
const productDescription = (product: Product, lang: Lang) => lang === 'en' ? product.description : product.descriptionUr;

function App() {
  const [lang, setLang] = useState<Lang>(() => localStorage.getItem('tn-lang') === 'ur' ? 'ur' : 'en');
  const [cart, setCart] = useState<CartLine[]>(() => {
    try { return JSON.parse(localStorage.getItem('tn-cart') || '[]') as CartLine[]; } catch { return []; }
  });
  const [cartOpen, setCartOpen] = useState(false);
  useEffect(() => {
    document.documentElement.lang = lang === 'ur' ? 'ur' : 'en';
    document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr';
    localStorage.setItem('tn-lang', lang);
  }, [lang]);
  useEffect(() => { localStorage.setItem('tn-cart', JSON.stringify(cart)); }, [cart]);
  const add = (slug: string) => setCart((current) => {
    const found = current.find((line) => line.slug === slug);
    return found ? current.map((line) => line.slug === slug ? { ...line, quantity: line.quantity + 1 } : line) : [...current, { slug, quantity: 1 }];
  });
  const change = (slug: string, delta: number) => setCart((current) => current.map((line) => line.slug === slug ? { ...line, quantity: line.quantity + delta } : line).filter((line) => line.quantity > 0));
  const remove = (slug: string) => setCart((current) => current.filter((line) => line.slug !== slug));
  const count = cart.reduce((sum, line) => sum + line.quantity, 0);
  const ctx = useMemo(() => ({ lang, setLang, cart, add, change, remove, count }), [lang, cart, count]);
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <StoreContext.Provider value={ctx}>
          <div className="site-shell" dir={lang === 'ur' ? 'rtl' : 'ltr'}>
            <a className="skip-link" href="#main-content">{copy(lang, 'Skip to content', 'مواد پر جائیں')}</a>
            <Header onCart={() => setCartOpen(true)} />
            <RoutedErrorBoundary>
              <Switch>
                <Route path="/" component={Home} />
                <Route path="/products" component={Catalog} />
                <Route path="/checkout" component={Checkout} />
                <Route path="/product/:slug" component={ProductDetail} />
                <Route component={MissingPage} />
              </Switch>
            </RoutedErrorBoundary>
            <Footer />
            {cartOpen && <CartDrawer close={() => setCartOpen(false)} />}
          </div>
          <Toaster />
        </StoreContext.Provider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function Header({ onCart }: { onCart: () => void }) {
  const { lang, setLang, count } = useStore();
  const [location] = useLocation();
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
        <Link href="/" className="brand-mark" aria-label={copy(lang, 'Tib-E-Nabwi home', 'طبِ نبوی صفحۂ اول')} data-testid="link-brand">
          <span className="brand-symbol"><Sprout size={20} strokeWidth={1.5} /></span>
          <span><span className="brand-name">Tib-E-Nabwi</span><span className="brand-subtitle">{copy(lang, 'Botanical goods', 'نباتاتی اشیاء')}</span></span>
        </Link>
        <nav className="nav-links" aria-label={copy(lang, 'Main navigation', 'مرکزی نیویگیشن')}>
          {nav.map((item) => <Link key={item.href} href={item.href} className="nav-link" aria-current={location === item.href ? 'page' : undefined} data-testid={`link-nav-${item.href === '/' ? 'home' : item.href.slice(1)}`}>{copy(lang, item.en, item.ur)}</Link>)}
        </nav>
        <div className="header-actions">
          <button className="language-toggle" onClick={() => setLang(lang === 'en' ? 'ur' : 'en')} aria-label={copy(lang, 'Switch language to Urdu', 'زبان انگریزی میں تبدیل کریں')} data-testid="button-language">{lang === 'en' ? 'اردو' : 'English'}</button>
          <button className="icon-button" onClick={onCart} aria-label={`${copy(lang, 'Open shopping bag', 'خریداری کا بیگ کھولیں')}, ${count}`} data-testid="button-open-cart"><ShoppingBag size={16} /><span className="cart-label">{copy(lang, 'Bag', 'بیگ')}</span><span className="cart-count" data-testid="text-cart-count">{count}</span></button>
        </div>
      </div>
    </header>
  </>;
}

function ProductArt({ product, detail = false }: { product: Product; detail?: boolean }) {
  const { lang } = useStore();
  return <div className={`${detail ? 'detail-art' : 'product-art'} ${product.art}`} aria-label={copy(lang, 'Illustrative sample botanical product', 'نباتاتی مصنوعات کی نمائشی تصویر')} role="img">
    {!detail && <span className="sample-pill">{copy(lang, 'Sample', 'نمونہ')}</span>}
    <span className="botanical" aria-hidden="true" />
  </div>;
}

function ProductCard({ product }: { product: Product }) {
  const { lang, add } = useStore();
  return <article className={`product-card ${product.art}`} data-testid={`card-product-${product.slug}`}>
    <Link href={`/product/${product.slug}`} className="product-card-link" aria-label={`${copy(lang, 'View', 'دیکھیں')} ${productCopy(product, lang)}`}><ProductArt product={product} /></Link>
    <div className="product-card-body">
      <h3><Link href={`/product/${product.slug}`} className="product-title-link" data-testid={`link-product-${product.slug}`}>{productCopy(product, lang)}</Link></h3>
      <div className="local-name">{localCopy(product, lang)}</div>
      <p className="product-description">{productDescription(product, lang)}</p>
      <span className="price-note">{copy(lang, 'Price to be confirmed', 'قیمت کی تصدیق باقی ہے')}</span>
      <div className="product-footer">
        <Link href={`/product/${product.slug}`}>{copy(lang, 'Explore sample', 'نمونہ دیکھیں')} <ArrowRight size={13} aria-hidden="true" /></Link>
        <button className="add-button" onClick={() => add(product.slug)} aria-label={`${copy(lang, 'Add sample to demo bag', 'نمونہ ڈیمو بیگ میں شامل کریں')}: ${productCopy(product, lang)}`} data-testid={`button-add-${product.slug}`}><Plus size={16} /></button>
      </div>
    </div>
  </article>;
}

function Home() {
  const { lang } = useStore();
  const heroImg = `${import.meta.env.BASE_URL}herbal-courtyard.jpg`;
  return <main id="main-content" data-testid="page-home">
    <section className="hero">
      <div className="hero-image" style={{ backgroundImage: `url("${heroImg}")` }} aria-hidden="true" />
      <div className="hero-content">
        <div className="eyebrow fade-up">{copy(lang, 'A neighborhood apothecary, reimagined', 'محلے کی جڑی بوٹیوں کی دکان، ایک نئے انداز میں')}</div>
        <h1 className="fade-up delay-1">{copy(lang, 'A little closer to the garden.', 'قدرت کی خوشبو، آپ کے قریب۔')}</h1>
        <p className="fade-up delay-2">{copy(lang, 'A thoughtful home for botanical goods, familiar traditions and the small rituals that make a place feel like yours.', 'نباتاتی اشیاء، مانوس روایات اور روزمرہ کے ان چھوٹے معمولات کے لیے ایک پیارا سا گوشہ جو گھر جیسا احساس دیں۔')}</p>
        <p className="hero-urdu fade-up delay-2" lang="ur" dir="rtl">{copy(lang, 'Thoughtfully gathered. Warmly shared.', 'محبت سے چنی ہوئی چیزیں، خلوص سے پیش کی گئی۔')}</p>
        <div className="button-row fade-up delay-3">
          <Link href="/products" className="button-primary" data-testid="link-hero-products">{copy(lang, 'Browse the collection', 'مصنوعات دیکھیں')} <ArrowUpRight size={15} /></Link>
          <Link href="/checkout" className="button-outline" data-testid="link-hero-checkout">{copy(lang, 'Checkout preview', 'چیک آؤٹ کا پیش منظر')}</Link>
        </div>
      </div>
    </section>

    <section className="section" id="collection">
      <div className="container-wide">
        <div className="section-head">
          <div><span className="eyebrow">{copy(lang, 'From the sample shelf', 'نمائشی شیلف سے')}</span><h2>{copy(lang, 'A collection in the making', 'ایک مجموعہ جو تشکیل پا رہا ہے')}</h2></div>
          <div><p>{copy(lang, 'These illustrative listings show how a future catalogue might feel. Every product, ingredient and price is a sample until confirmed by the shop.', 'یہ نمائشی فہرستیں مستقبل کے کیٹلاگ کا انداز دکھاتی ہیں۔ دکان سے تصدیق ہونے تک ہر مصنوعات، جزو اور قیمت صرف نمونہ ہے۔')}</p><Link className="button-quiet" href="/products" data-testid="link-home-all-samples">{copy(lang, 'See all samples', 'تمام نمونے دیکھیں')} <ArrowRight size={14} /></Link></div>
        </div>
        <div className="product-grid">{products.map((product) => <ProductCard key={product.slug} product={product} />)}</div>
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
          <Link href="/products" className="button-outline">{copy(lang, 'Explore the sample shelf', 'نمائشی شیلف دیکھیں')} <ArrowUpRight size={14} /></Link>
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

    <section className="section">
      <div className="container-wide journal-card">
        <div className="journal-art" role="img" aria-label={copy(lang, 'Soft abstract botanical forms', 'نرم تجریدی نباتاتی اشکال')} />
        <div className="journal-copy">
          <span className="eyebrow">{copy(lang, 'A note on the preview', 'اس پیش منظر کے بارے میں')}</span>
          <h2>{copy(lang, 'Good information grows from real beginnings.', 'اچھی معلومات حقیقی بنیاد سے جنم لیتی ہیں۔')}</h2>
          <p>{copy(lang, 'The items you see are sample concepts, not a live catalogue. Once genuine product details are ready, this space can share ingredients, sizes and care notes in both languages.', 'یہاں دکھائی گئی اشیاء نمائشی مثالیں ہیں، فعال کیٹلاگ نہیں۔ حقیقی معلومات دستیاب ہونے پر یہاں اجزاء، مقدار اور استعمال کی تفصیلات دونوں زبانوں میں شامل کی جا سکتی ہیں۔')}</p>
          <Link href="/products" className="button-quiet">{copy(lang, 'View sample products', 'نمائشی مصنوعات دیکھیں')} <ArrowRight size={14} /></Link>
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
          <Link href="/products" className="button-primary" data-testid="link-cta-products">{copy(lang, 'Visit the collection', 'مصنوعات دیکھیں')} <ArrowRight size={15} /></Link>
          <Link href="/checkout" className="button-outline" data-testid="link-cta-checkout">{copy(lang, 'Try checkout preview', 'چیک آؤٹ پیش منظر آزمائیں')}</Link>
        </div>
      </div>
    </section>
  </main>;
}

function Value({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return <div className="value-item"><div className="value-icon">{icon}</div><div><h3>{title}</h3><p>{text}</p></div></div>;
}

function Catalog() {
  const { lang } = useStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const categories = ['All', 'Seeds', 'Herbal blends', 'Oils', 'Botanicals'];
  const filtered = products.filter((p) => (filter === 'All' || p.category === filter) && `${p.name} ${p.ur} ${p.category}`.toLowerCase().includes(search.toLowerCase()));
  const urCategory: Record<string, string> = { All: 'تمام', Seeds: 'بیج', 'Herbal blends': 'جڑی بوٹیوں کے آمیزے', Oils: 'تیل', Botanicals: 'نباتات' };
  return <main id="main-content" data-testid="page-products">
    <div className="page-hero"><div className="container-wide"><span className="eyebrow">{copy(lang, 'The collection', 'مصنوعات')}</span><h1>{copy(lang, 'A shelf of possibilities.', 'امکانات سے بھرا ایک شیلف۔')}</h1><p>{copy(lang, 'A preview catalogue with illustrative botanical items. Product names are placeholders; descriptions, ingredients, sizes and prices are not confirmed.', 'نباتاتی اشیاء کے نمائشی کیٹلاگ کا پیش منظر۔ نام عارضی ہیں؛ تفصیل، اجزاء، مقدار اور قیمت کی تصدیق نہیں ہوئی۔')}</p></div></div>
    <section className="section"><div className="container-wide">
      <div className="catalog-controls">
        <div className="search-field"><Search size={15} /><input aria-label={copy(lang, 'Search sample products', 'نمائشی مصنوعات تلاش کریں')} placeholder={copy(lang, 'Search the sample shelf', 'نمائشی شیلف تلاش کریں')} value={search} onChange={(e) => setSearch(e.target.value)} data-testid="input-product-search" /></div>
        <div className="filter-row" role="group" aria-label={copy(lang, 'Filter products by category', 'مصنوعات کو زمرے کے لحاظ سے فلٹر کریں')}>
          {categories.map((cat) => <button key={cat} className={`filter-chip ${cat === filter ? 'active' : ''}`} aria-pressed={filter === cat} onClick={() => setFilter(cat)} data-testid={`filter-${cat.toLowerCase().replaceAll(' ', '-')}`}>{copy(lang, cat, urCategory[cat])}</button>)}
        </div>
      </div>
      {filtered.length > 0 ? <div className="product-grid">{filtered.map((product) => <ProductCard key={product.slug} product={product} />)}</div> : <div className="empty-cart"><PackageOpen size={28} /><h3>{copy(lang, 'Nothing on this shelf yet', 'اس شیلف پر ابھی کچھ نہیں')}</h3><p>{copy(lang, 'Try another search or choose a different category.', 'دوسری تلاش یا زمرہ منتخب کریں۔')}</p><button className="button-outline" onClick={() => { setSearch(''); setFilter('All'); }}>{copy(lang, 'Clear filters', 'فلٹر صاف کریں')}</button></div>}
    </div></section>
    <div className="container-wide" style={{ paddingBottom: 56 }}><div className="notice-strip">{copy(lang, 'Every item on this page is a clearly marked sample. Prices are to be confirmed; no purchase can be completed in this preview.', 'اس صفحے کی ہر چیز واضح طور پر نمونہ ہے۔ قیمت کی تصدیق باقی ہے؛ اس پیش منظر میں خریداری مکمل نہیں کی جا سکتی۔')}</div></div>
  </main>;
}

function ProductDetail() {
  const { lang, add } = useStore();
  const [, params] = useRoute('/product/:slug');
  const product = products.find((item) => item.slug === params?.slug);
  if (!product) return <MissingPage />;
  return <main id="main-content" data-testid="page-product-detail">
    <div className="container-wide" style={{ padding: '27px 0' }}><Link href="/products" className="button-quiet"><ArrowLeft size={14} />{copy(lang, 'Back to sample collection', 'نمائشی مصنوعات پر واپس')}</Link></div>
    <section className="section-tight"><div className="container-wide detail-layout">
      <ProductArt product={product} detail />
      <div className="detail-copy">
        <span className="eyebrow">{copy(lang, 'Illustrative sample · not a live listing', 'نمائشی مثال · فعال فہرست نہیں')}</span>
        <h1>{productCopy(product, lang)}</h1><div className="local-name">{localCopy(product, lang)}</div>
        <div className="detail-meta"><strong>{copy(lang, 'Price to be confirmed', 'قیمت کی تصدیق باقی ہے')}</strong><span>{copy(lang, 'Sample item', 'نمائشی شے')}</span></div>
        <p>{productDescription(product, lang)}</p>
        <p>{copy(lang, 'The shop owner can replace this preview with verified ingredients, size, origin and product care information. No efficacy or health claims are made here.', 'دکاندار اس پیش منظر کی جگہ تصدیق شدہ اجزاء، مقدار، ماخذ اور استعمال کی معلومات شامل کر سکتے ہیں۔ یہاں کوئی طبی یا افادیت کا دعویٰ نہیں کیا گیا۔')}</p>
        <div className="preview-alert">{copy(lang, 'This is a sample product page. Adding it to the local demo bag does not reserve or purchase anything.', 'یہ نمائشی مصنوعات کا صفحہ ہے۔ اسے مقامی ڈیمو بیگ میں شامل کرنے سے کوئی چیز محفوظ یا خریدی نہیں جاتی۔')}</div>
        <button className="button-primary" onClick={() => add(product.slug)} data-testid={`button-add-detail-${product.slug}`}><ShoppingBag size={15} />{copy(lang, 'Add sample to demo bag', 'نمونہ ڈیمو بیگ میں شامل کریں')}</button>
      </div>
    </div></section>
  </main>;
}

function Checkout() {
  const { lang, setLang, cart, change, remove } = useStore();
  const [errors, setErrors] = useState<string[]>([]);
  const [reviewed, setReviewed] = useState(false);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const [fields, setFields] = useState({ name: '', phone: '', city: '', address: '' });
  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const next: string[] = [];
    if (!fields.name.trim()) next.push(copy(lang, 'Please enter your name.', 'براہِ کرم اپنا نام درج کریں۔'));
    if (!fields.phone.trim() || !/^[+()\d\s-]{7,20}$/.test(fields.phone)) next.push(copy(lang, 'Enter a valid phone number.', 'درست فون نمبر درج کریں۔'));
    if (!fields.city.trim()) next.push(copy(lang, 'Please enter your city.', 'براہِ کرم اپنا شہر درج کریں۔'));
    if (!fields.address.trim()) next.push(copy(lang, 'Please enter an address for this preview.', 'اس پیش منظر کے لیے پتہ درج کریں۔'));
    setErrors(next);
    setReviewed(next.length === 0);
  };
  return <main id="main-content" data-testid="page-checkout">
    <div className="page-hero"><div className="container-wide"><span className="eyebrow">{copy(lang, 'Bilingual form demonstration', 'دو لسانی فارم کا مظاہرہ')}</span><h1>{copy(lang, 'Checkout preview.', 'چیک آؤٹ کا پیش منظر۔')}</h1><p>{copy(lang, 'A local-only demonstration of the checkout layout. No backend or payment connection is present.', 'چیک آؤٹ کے لے آؤٹ کا صرف مقامی مظاہرہ۔ کوئی بیک اینڈ یا ادائیگی کا نظام منسلک نہیں ہے۔')}</p></div></div>
    <section className="section"><div className="container-wide checkout-wrap">
      <section className="checkout-card">
        <h2>{copy(lang, 'Your details', 'آپ کی تفصیلات')}</h2>
        <p className="muted">{copy(lang, 'Use any details you like for the preview; nothing will be sent or stored as an order.', 'پیش منظر کے لیے کوئی بھی معلومات درج کریں؛ کچھ بھی آرڈر کے طور پر بھیجا یا محفوظ نہیں ہوگا۔')}</p>
        <div className="preview-alert" role="note" data-testid="notice-checkout-preview"><strong>{copy(lang, 'Preview only. This form does not submit or charge a real order.', 'صرف پیش منظر۔ یہ فارم حقیقی آرڈر جمع نہیں کرتا اور نہ ہی کوئی رقم وصول کرتا ہے۔')}</strong><br />{copy(lang, 'No payment, delivery, COD, service-area or support commitment is being made.', 'ادائیگی، ڈیلیوری، کیش آن ڈیلیوری، سروس ایریا یا معاونت کا کوئی وعدہ نہیں کیا جا رہا۔')}</div>
        {reviewed ? <div className="success-panel" role="status" data-testid="status-preview-reviewed"><Check size={20} /><h3>{copy(lang, 'Preview details reviewed', 'پیش منظر کی تفصیلات دیکھی گئیں')}</h3><p>{copy(lang, 'Nothing was submitted. No order was created and no payment was taken. You can edit the details below or leave this page.', 'کچھ بھی جمع نہیں کیا گیا۔ کوئی آرڈر نہیں بنایا گیا اور کوئی ادائیگی نہیں ہوئی۔ آپ نیچے معلومات بدل سکتے ہیں یا اس صفحے سے جا سکتے ہیں۔')}</p><button className="button-outline" onClick={() => setReviewed(false)}>{copy(lang, 'Edit preview details', 'پیش منظر کی تفصیلات میں ترمیم')}</button></div> : null}
        <form onSubmit={onSubmit} noValidate data-testid="form-checkout">
          <div className="field-grid">
            <Field lang={lang} label="Full name" ur="پورا نام" name="name" value={fields.name} onChange={(value) => setFields({ ...fields, name: value })} required />
            <Field lang={lang} label="Phone number" ur="فون نمبر" name="phone" value={fields.phone} onChange={(value) => setFields({ ...fields, phone: value })} required type="tel" />
          </div>
          <div className="field-grid">
            <Field lang={lang} label="City" ur="شہر" name="city" value={fields.city} onChange={(value) => setFields({ ...fields, city: value })} required />
            <div className="field"><label htmlFor="checkout-language">{copy(lang, 'Form language', 'فارم کی زبان')}</label><select id="checkout-language" value={lang} onChange={(e) => setLang(e.target.value as Lang)} data-testid="select-form-language"><option value="en">English</option><option value="ur">اردو</option></select></div>
          </div>
          <div className="field"><label htmlFor="checkout-address">{copy(lang, 'Address for preview', 'پیش منظر کے لیے پتہ')} <span aria-hidden="true">*</span></label><textarea id="checkout-address" value={fields.address} onChange={(e) => setFields({ ...fields, address: e.target.value })} required placeholder={copy(lang, 'Enter a sample address', 'نمونہ پتہ درج کریں')} data-testid="input-checkout-address" /></div>
          <div className="field"><label htmlFor="checkout-note">{copy(lang, 'Optional note', 'اختیاری نوٹ')}</label><textarea id="checkout-note" placeholder={copy(lang, 'Anything you would like to see in a future store?', 'مستقبل کی دکان میں آپ کیا دیکھنا چاہیں گے؟')} data-testid="input-checkout-note" /></div>
          {errors.length > 0 && <div className="field-error" role="alert" data-testid="status-form-errors">{errors.map((error) => <div key={error}>{error}</div>)}</div>}
          <button type="submit" className="button-primary" style={{ marginTop: 8 }} data-testid="button-review-preview">{copy(lang, 'Review preview details', 'پیش منظر کی تفصیلات دیکھیں')} <ArrowRight size={15} /></button>
        </form>
      </section>
      <aside className="summary-card">
        <h2>{copy(lang, 'Demo bag', 'ڈیمو بیگ')}</h2><p className="muted">{copy(lang, `${itemCount} sample item${itemCount === 1 ? '' : 's'} · prices to be confirmed`, `${itemCount} نمائشی اشیاء · قیمت کی تصدیق باقی ہے`)}</p>
        {cart.length ? cart.map((line) => {
          const product = products.find((p) => p.slug === line.slug);
          if (!product) return null;
          return <div className="summary-row" key={line.slug}><div className="summary-product"><div className="mini-art"><Leaf size={18} /></div><div><h3>{productCopy(product, lang)}</h3><p>{copy(lang, 'Sample · Qty', 'نمونہ · تعداد')} {line.quantity}</p><button onClick={() => remove(line.slug)} className="button-quiet" style={{ padding: 0, minHeight: 24 }} data-testid={`button-remove-${line.slug}`}><Trash2 size={12} />{copy(lang, 'Remove', 'ہٹائیں')}</button></div></div><div className="quantity-controls"><button onClick={() => change(line.slug, -1)} aria-label={copy(lang, 'Decrease quantity', 'تعداد کم کریں')} data-testid={`button-decrease-${line.slug}`}><Minus size={12} /></button><span>{line.quantity}</span><button onClick={() => change(line.slug, 1)} aria-label={copy(lang, 'Increase quantity', 'تعداد بڑھائیں')} data-testid={`button-increase-${line.slug}`}><Plus size={12} /></button></div></div>;
        }) : <div className="empty-cart"><ShoppingBag size={24} /><h3>{copy(lang, 'Your demo bag is empty', 'آپ کا ڈیمو بیگ خالی ہے')}</h3><p>{copy(lang, 'Add a sample item to preview a checkout summary.', 'چیک آؤٹ کا خلاصہ دیکھنے کے لیے نمائشی شے شامل کریں۔')}</p><Link href="/products" className="button-outline">{copy(lang, 'Browse samples', 'نمونے دیکھیں')}</Link></div>}
        <div className="summary-bottom">
          <div className="summary-row"><span>{copy(lang, 'Subtotal', 'ذیلی کل')}</span><strong>{copy(lang, 'To be confirmed', 'تصدیق باقی ہے')}</strong></div>
          <div className="summary-row"><span>{copy(lang, 'Delivery', 'ڈیلیوری')}</span><strong>{copy(lang, 'Not set', 'طے نہیں')}</strong></div>
          <div className="summary-row summary-total"><span>{copy(lang, 'Total', 'کل')}</span><strong>{copy(lang, 'To be confirmed', 'تصدیق باقی ہے')}</strong></div>
        </div>
        <p className="muted">{copy(lang, 'No COD or delivery method is active in this preview.', 'اس پیش منظر میں کیش آن ڈیلیوری یا ڈیلیوری کا کوئی طریقہ فعال نہیں۔')}</p>
      </aside>
    </div></section>
  </main>;
}

function Field({ lang, label, ur, name, value, onChange, required, type = 'text' }: { lang: Lang; label: string; ur: string; name: string; value: string; onChange: (value: string) => void; required?: boolean; type?: string }) {
  return <div className="field"><label htmlFor={`checkout-${name}`}>{copy(lang, label, ur)}{required && <span aria-hidden="true"> *</span>}</label><input id={`checkout-${name}`} type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} autoComplete={name === 'name' ? 'name' : name === 'phone' ? 'tel' : 'address-level2'} data-testid={`input-checkout-${name}`} /></div>;
}

function CartDrawer({ close }: { close: () => void }) {
  const { lang, cart, change, remove } = useStore();
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => { if (event.key === 'Escape') close(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [close]);
  return <div className="cart-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
    <section className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-heading" data-testid="panel-cart">
      <div className="cart-drawer-head"><div><span className="eyebrow">{copy(lang, 'Local demo', 'مقامی ڈیمو')}</span><h2 id="cart-heading">{copy(lang, 'Your bag', 'آپ کا بیگ')}</h2></div><button autoFocus className="icon-button" onClick={close} aria-label={copy(lang, 'Close bag', 'بیگ بند کریں')} data-testid="button-close-cart"><X size={17} /></button></div>
      <p className="muted">{copy(lang, 'Saved only in this browser as a local preview.', 'صرف اس براؤزر میں مقامی پیش منظر کے طور پر محفوظ ہے۔')}</p>
      {cart.length ? cart.map((line) => {
        const item = products.find((product) => product.slug === line.slug);
        if (!item) return null;
        return <div className="cart-row" key={line.slug}><div><h4>{productCopy(item, lang)}</h4><p>{copy(lang, 'Sample · price to be confirmed', 'نمونہ · قیمت کی تصدیق باقی ہے')}</p><button className="button-quiet" style={{ padding: 0, minHeight: 26 }} onClick={() => remove(line.slug)} data-testid={`drawer-remove-${line.slug}`}><Trash2 size={12} />{copy(lang, 'Remove', 'ہٹائیں')}</button></div><div className="quantity-controls"><button onClick={() => change(line.slug, -1)} aria-label={copy(lang, 'Decrease quantity', 'تعداد کم کریں')} data-testid={`drawer-decrease-${line.slug}`}><Minus size={12} /></button><span>{line.quantity}</span><button onClick={() => change(line.slug, 1)} aria-label={copy(lang, 'Increase quantity', 'تعداد بڑھائیں')} data-testid={`drawer-increase-${line.slug}`}><Plus size={12} /></button></div></div>;
      }) : <div className="empty-cart"><ShoppingBag size={26} /><h3>{copy(lang, 'A little room for something', 'کچھ شامل کرنے کی جگہ')}</h3><p>{copy(lang, 'Your local demo bag is empty.', 'آپ کا مقامی ڈیمو بیگ خالی ہے۔')}</p><Link href="/products" onClick={close} className="button-outline">{copy(lang, 'Browse samples', 'نمونے دیکھیں')}</Link></div>}
      <div className="cart-drawer-bottom"><p>{copy(lang, 'Prices are not confirmed; nothing here can be purchased.', 'قیمتوں کی تصدیق نہیں ہوئی؛ یہاں سے کچھ خریدا نہیں جا سکتا۔')}</p><Link href="/checkout" onClick={close} className="button-primary">{copy(lang, 'Go to preview checkout', 'چیک آؤٹ پیش منظر پر جائیں')} <ArrowRight size={15} /></Link></div>
    </section>
  </div>;
}

function Footer() {
  const { lang } = useStore();
  return <footer className="footer"><div className="container-wide">
    <div className="footer-main">
      <div><Link href="/" className="brand-mark"><span className="brand-symbol"><Sprout size={20} /></span><span><span className="brand-name">Tib-E-Nabwi</span><span className="brand-subtitle">{copy(lang, 'Botanical goods', 'نباتاتی اشیاء')}</span></span></Link><p>{copy(lang, 'A contemporary neighborhood herbal shop, currently presented as a sample storefront.', 'ایک جدید محلے کی جڑی بوٹیوں کی دکان، فی الحال نمائشی اسٹور کی صورت میں۔')}</p></div>
      <div><h4>{copy(lang, 'Find your way', 'اپنی منزل منتخب کریں')}</h4><div className="footer-links"><Link href="/" data-testid="link-footer-home">{copy(lang, 'Home', 'صفحۂ اول')}</Link><Link href="/products" data-testid="link-footer-products">{copy(lang, 'Sample catalogue', 'نمائشی کیٹلاگ')}</Link><Link href="/checkout" data-testid="link-footer-checkout">{copy(lang, 'Checkout preview', 'چیک آؤٹ کا پیش منظر')}</Link></div></div>
      <div><h4>{copy(lang, 'A note from the shop', 'دکان کی جانب سے ایک نوٹ')}</h4><p>{copy(lang, 'WhatsApp contact', 'واٹس ایپ رابطہ')}: <bdi>{STORE_CONFIG.whatsappNumber}</bdi><br />{copy(lang, 'The number is a placeholder; this preview does not contact anyone.', 'یہ نمبر عارضی ہے؛ یہ پیش منظر کسی سے رابطہ نہیں کرتا۔')}</p></div>
    </div>
    <div className="footer-bottom"><span>{copy(lang, '© Tib-E-Nabwi · storefront preview', '© طبِ نبوی · اسٹور فرنٹ پیش منظر')}</span><span>{copy(lang, 'Illustrative products · no live orders', 'نمائشی مصنوعات · کوئی حقیقی آرڈر نہیں')}</span></div>
  </div></footer>;
}

function MissingPage() {
  const { lang } = useStore();
  return <main id="main-content" className="not-found"><div><span className="eyebrow" style={{ justifyContent: 'center' }}>{copy(lang, 'Not on this shelf', 'اس شیلف پر نہیں')}</span><h1 className="serif" style={{ fontSize: 48, color: '#214636' }}>{copy(lang, 'This page is not here.', 'یہ صفحہ یہاں موجود نہیں۔')}</h1><Link href="/" className="button-primary">{copy(lang, 'Return home', 'صفحۂ اول پر واپس جائیں')} <ArrowRight size={14} /></Link></div></main>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

export default function StoreApp() {
  return <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><App /></WouterRouter>;
}
