import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, ClipboardList, Leaf, Languages, MessageCircle, Minus, PackageOpen, Plus, Search, ShoppingBag, Trash2, X } from 'lucide-react';
import { Link, Route, Switch, useLocation, Router as WouterRouter, useRoute } from 'wouter';
import './index.css';

type Product = { slug: string; name: string; ur: string; price: number; grams: number; photo: string };
type CartLine = { slug: string; quantity: number };
const product: Product = { slug: 'al-mizan', name: 'Al-Mizan Herbal Slim Detox Powder', ur: 'المیزان ہربل پاؤڈر', price: 2500, grams: 200, photo: 'al-mizan-original.jpeg' };
const ingredients = [
  ['Senna leaf', 'سنا کے پتے'], ['Ajwain', 'اجوائن'], ['Kalonji (black seed)', 'کلونجی (کالا دانہ)'], ['Green tea', 'سبز چائے'],
  ['Mint', 'پودینہ'], ['Saunf (fennel)', 'سونف'], ['Ginger', 'ادرک'],
];
const number = '+92 329 7976370';
const waNumber = '923297976370';
const productImages = [
  { file: 'al-mizan-original.jpeg', altEn: 'Original Al-Mizan jar photographed from the front and back', altUr: 'المیزان کے اصل ڈبے کی سامنے اور پیچھے سے لی گئی تصویر', labelEn: 'Original pack', labelUr: 'اصل پیکنگ' },
  { file: 'al-mizan-ingredients.jpg', altEn: 'Decorative still life of powder and botanical ingredients', altUr: 'پاؤڈر اور نباتاتی اجزاء کی آرائشی تصویر', labelEn: 'Botanical still life', labelUr: 'نباتاتی آرائشی تصویر' },
  { file: 'al-mizan-botanicals.jpg', altEn: 'Decorative still life of herbs and seeds', altUr: 'جڑی بوٹیوں اور بیجوں کی آرائشی تصویر', labelEn: 'Herbs & seeds', labelUr: 'جڑی بوٹیاں اور بیج' },
  { file: 'al-mizan-herbs.jpg', altEn: 'Decorative photograph of herbs, seeds and ginger', altUr: 'جڑی بوٹیوں، بیجوں اور ادرک کی آرائشی تصویر', labelEn: 'Ingredient scene', labelUr: 'اجزاء کا منظر' },
];
const productDescription = {
  en: 'Discover Al-Mizan Herbal Slim Detox Powder. This product contains a blend of herbs and botanicals. Please review the complete ingredient list, product directions, and precautions before use.',
  ur: 'المیزان ہربل پاؤڈر جڑی بوٹیوں کے آمیزے سے تیار کیا گیا ہے۔ استعمال سے پہلے اجزاء، طریقۂ استعمال اور احتیاطیں ضرور پڑھیں۔',
};
const beforeUse = {
  en: 'Read the label carefully. Consult a qualified healthcare professional if you have a medical condition, take medication, are pregnant or breastfeeding, or are unsure whether this product is suitable for you.',
  ur: 'لیبل غور سے پڑھیں۔ اگر آپ کو کوئی بیماری ہے، آپ دوا لیتے ہیں، حاملہ ہیں یا بچے کو دودھ پلا رہی ہیں، یا آپ کو یقین نہیں کہ یہ چیز آپ کے لیے مناسب ہے، تو مستند طبی ماہر سے مشورہ کریں۔',
};
const queryClient = new QueryClient();
type Store = { cart: CartLine[]; add: (slug: string) => void; change: (slug: string, delta: number) => void; remove: (slug: string) => void; count: number; openCart: () => void; preview: (src: string) => void };
const StoreContext = createContext<Store | null>(null);
const useStore = () => { const value = useContext(StoreContext); if (!value) throw new Error('Store context is missing'); return value; };
const asset = (name: string) => `${import.meta.env.BASE_URL}images/${name}`;
const money = (amount: number) => `PKR ${amount.toLocaleString('en-PK')}`;
const moneyUr = (amount: number) => `${amount.toLocaleString('en-PK').replace(/\d/g, digit => '۰۱۲۳۴۵۶۷۸۹'[Number(digit)])} پاکستانی روپے`;
function Bi({ en, ur, className = '' }: { en: ReactNode; ur: ReactNode; className?: string }) {
  return <span className={`bilingual ${className}`}><span lang="en" dir="ltr">{en}</span><span lang="ur" dir="rtl" className="urdu">{ur}</span></span>;
}
function Mark() {
  return <svg className="mark-svg" viewBox="0 0 48 48" aria-hidden="true"><path d="M24 6.5c9.66 0 17.5 7.84 17.5 17.5S33.66 41.5 24 41.5 6.5 33.66 6.5 24 14.34 6.5 24 6.5Z" fill="none" stroke="currentColor" strokeWidth="1.2"/><path d="M24 33V21m0 8c-7.3 0-10.8-4.3-10.8-10.1 6.8 0 10.8 3.4 10.8 10.1Zm0-7.5c0-6.6 4-10.2 10.5-10.2 0 5.8-3.6 10.1-10.5 10.2Zm-8.1 3.8 8.1 5.2 8.2-5.2M16.7 36h14.6" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round"/><path d="M14.5 14.8h1.4M33 33.3h1.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>;
}
function Brand({ footer = false }: { footer?: boolean }) {
  return <Link href="/" className={`brand ${footer ? 'brand-footer' : ''}`} aria-label="Tib-E-Nabwi, طبِ نبوی — home" data-testid="link-brand"><span className="brand-emblem"><Mark /></span><span className="brand-type"><strong>Tib-E-Nabwi</strong><span className="brand-tagline">Herbal goods</span><span lang="ur" dir="rtl" className="brand-tagline urdu">ہربل مصنوعات</span></span></Link>;
}
function App() {
  const [location] = useLocation();
  const [cart, setCart] = useState<CartLine[]>(() => { try { return JSON.parse(localStorage.getItem('tn-cart') || '[]') as CartLine[]; } catch { return []; } });
  const [cartOpen, setCartOpen] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const toastTimer = useRef<number | undefined>(undefined);
  useEffect(() => { localStorage.setItem('tn-cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => {
    document.documentElement.lang = 'en';
    document.documentElement.dir = 'ltr';
    const isProduct = location.startsWith('/product/');
    const isCheckout = location === '/checkout';
    const isCollection = location === '/products';
    const title = isProduct ? 'Al-Mizan Herbal Slim Detox Powder | Tib-E-Nabwi' : isCheckout ? 'Order Enquiry | Tib-E-Nabwi' : isCollection ? 'Herbal Collection | Tib-E-Nabwi' : 'Tib-E-Nabwi | Herbal Products';
    const description = isProduct ? 'Al-Mizan Herbal Slim Detox Powder, 200 g, PKR 2,500. Read product details, label-listed ingredients, precautions and WhatsApp contact.' : 'Explore Tib-E-Nabwi herbal products with clear information in English and Urdu and WhatsApp ordering.';
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', title);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', description);
  }, [location]);
  useEffect(() => () => { if (toastTimer.current !== undefined) window.clearTimeout(toastTimer.current); }, []);
  const add = (slug: string) => {
    setCart(current => current.some(line => line.slug === slug) ? current.map(line => line.slug === slug ? { ...line, quantity: line.quantity + 1 } : line) : [...current, { slug, quantity: 1 }]);
    setToastOpen(true);
    if (toastTimer.current !== undefined) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastOpen(false), 3200);
  };
  const change = (slug: string, delta: number) => setCart(current => current.map(line => line.slug === slug ? { ...line, quantity: line.quantity + delta } : line).filter(line => line.quantity > 0));
  const remove = (slug: string) => setCart(current => current.filter(line => line.slug !== slug));
  const count = cart.reduce((sum, line) => sum + line.quantity, 0);
  const ctx = useMemo(() => ({ cart, add, change, remove, count, openCart: () => setCartOpen(true), preview: setPreviewSrc }), [cart, count]);
  return <QueryClientProvider client={queryClient}><TooltipProvider><StoreContext.Provider value={ctx}>
    <div className="site-shell"><a className="skip-link" href="#main-content"><Bi en="Skip to content" ur="مواد پر جائیں" /></a><Header />
      <RoutedErrorBoundary><Switch><Route path="/" component={Home}/><Route path="/products" component={Catalog}/><Route path="/checkout" component={Checkout}/><Route path="/product/:slug" component={ProductDetail}/><Route component={MissingPage}/></Switch></RoutedErrorBoundary>
      <Footer />{cartOpen && <CartDrawer close={() => setCartOpen(false)}/>}
      {previewSrc && <ImagePreview src={previewSrc} close={() => setPreviewSrc(null)}/>}
      {toastOpen && <AddedToast close={() => setToastOpen(false)} openBag={() => { setToastOpen(false); setCartOpen(true); }}/>}
    </div><Toaster/>
  </StoreContext.Provider></TooltipProvider></QueryClientProvider>;
}
function Header() {
  const { count, openCart } = useStore(); const [location] = useLocation();
  const nav = [{ href: '/', en: 'Home', ur: 'ہوم' }, { href: '/products', en: 'Shop', ur: 'مصنوعات' }, { href: '/#brand-story', en: 'Our story', ur: 'ہمارا تعارف' }, { href: '/checkout', en: 'Order', ur: 'آرڈر' }];
  return <div className="header-stack"><div className="topline"><span><Bi en="Contact on WhatsApp to order" ur="آرڈر کے لیے واٹس ایپ پر رابطہ کریں"/></span><a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer"><Bi en="WhatsApp order line" ur="آرڈر کے لیے واٹس ایپ نمبر"/> <bdi>{number}</bdi> <ArrowUpRight size={13}/></a></div><header className="site-header"><div className="container-wide header-main"><Brand/><nav className="nav-links" aria-label="Main navigation"><div className="sr-only">Main navigation — مرکزی نیویگیشن</div>{nav.map(item=><Link key={item.href} href={item.href} className="nav-link" aria-current={location === item.href ? 'page' : undefined} data-testid={`link-nav-${item.href === '/' ? 'home' : item.href === '/products' ? 'products' : item.href === '/checkout' ? 'checkout' : 'story'}`}><Bi en={item.en} ur={item.ur}/></Link>)}</nav><button className="bag-trigger" onClick={openCart} aria-label={`Open bag, shopping bag کھولیں, ${count} items`} data-testid="button-open-cart"><ShoppingBag size={17}/><span><Bi en="Bag" ur="بیگ"/></span><b className="cart-count" data-testid="text-cart-count">{count}</b></button></div></header></div>;
}
function Home() {
  const { add, preview } = useStore();
  return <main id="main-content" data-testid="page-home">
    <section className="store-hero">
      <div className="store-hero-copy">
        <div className="hero-brand-kicker"><span className="hero-brand-seal"><Mark/></span><Bi en="Welcome to Tib-E-Nabwi" ur="طبِ نبوی میں خوش آمدید"/></div>
        <h1><Bi en={<>A thoughtful home<br/>for herbal essentials.</>} ur={<>ہربل مصنوعات کی دکان،<br/>سادہ اور واضح۔</>}/></h1>
        <p className="store-hero-intro"><Bi en="Explore our herbal collection with clear product details in English and Urdu." ur="ہماری ہربل مصنوعات دیکھیں۔ ہر چیز کی معلومات آسان اردو اور انگریزی میں پڑھیں۔"/></p>
        <div className="store-hero-actions">
          <Link href="/products" className="button-primary" data-testid="link-hero-collection"><Bi en="Explore the collection" ur="مصنوعات دیکھیں"/> <ArrowRight size={17}/></Link>
          <a className="button-outline" href={`https://wa.me/${waNumber}?text=${orderMessage([])}`} target="_blank" rel="noreferrer" data-testid="link-hero-whatsapp"><MessageCircle size={17}/><Bi en="Ask on WhatsApp" ur="واٹس ایپ پر پوچھیں"/></a>
        </div>
        <div className="store-hero-note"><Leaf size={15}/><Bi en="Clear details. A simple way to order." ur="واضح معلومات، آرڈر کا آسان طریقہ۔"/></div>
      </div>
      <div className="store-hero-art">
        <img className="store-hero-backdrop" src={asset('al-mizan-botanicals.jpg')} alt="" aria-hidden="true"/>
        <div className="store-hero-overlay"/>
        <div className="hero-art-caption"><span className="hero-art-caption-line"/><Bi en="A herbal collection by Tib-E-Nabwi" ur="طبِ نبوی کی ہربل مصنوعات"/></div>
        <article className="hero-product-card">
          <div className="hero-card-top"><span className="product-kicker"><Bi en="First in the collection" ur="مجموعے کی پہلی مصنوعات"/></span><span className="hero-card-mark"><Mark/></span></div>
          <button className="hero-pack-preview" onClick={()=>preview(asset(product.photo))} aria-label="View the original Al-Mizan pack — المیزان کی اصل پیکنگ دیکھیں" data-testid="image-hero-product"><img src={asset(product.photo)} alt="Original Al-Mizan product package, front and back"/></button>
          <div className="hero-card-details"><h2><Bi en={product.name} ur={product.ur}/></h2><div className="hero-card-meta"><span><Bi en="200 g pack" ur="۲۰۰ گرام پیک"/></span><strong><Bi en={money(product.price)} ur="۲,۵۰۰ پاکستانی روپے"/></strong></div><Link href="/product/al-mizan" className="hero-card-link" data-testid="link-hero-details"><Bi en="View product details" ur="مصنوعات کی تفصیل دیکھیں"/> <ArrowUpRight size={15}/></Link></div>
        </article>
      </div>
    </section>
    <section className="store-values" aria-label="Tib-E-Nabwi store details">
      <div className="container-wide store-values-grid">
        <div className="store-value"><Languages/><Bi en="English and Urdu" ur="انگریزی اور اردو"/></div>
        <div className="store-value"><ClipboardList/><Bi en="Clear product details" ur="مصنوعات کی واضح معلومات"/></div>
        <div className="store-value"><MessageCircle/><Bi en="WhatsApp enquiries" ur="واٹس ایپ پر رابطہ"/></div>
      </div>
    </section>
    <section className="collection-section container-wide" id="collection">
      <div className="collection-heading"><div><span className="eyebrow"><Bi en="The Tib-E-Nabwi collection" ur="طبِ نبوی کی مصنوعات"/></span><h2><Bi en={<>Herbal products,<br/>thoughtfully presented.</>} ur={<>ہربل مصنوعات،<br/>صاف اور آسان انداز میں۔</>}/></h2></div><p><Bi en="Meet Al-Mizan, the first product in the shop. Its ingredients, size, and listed price are shown here without invented ratings or health promises." ur="المیزان دکان کی پہلی مصنوعات ہے۔ اس کے اجزاء، وزن اور قیمت واضح طور پر درج ہیں؛ جعلی جائزے یا صحت سے متعلق دعوے نہیں۔"/></p></div>
      <ProductCard/>
    </section>
    <section className="brand-story" id="brand-story">
      <div className="brand-story-image"><img src={asset('al-mizan-herbs.jpg')} alt="Decorative still life of herbs and seeds" loading="lazy"/><span className="brand-story-label"><Bi en="Botanical still life" ur="نباتاتی آرائشی تصویر"/></span></div>
      <div className="brand-story-copy"><span className="eyebrow"><Bi en="The Tib-E-Nabwi approach" ur="طبِ نبوی کا انداز"/></span><h2><Bi en={<>Good choices start<br/>with clear details.</>} ur={<>بہتر انتخاب کی شروعات<br/>واضح معلومات سے ہوتی ہے۔</>}/></h2><p><Bi en="We want every product page to make the basics easy to find: what the pack says, what it weighs, what it costs, and how to ask a question." ur="ہم چاہتے ہیں کہ ہر صفحے پر ضروری باتیں آسانی سے ملیں: پیک پر کیا لکھا ہے، وزن کتنا ہے، قیمت کیا ہے اور سوال کیسے پوچھنا ہے۔"/></p><Link href="/products" className="button-text" data-testid="link-story-products"><Bi en="Browse the collection" ur="مصنوعات دیکھیں"/> <ArrowRight size={16}/></Link></div>
    </section>
    <section className="review-note container-wide" data-testid="note-no-reviews"><div className="review-seal"><Leaf size={24}/></div><div><span className="eyebrow"><Bi en="Customer feedback" ur="صارفین کی رائے"/></span><h2><Bi en="No verified reviews yet." ur="ابھی تصدیق شدہ جائزے موجود نہیں۔"/></h2><p><Bi en="We’ll publish real customer feedback only after it has been received and approved for display." ur="ہم صرف حقیقی صارفین کی رائے اجازت کے ساتھ یہاں شائع کریں گے۔"/></p></div></section>
    <section className="last-cta"><div className="container-wide last-cta-inner"><div className="cta-mark"><Mark/></div><div><span className="eyebrow"><Bi en="A question about the shop?" ur="دکان کے بارے میں سوال ہے؟"/></span><h2><Bi en={<>Tib-E-Nabwi is<br/>here to help.</>} ur={<>طبِ نبوی سے<br/>رابطہ کریں۔</>}/></h2></div><div className="cta-actions"><Link href="/products" className="button-primary" data-testid="link-final-products"><Bi en="Explore products" ur="مصنوعات دیکھیں"/> <ArrowRight size={16}/></Link><a className="button-outline" href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer" data-testid="link-whatsapp-direct"><Bi en="WhatsApp" ur="واٹس ایپ"/> <bdi>{number}</bdi></a></div></div></section>
  </main>;
}
function ProductCard() {
  const { add, preview }=useStore();
  return <article className="catalog-product" data-testid={`card-product-${product.slug}`}>
    <button className="catalog-image" aria-label="Preview original Al-Mizan pack — المیزان کی اصل پیکنگ دیکھیں" onClick={()=>preview(asset(product.photo))} data-testid="button-preview-product-card"><img src={asset(product.photo)} alt="Original Al-Mizan package, photographed from the front and back"/><span className="catalog-image-caption"><Bi en="Original product photo" ur="مصنوعات کی اصل تصویر"/></span></button>
    <div className="catalog-card-copy"><span className="eyebrow"><Bi en="HERBAL POWDER · 200 G" ur="ہربل پاؤڈر · ۲۰۰ گرام"/></span><h2><Bi en={product.name} ur={product.ur}/></h2><p><Bi en="A blend of herbs and botanicals. Review the full ingredients and precautions before use." ur="جڑی بوٹیوں کا آمیزہ۔ استعمال سے پہلے اجزاء اور احتیاطیں پڑھیں۔"/></p><div className="catalog-card-facts"><span><Bi en="Net weight" ur="خالص وزن"/></span><strong>200 g</strong></div><div className="catalog-bottom"><strong className="catalog-price"><Bi en={money(product.price)} ur="۲,۵۰۰ پاکستانی روپے"/></strong><button className="button-primary" onClick={()=>add(product.slug)} data-testid={`button-add-${product.slug}`}><Bi en="Add to bag" ur="بیگ میں شامل کریں"/> <Plus size={15}/></button></div><Link href="/product/al-mizan" className="catalog-detail-link" data-testid="link-product-al-mizan"><Bi en="Full product details" ur="مصنوعات کی مکمل معلومات"/> <ArrowRight size={14}/></Link></div>
  </article>;
}
function Catalog() {
  const [search,setSearch]=useState('');
  const found=`${product.name} ${product.ur} herbal powder`.toLowerCase().includes(search.toLowerCase());
  return <main id="main-content" data-testid="page-products"><section className="catalog-hero"><div className="container-wide"><span className="eyebrow"><Bi en="Shop Tib-E-Nabwi" ur="طبِ نبوی کی مصنوعات"/></span><h1><Bi en="Explore the collection." ur="مصنوعات دیکھیں۔"/></h1><p><Bi en="Browse the products currently listed by Tib-E-Nabwi. Al-Mizan is the first product in the collection." ur="طبِ نبوی میں درج مصنوعات دیکھیں۔ المیزان اس مجموعے کی پہلی مصنوعات ہے۔"/></p></div></section><section className="container-wide catalog-main"><div className="catalog-toolbar"><div><span className="eyebrow"><Bi en="The collection" ur="مجموعہ"/></span><p><Bi en="1 listed product" ur="ایک مصنوعات"/></p></div><label className="search-field"><Search size={16}/><span className="search-label"><Bi en="Search products" ur="مصنوعات تلاش کریں"/></span><input aria-label="Search products — مصنوعات تلاش کریں" placeholder="Al-Mizan" value={search} onChange={e=>setSearch(e.target.value)} data-testid="input-product-search"/></label></div>{found?<ProductCard/>:<div className="empty-cart catalog-empty"><PackageOpen size={28}/><h2><Bi en="No match found." ur="نتیجہ نہیں ملا۔"/></h2><p><Bi en="Try another search term." ur="کوئی دوسرا لفظ لکھ کر دیکھیں۔"/></p><button className="button-outline" onClick={()=>setSearch('')} data-testid="button-clear-search"><Bi en="Clear search" ur="تلاش صاف کریں"/></button></div>}</section></main>;
}
function ProductGallery() {
  const { preview } = useStore();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = productImages[selectedIndex];
  return <div className="product-gallery" data-testid="product-gallery">
    <button className="gallery-main" onClick={()=>preview(asset(selected.file))} aria-label={`Enlarge image: ${selected.altEn} — تصویر بڑی کر کے دیکھیں`} data-testid="button-gallery-main">
      <img src={asset(selected.file)} alt={selected.altEn} />
      <span className="gallery-zoom"><ArrowUpRight size={16}/></span>
    </button>
    <div className="gallery-thumbnails" role="group" aria-label="Product image choices — مصنوعات کی تصویریں">
      {productImages.map((image,index)=><button type="button" key={image.file} className={`gallery-thumbnail ${selectedIndex===index?'is-selected':''}`} onClick={()=>setSelectedIndex(index)} aria-label={`${image.labelEn} — ${image.labelUr}`} aria-pressed={selectedIndex===index} data-testid={`button-gallery-image-${index}`}>
        <img src={asset(image.file)} alt="" loading="lazy"/>
      </button>)}
    </div>
    <div className="gallery-caption"><Bi en={selected.labelEn} ur={selected.labelUr}/></div>
    {selectedIndex===0 && <p className="packaging-disclosure"><Bi en="The supplied package photo is shown as provided. Statements printed on the package are not independently verified by this store." ur="فراہم کردہ پیکنگ کی تصویر جوں کی توں دکھائی گئی ہے۔ اس پر درج دعووں کی دکان نے الگ سے تصدیق نہیں کی۔"/></p>}
    {selectedIndex!==0 && <p className="packaging-disclosure"><Bi en="This is a decorative ingredient photograph, not a verified image of the product contents." ur="یہ اجزاء کی آرائشی تصویر ہے؛ یہ پیک کے اندر موجود چیزوں کی تصدیق نہیں کرتی۔"/></p>}
  </div>;
}
function ProductDetail() {
  const { add }=useStore(); const [,params]=useRoute('/product/:slug');
  if(params?.slug !== product.slug) return <MissingPage/>;
  return <main id="main-content" data-testid="page-product-detail">
    <div className="detail-breadcrumb container-wide"><Link href="/products"><ArrowLeft size={14}/><Bi en="Back to the collection" ur="مجموعے پر واپس جائیں"/></Link></div>
    <section className="product-detail container-wide">
      <ProductGallery/>
      <div className="detail-purchase"><span className="eyebrow"><Bi en="From the Tib-E-Nabwi collection" ur="طبِ نبوی کی مصنوعات میں سے"/></span><h1><Bi en={product.name} ur={product.ur}/></h1><p className="detail-deck"><Bi en="Herbal powder · Net weight 200 g" ur="ہربل پاؤڈر · خالص وزن ۲۰۰ گرام"/></p><div className="detail-price"><strong><Bi en={money(product.price)} ur="۲,۵۰۰ پاکستانی روپے"/></strong><span><Bi en="Price supplied by the shop" ur="دکاندار کی درج کردہ قیمت"/></span></div><p className="product-description"><Bi en={productDescription.en} ur={productDescription.ur}/></p><button className="button-primary add-wide" onClick={()=>add(product.slug)} data-testid="button-add-detail-al-mizan"><Bi en="Add to bag" ur="بیگ میں شامل کریں"/> <ShoppingBag size={17}/></button><p className="handoff-note"><Bi en="Your bag stays in this browser. WhatsApp opens a draft for you to review and send." ur="آپ کا بیگ اسی براؤزر میں رہے گا۔ واٹس ایپ کا مسودہ دیکھ کر خود بھیجیں۔"/></p><a className="detail-wa" href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer"><Bi en="Customer support" ur="صارفین کے لیے رابطہ"/> <bdi>{number}</bdi> <ArrowUpRight size={14}/></a></div>
    </section>
    <section className="product-information container-wide" data-testid="product-information"><div className="product-info-heading"><span className="eyebrow"><Bi en="Product details" ur="مصنوعات کی معلومات"/></span><h2><Bi en="What you should know." ur="ضروری معلومات۔"/></h2><p><Bi en="The ingredient names and manufacturer below are transcribed from the supplied product label." ur="اجزاء اور کمپنی کے نام فراہم کردہ پیکنگ کے لیبل سے نقل کیے گئے ہیں۔"/></p></div>
      <dl className="product-facts">
        <div><dt><Bi en="Net weight" ur="خالص وزن"/></dt><dd><Bi en="200 g" ur="۲۰۰ گرام"/></dd></div>
        <div><dt><Bi en="Ingredients (as listed on the label)" ur="لیبل پر درج اجزاء"/></dt><dd><Bi en="Senna leaf, ajwain, kalonji (black seed), green tea, mint, saunf (fennel), and ginger. The list is transcribed from the supplied label and has not been independently verified." ur="سنا کے پتے، اجوائن، کلونجی، سبز چائے، پودینہ، سونف اور ادرک۔ یہ فہرست فراہم کردہ لیبل سے نقل کی گئی ہے؛ الگ سے تصدیق نہیں کی گئی۔"/></dd></div>
        <div><dt><Bi en="Directions" ur="طریقۂ استعمال"/></dt><dd><Bi en="Follow the directions printed on the product label. The store has not independently reviewed them; contact the manufacturer if they are unclear." ur="پیک پر درج طریقۂ استعمال پر عمل کریں۔ دکان نے اس کی الگ سے طبی جانچ نہیں کی؛ ہدایات واضح نہ ہوں تو کمپنی سے پوچھیں۔"/></dd></div>
        <div><dt><Bi en="Storage" ur="محفوظ رکھنے کا طریقہ"/></dt><dd><Bi en="Storage instructions are not visible in the supplied package photo. Please confirm them with the manufacturer." ur="فراہم کردہ تصویر میں محفوظ رکھنے کی ہدایات نظر نہیں آتیں۔ براہِ کرم کمپنی سے تصدیق کریں۔"/></dd></div>
        <div><dt><Bi en="Manufacturer" ur="کمپنی"/></dt><dd><Bi en="Tib-E-Nabwi Dawakhana.store, Pakistan (as printed on the package)." ur="طبِ نبوی دواخانہ اسٹور، پاکستان (پیکنگ پر درج نام)۔"/></dd></div>
        <div><dt><Bi en="Customer support" ur="صارفین کے لیے رابطہ"/></dt><dd><a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer"><bdi>{number}</bdi> <Bi en="Contact on WhatsApp" ur="واٹس ایپ پر رابطہ کریں"/></a></dd></div>
      </dl>
    </section>
    <section className="before-use container-wide" data-testid="before-use-note"><div className="before-use-icon"><ClipboardList size={22}/></div><div><span className="eyebrow"><Bi en="Before use" ur="استعمال سے پہلے"/></span><p><Bi en={beforeUse.en} ur={beforeUse.ur}/></p></div></section>
    <section className="product-image-note container-wide"><Leaf size={17}/><p><Bi en="Product name and package imagery are shown as supplied. Claims printed on the package are not independently verified by this store." ur="مصنوعات کا نام اور پیکنگ کی تصویر فراہم کردہ مواد کے مطابق ہے۔ پیک پر درج دعووں کی دکان نے الگ سے تصدیق نہیں کی۔"/></p></section>
  </main>;
}
function getTotal(cart:CartLine[]) { return cart.reduce((sum,line)=>sum+line.quantity*product.price,0); }
function orderMessage(cart:CartLine[]) {
  const quantity=cart.find(line=>line.slug===product.slug)?.quantity ?? 0;
  const en=quantity ? `Hello Tib-E-Nabwi, I would like to enquire about:\n${product.name} — ${quantity} × ${money(product.price)} = ${money(quantity*product.price)}\nPlease confirm the details with me. This is an enquiry, not a placed order.` : 'Hello Tib-E-Nabwi, I would like to ask about Al-Mizan Herbal Slim Detox Powder.';
  const ur=quantity ? `السلام علیکم طبِ نبوی، میں اس مصنوعات کے بارے میں پوچھنا چاہتا/چاہتی ہوں:\n${product.ur} — ${quantity} × ${moneyUr(product.price)} = ${moneyUr(quantity*product.price)}\nبراہِ کرم تفصیل بتا دیں۔ یہ صرف سوال ہے، مکمل آرڈر نہیں۔` : 'السلام علیکم طبِ نبوی، میں المیزان ہربل پاؤڈر کے بارے میں پوچھنا چاہتا/چاہتی ہوں۔';
  return encodeURIComponent(`${en}\n\n${ur}`);
}
function Checkout() {
  const {cart,change,remove}=useStore(); const quantity=cart.reduce((sum,line)=>sum+line.quantity,0); const total=getTotal(cart);
  return <main id="main-content" data-testid="page-checkout"><section className="order-hero"><div className="container-wide"><span className="eyebrow"><Bi en="Order enquiry" ur="آرڈر کی تفصیل"/></span><h1><Bi en="Review your bag." ur="اپنا بیگ دیکھیں۔"/></h1><p><Bi en="No address or personal details are needed here. Your WhatsApp draft is yours to review and send." ur="یہاں پتے یا ذاتی معلومات کی ضرورت نہیں۔ واٹس ایپ کا مسودہ آپ دیکھ کر خود بھیجیں گے۔"/></p></div></section><section className="container-wide order-layout"><div className="order-items"><div className="order-section-head"><span className="eyebrow"><Bi en="Your selection" ur="آپ کا انتخاب"/></span><span className="item-count"><Bi en={`${quantity} ${quantity===1?'item':'items'}`} ur={`${quantity} اشیاء`}/></span></div>{cart.length?cart.map(line=><div className="order-line" key={line.slug} data-testid={`row-order-${line.slug}`}><img src={asset(product.photo)} alt="Original Al-Mizan pack"/><div className="order-line-info"><h2><Bi en={product.name} ur={product.ur}/></h2><p><Bi en={`200 g · ${money(product.price)} each`} ur={`۲۰۰ گرام · فی عدد ۲,۵۰۰ پاکستانی روپے`}/></p><button onClick={()=>remove(line.slug)} className="remove-link" data-testid={`button-remove-${line.slug}`}><Trash2 size={13}/><Bi en="Remove" ur="ہٹائیں"/></button></div><div className="order-line-end"><strong>{money(line.quantity*product.price)}</strong><div className="quantity-controls"><button onClick={()=>change(line.slug,-1)} aria-label="Decrease quantity — تعداد کم کریں" data-testid={`button-decrease-${line.slug}`}><Minus size={13}/></button><span data-testid={`text-quantity-${line.slug}`}>{line.quantity}</span><button onClick={()=>change(line.slug,1)} aria-label="Increase quantity — تعداد بڑھائیں" data-testid={`button-increase-${line.slug}`}><Plus size={13}/></button></div></div></div>):<div className="empty-cart order-empty" data-testid="empty-cart"><ShoppingBag size={27}/><h2><Bi en="Your bag is empty." ur="آپ کا بیگ خالی ہے۔"/></h2><p><Bi en="Start with the one product in our collection." ur="ہمارے مجموعے کی واحد مصنوعات سے آغاز کریں۔"/></p><Link href="/products" className="button-outline" data-testid="link-empty-products"><Bi en="Explore Al-Mizan" ur="المیزان دیکھیں"/> <ArrowRight size={15}/></Link></div>}
    </div><aside className="order-summary"><span className="eyebrow"><Bi en="A clear total" ur="واضح مجموعہ"/></span><h2><Bi en="Order summary" ur="آرڈر کا خلاصہ"/></h2><div className="summary-metric"><span><Bi en="Items" ur="اشیاء"/></span><strong>{quantity}</strong></div><div className="summary-metric"><span><Bi en="Product subtotal" ur="مصنوعات کا ذیلی کل"/></span><strong data-testid="text-order-subtotal">{money(total)}</strong></div><div className="summary-total"><span><Bi en="Listed total" ur="درج شدہ کل"/></span><strong data-testid="text-order-total">{money(total)}</strong></div><p className="summary-disclaimer"><Bi en="This is a price total for the listed product only. No delivery charge or policy is specified." ur="یہ صرف درج شدہ مصنوعات کی قیمت کا مجموعہ ہے۔ ڈیلیوری چارج یا پالیسی درج نہیں۔"/></p><a className={`button-primary whatsapp-button ${cart.length?'':'is-disabled'}`} href={cart.length?`https://wa.me/${waNumber}?text=${orderMessage(cart)}`:undefined} target="_blank" rel="noreferrer" aria-disabled={!cart.length} onClick={event=>{if(!cart.length)event.preventDefault();}} data-testid="button-whatsapp-order"><Bi en="Review draft in WhatsApp" ur="واٹس ایپ میں مسودہ دیکھیں"/> <ArrowUpRight size={16}/></a><p className="handoff-note"><Bi en="WhatsApp opens with a draft. Review and send it yourself. No order is placed or stored until you send." ur="واٹس ایپ میں مسودہ کھلے گا۔ اسے دیکھ کر خود بھیجیں۔ بھیجنے سے پہلے کوئی آرڈر نہیں بنتا یا محفوظ ہوتا۔"/></p></aside></section></main>;
}
function CartDrawer({close}:{close:()=>void}) {
  const {cart,change,remove}=useStore(); const total=getTotal(cart);
  useEffect(()=>{const onKey=(event:KeyboardEvent)=>{if(event.key==='Escape')close();};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey);},[close]);
  return <div className="modal-scrim" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)close();}}><section className="bag-drawer" role="dialog" aria-modal="true" aria-labelledby="bag-title" data-testid="panel-cart"><div className="drawer-head"><div><span className="eyebrow"><Bi en="Your selection" ur="آپ کا انتخاب"/></span><h2 id="bag-title"><Bi en="The bag" ur="بیگ"/></h2></div><button className="close-button" onClick={close} autoFocus aria-label="Close bag — بیگ بند کریں" data-testid="button-close-cart"><X size={19}/></button></div><p className="drawer-sub"><Bi en="Saved in this browser. Nothing is ordered yet." ur="اسی براؤزر میں محفوظ ہے۔ ابھی کوئی آرڈر نہیں ہوا۔"/></p>{cart.length?cart.map(line=><div className="drawer-item" key={line.slug}><img src={asset(product.photo)} alt="Al-Mizan original pack"/><div className="drawer-item-copy"><h3><Bi en={product.name} ur={product.ur}/></h3><p><Bi en={`200 g · ${money(product.price)}`} ur={`۲۰۰ گرام · ۲,۵۰۰ پاکستانی روپے`}/></p><button className="remove-link" onClick={()=>remove(line.slug)} data-testid={`drawer-remove-${line.slug}`}><Trash2 size={13}/><Bi en="Remove" ur="ہٹائیں"/></button></div><div className="drawer-controls"><strong>{money(line.quantity*product.price)}</strong><div className="quantity-controls"><button onClick={()=>change(line.slug,-1)} aria-label="Decrease quantity — تعداد کم کریں" data-testid={`drawer-decrease-${line.slug}`}><Minus size={12}/></button><span>{line.quantity}</span><button onClick={()=>change(line.slug,1)} aria-label="Increase quantity — تعداد بڑھائیں" data-testid={`drawer-increase-${line.slug}`}><Plus size={12}/></button></div></div></div>):<div className="empty-cart drawer-empty"><ShoppingBag size={28}/><h3><Bi en="A little space, for now." ur="فی الحال بیگ خالی ہے۔"/></h3><p><Bi en="Explore the product and add it when you are ready." ur="مصنوعات دیکھیں اور تیار ہونے پر بیگ میں شامل کریں۔"/></p><Link href="/products" className="button-outline" onClick={close} data-testid="link-drawer-products"><Bi en="Explore product" ur="مصنوعات دیکھیں"/></Link></div>}<div className="drawer-bottom"><div className="drawer-total"><span><Bi en="Listed total" ur="درج شدہ کل"/></span><strong>{money(total)}</strong></div><p><Bi en="Delivery charges and policies are not specified." ur="ڈیلیوری چارجز اور پالیسیاں درج نہیں ہیں۔"/></p><Link href="/checkout" onClick={close} className={`button-primary drawer-continue ${cart.length?'':'is-disabled'}`} data-testid="link-drawer-checkout"><Bi en="Review order enquiry" ur="آرڈر کی تفصیل دیکھیں"/> <ArrowRight size={16}/></Link></div></section></div>;
}
function AddedToast({close,openBag}:{close:()=>void;openBag:()=>void}) {
  return <aside className="added-toast" role="status" aria-live="polite" data-testid="toast-added">
    <span className="added-toast-check"><Check size={18}/></span>
    <div className="added-toast-copy"><strong><Bi en="Added to your bag" ur="بیگ میں شامل ہو گیا"/></strong><p><Bi en="Saved in this browser. No order has been placed." ur="اسی براؤزر میں محفوظ ہے۔ ابھی آرڈر نہیں ہوا۔"/></p><button onClick={openBag} className="added-toast-link" data-testid="button-toast-view-bag"><Bi en="View bag" ur="بیگ دیکھیں"/> <ArrowUpRight size={13}/></button></div>
    <button className="close-button toast-close" onClick={close} aria-label="Dismiss notice — اطلاع بند کریں" data-testid="button-dismiss-toast"><X size={15}/></button>
  </aside>;
}
function ImagePreview({src,close}:{src:string;close:()=>void}) {
  useEffect(()=>{const onKey=(event:KeyboardEvent)=>{if(event.key==='Escape')close();};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey);},[close]);
  const selected=productImages.find(image=>asset(image.file)===src) ?? productImages[0];
  return <div className="image-modal" role="presentation" onMouseDown={event=>{if(event.currentTarget===event.target)close();}}><section role="dialog" aria-modal="true" aria-label={`${selected.labelEn} — ${selected.labelUr}`} className="image-modal-box" data-testid="dialog-image-preview"><button className="close-button image-close" onClick={close} autoFocus aria-label="Close image — تصویر بند کریں" data-testid="button-close-image"><X size={19}/></button><img src={src} alt={selected.altEn}/><p><Bi en={selected.labelEn} ur={selected.labelUr}/></p>{selected.file===product.photo && <p className="packaging-disclosure"><Bi en="Package claims are shown as printed and are not independently verified by this store." ur="پیک پر درج دعوے جوں کے توں ہیں؛ دکان نے ان کی الگ سے تصدیق نہیں کی۔"/></p>}</section></div>;
}
function Footer() {
  return <footer className="footer"><div className="container-wide footer-main"><div><Brand footer/><p><Bi en="Tib-E-Nabwi is a herbal-products store. Find product information in English and Urdu, then contact us with questions." ur="طبِ نبوی ہربل مصنوعات کی دکان ہے۔ معلومات اردو اور انگریزی میں پڑھیں اور سوال ہو تو رابطہ کریں۔"/></p></div><div className="footer-nav"><span className="eyebrow"><Bi en="Explore" ur="دیکھیں"/></span><Link href="/products" data-testid="link-footer-products"><Bi en="The collection" ur="مصنوعات"/></Link><Link href="/checkout" data-testid="link-footer-checkout"><Bi en="Order enquiry" ur="آرڈر کی تفصیل"/></Link></div><div className="footer-contact"><span className="eyebrow"><Bi en="WhatsApp contact" ur="واٹس ایپ رابطہ"/></span><a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer"><bdi>{number}</bdi> <ArrowUpRight size={14}/></a><p><Bi en="WhatsApp opens a draft for you to review and send." ur="واٹس ایپ میں مسودہ کھلے گا؛ اسے دیکھ کر خود بھیجیں۔"/></p></div></div><div className="container-wide footer-bottom"><span><Bi en="© Tib-E-Nabwi" ur="© طبِ نبوی"/></span><span><Bi en="Clear product details. No invented reviews or figures." ur="مصنوعات کی واضح معلومات؛ بغیر جعلی جائزوں اور اعداد کے۔"/></span></div></footer>;
}
function MissingPage() {
  return <main className="not-found" id="main-content" data-testid="page-not-found"><span className="eyebrow"><Bi en="A small detour" ur="ایک چھوٹا سا موڑ"/></span><h1><Bi en="This page isn't on the shelf." ur="یہ صفحہ شیلف پر موجود نہیں۔"/></h1><Link href="/" className="button-primary" data-testid="link-not-found-home"><Bi en="Return to the beginning" ur="صفحۂ اول پر واپس جائیں"/> <ArrowRight size={15}/></Link></main>;
}
function RoutedErrorBoundary({children}:{children:ReactNode}) {
  const [location]=useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}
export default function StoreApp() {
  return <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/,'')}><App/></WouterRouter>;
}
