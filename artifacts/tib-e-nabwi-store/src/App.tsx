import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ErrorBoundary } from '@/components/error-boundary';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { CustomerReviews } from '@/components/storefront/CustomerReviews';
import { HomepageTrustStats } from '@/components/storefront/HomepageTrustStats';
import { TrustCertificateConcept } from '@/components/storefront/TrustCertificateConcept';
import './components/storefront/storefront-sections.css';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, ClipboardList, Leaf, Languages, MessageCircle, Minus, PackageOpen, Plus, Search, ShoppingBag, Trash2, X } from 'lucide-react';
import { Link, Route, Switch, useLocation, Router as WouterRouter, useRoute } from 'wouter';
import './index.css';
import { client } from "./shopifyClient";

type Product = { slug: string; name: string; ur: string; price: number; grams: number; photo: string };
type CartLine = { slug: string; quantity: number };
const showDevelopmentPreview = import.meta.env.DEV;
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
const checkoutSchema = z.object({
  name: z.string().trim().min(1, 'Please enter your name. — براہِ کرم اپنا نام درج کریں۔'),
  phone: z.string().trim().min(1, 'Please enter your phone number. — براہِ کرم اپنا فون نمبر درج کریں۔').refine(value => {
    const digits = value.replace(/\D/g, '').length;
    return digits >= 7 && digits <= 15;
  }, 'Enter a valid phone number. — درست فون نمبر درج کریں۔'),
  city: z.string().trim().min(1, 'Please enter your city. — براہِ کرم اپنا شہر درج کریں۔'),
  address: z.string().trim().min(1, 'Please enter your complete address. — براہِ کرم اپنا مکمل پتہ درج کریں۔'),
  note: z.string(),
});
type CheckoutFormValues = z.infer<typeof checkoutSchema>;
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
  return <svg className="mark-svg" viewBox="0 0 64 64" aria-hidden="true">
    <circle cx="32" cy="32" r="27" fill="none" stroke="#d8b35d" strokeWidth="1.7"/>
    <path d="M32 49V21" fill="none" stroke="currentColor" strokeWidth="2.7" strokeLinecap="round"/>
    <path d="M31.7 37c-9.2 0-14-4.9-14-11.8 8.4 0 13.7 4.3 14 11.8Z" fill="currentColor"/>
    <path d="M32.3 30.4c0-8 5-12.5 12.2-12.5 0 7.4-4.5 12.4-12.2 12.5Z" fill="#e1bd66"/>
    <path d="M31.8 44.3c-7.3 0-10.9-3.9-10.9-9.2 6.6 0 10.7 3.3 10.9 9.2Z" fill="#e1bd66"/>
    <path d="M32.2 39.9c0-6.1 3.9-9.6 9.5-9.6 0 5.8-3.5 9.5-9.5 9.6Z" fill="currentColor"/>
    <path d="m24 47 8 4 8-4" fill="none" stroke="#e1bd66" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>;
}
function Brand({ footer = false }: { footer?: boolean }) {
  return <Link href="/" className={`brand ${footer ? 'brand-footer' : ''}`} aria-label="Tib-E-Nabwi, طبِ نبوی — home" data-testid="link-brand"><span className="brand-emblem"><Mark /></span><span className="brand-type"><strong>Tib-E-Nabwi</strong><span className="brand-tagline">Herbal goods</span><span lang="ur" dir="rtl" className="brand-tagline urdu">ہربل مصنوعات</span></span></Link>;
}
function App() {
  // inside function App() { ... }
useEffect(() => {
  client
    .request(`{ shop { name } products(first: 3) { edges { node { title } } } }`)
    .then((res) => console.log("Shopify says:", res))
    .catch((err) => console.error("Shopify error:", err));
  }, []);
  const [location] = useLocation();
  const [cart, setCart] = useState<CartLine[]>(() => { try { return JSON.parse(localStorage.getItem('tn-cart') || '[]') as CartLine[]; } catch { return []; } });
  const [cartOpen, setCartOpen] = useState(false);
  const [storyOpen, setStoryOpen] = useState(false);
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
     <div className="site-shell"><Header openStory={() => setStoryOpen(true)} />
     <RoutedErrorBoundary><Switch><Route path="/" component={Home}/><Route path="/products" component={Catalog}/><Route path="/checkout" component={CheckoutFlow}/><Route path="/product/:slug" component={ProductDetail}/><Route component={MissingPage}/></Switch></RoutedErrorBoundary>
      <Footer />{cartOpen && <CartDrawer close={() => setCartOpen(false)}/>}
      {previewSrc && <ImagePreview src={previewSrc} close={() => setPreviewSrc(null)}/>}
      {toastOpen && <AddedToast close={() => setToastOpen(false)} openBag={() => { setToastOpen(false); setCartOpen(true); }}/>}
       <StoryDialog open={storyOpen} onOpenChange={setStoryOpen} />
    </div><Toaster/>
  </StoreContext.Provider></TooltipProvider></QueryClientProvider>;
}
function Header({ openStory }: { openStory: () => void }) {
  const { count, openCart } = useStore(); const [location] = useLocation();
  const nav = [{ href: '/', en: 'Home', ur: 'ہوم' }, { href: '/products', en: 'Shop', ur: 'مصنوعات' }, { href: '/checkout', en: 'Order', ur: 'آرڈر' }];
  return <div className="header-stack"><div className="topline"><a className="topline-order" href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer" data-testid="link-header-whatsapp"><MessageCircle size={22} aria-hidden="true"/><span><strong><Bi en="Order easily on WhatsApp" ur="واٹس ایپ پر آسانی سے آرڈر کریں"/></strong><small><bdi dir="ltr">{number}</bdi></small></span><ArrowUpRight size={18} aria-hidden="true"/></a></div><header className="site-header"><div className="container-wide header-main"><Brand/><nav className="nav-links" aria-label="Main navigation">{nav.slice(0, 2).map(item=><Link key={item.href} href={item.href} className="nav-link" aria-current={location === item.href ? 'page' : undefined} data-testid={`link-nav-${item.href === '/' ? 'home' : 'products'}`}><Bi en={item.en} ur={item.ur}/></Link>)}<button type="button" className="nav-link nav-story-trigger" onClick={openStory} aria-haspopup="dialog" data-testid="button-nav-story"><Bi en="Our Story" ur="ہماری کہانی"/></button><Link href="/checkout" className="nav-link" aria-current={location === '/checkout' ? 'page' : undefined} data-testid="link-nav-checkout"><Bi en="Order" ur="آرڈر"/></Link></nav><button className="bag-trigger" onClick={openCart} aria-label={`Open bag, shopping bag کھولیں, ${count} items`} data-testid="button-open-cart"><ShoppingBag size={17}/><span><Bi en="Bag" ur="بیگ"/></span><b className="cart-count" data-testid="text-cart-count">{count}</b></button></div></header></div>;
}
function StoryDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="story-dialog" aria-describedby="story-dialog-copy">
        <div className="story-dialog-brand"><span><Mark /></span><small>TIB-E-NABWI DAWAKHANA.STORE</small></div>
        <DialogTitle className="story-dialog-title">Our Story <span lang="ur" dir="rtl">ہماری کہانی</span></DialogTitle>
        <DialogDescription id="story-dialog-copy" className="story-dialog-copy">
          <span lang="en" dir="ltr">Welcome to Tib-E-Nabwi Dawakhana.store — a brand inspired by the rich heritage of traditional herbal wellness and the value of caring for yourself naturally. Our aim is to bring you thoughtfully presented herbal products while making your shopping experience simple, convenient, and trustworthy. We believe that wellness begins with informed choices, quality-focused service, and a balanced lifestyle. Every customer matters to us, and we are committed to serving you with honesty, care, and respect. Thank you for being part of our journey!</span>
          <span lang="ur" dir="rtl">Tib-E-Nabwi Dawakhana.store میں خوش آمدید! ہمارا مقصد روایتی جڑی بوٹیوں سے متعلق علم اور قدرتی طرزِ زندگی کی اہمیت سے متاثر ہو کر آپ تک معیاری انداز میں پیش کی گئی ہربل مصنوعات پہنچانا ہے۔ ہم چاہتے ہیں کہ آپ کو خریداری کا ایک آسان، سہل اور قابلِ اعتماد تجربہ حاصل ہو۔ ہمارا یقین ہے کہ بہتر طرزِ زندگی کے لیے درست معلومات، احتیاط اور متوازن معمولات اہم ہیں۔ ہمارے لیے ہر گاہک قابلِ قدر ہے، اور ہم ایمانداری، توجہ اور احترام کے ساتھ آپ کی خدمت کرنے کی کوشش کرتے ہیں۔ ہماری اس کاوش کا حصہ بننے پر آپ کا شکریہ!</span>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
function Home() {
  const { add, preview } = useStore(); const [,setLocation]=useLocation();
  return <main id="main-content" data-testid="page-home">
    <section className="store-hero">
      <div className="store-hero-copy">
        <div className="hero-brand-kicker"><span className="hero-brand-seal"><Mark/></span><Bi en="Welcome to Tib-E-Nabwi" ur="طبِ نبوی میں خوش آمدید"/></div>
        <h1><Bi en={<>A thoughtful home<br/>for herbal essentials.</>} ur={<>ہربل مصنوعات کی دکان،<br/>سادہ اور واضح۔</>}/></h1>
        <p className="store-hero-intro"><Bi en="Explore our herbal collection with clear product details in English and Urdu." ur="ہماری ہربل مصنوعات دیکھیں۔ ہر چیز کی معلومات آسان اردو اور انگریزی میں پڑھیں۔"/></p>
        <div className="store-hero-actions">
          <Link href="/products" className="button-primary" data-testid="link-hero-collection"><Bi en="See products & order" ur="مصنوعات دیکھیں اور آرڈر کریں"/> <ArrowRight size={17}/></Link>
        </div>
        <div className="store-hero-note"><Leaf size={15}/><Bi en="Clear details. A simple way to order." ur="واضح معلومات، آرڈر کا آسان طریقہ۔"/></div>
        <a className="whatsapp-order-headline" href={`https://wa.me/${waNumber}?text=${orderMessage([])}`} target="_blank" rel="noreferrer" data-testid="link-animated-whatsapp-order"><span className="wa-orbit" aria-hidden="true"><MessageCircle size={21}/></span><span><strong><Bi en="Order by WhatsApp" ur="واٹس ایپ پر آرڈر کریں"/></strong><small><Bi en="Call or message us" ur="ہمیں کال یا میسج کریں"/></small><bdi>{number}</bdi></span><ArrowUpRight size={18}/></a>
      </div>
      <div className="store-hero-art">
        <img className="store-hero-backdrop" src={asset('al-mizan-botanicals.jpg')} alt="" aria-hidden="true"/>
        <div className="store-hero-overlay"/>
        <div className="hero-art-caption"><span className="hero-art-caption-line"/><Bi en="A herbal collection by Tib-E-Nabwi" ur="طبِ نبوی کی ہربل مصنوعات"/></div>
        <article className="hero-product-card">
          <div className="hero-card-top"><span className="product-kicker"><Bi en="First in the collection" ur="مجموعے کی پہلی مصنوعات"/></span><span className="hero-card-mark"><Mark/></span></div>
          <button className="hero-pack-preview" onClick={()=>preview(asset(product.photo))} aria-label="View the original Al-Mizan pack — المیزان کی اصل پیکنگ دیکھیں" data-testid="image-hero-product"><img src={asset(product.photo)} alt="Original Al-Mizan product package, front and back"/></button>
          <button className="button-primary hero-card-add" onClick={()=>{add(product.slug);setLocation('/checkout');}} data-testid="button-add-home-al-mizan"><Bi en="Add to Cart" ur="آرڈر میں شامل کریں"/> <ShoppingBag size={17}/></button>
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
    <HomepageTrustStats previewMode={showDevelopmentPreview} />
    {showDevelopmentPreview && <TrustCertificateConcept />}
    <section className="collection-section container-wide" id="collection">
      <div className="collection-heading"><div><span className="eyebrow"><Bi en="The Tib-E-Nabwi collection" ur="طبِ نبوی کی مصنوعات"/></span><h2><Bi en={<>Herbal products,<br/>thoughtfully presented.</>} ur={<>ہربل مصنوعات،<br/>صاف اور آسان انداز میں۔</>}/></h2></div><p><Bi en="Meet Al-Mizan, the first product in the shop. Its ingredients, size, and listed price are shown here without invented ratings or health promises." ur="المیزان دکان کی پہلی مصنوعات ہے۔ اس کے اجزاء، وزن اور قیمت واضح طور پر درج ہیں؛ جعلی جائزے یا صحت سے متعلق دعوے نہیں۔"/></p></div>
      <ProductCard/>
    </section>
    <section className="brand-story" id="brand-story">
      <div className="brand-story-image"><img src={asset('al-mizan-herbs.jpg')} alt="Decorative still life of herbs and seeds" loading="eager" decoding="async"/><span className="brand-story-label"><Bi en="Botanical still life" ur="نباتاتی آرائشی تصویر"/></span></div>
      <div className="brand-story-copy"><span className="eyebrow"><Bi en="The Tib-E-Nabwi approach" ur="طبِ نبوی کا انداز"/></span><h2><Bi en={<>Good choices start<br/>with clear details.</>} ur={<>بہتر انتخاب کی شروعات<br/>واضح معلومات سے ہوتی ہے۔</>}/></h2><p><Bi en="We want every product page to make the basics easy to find: what the pack says, what it weighs, what it costs, and how to ask a question." ur="ہم چاہتے ہیں کہ ہر صفحے پر ضروری باتیں آسانی سے ملیں: پیک پر کیا لکھا ہے، وزن کتنا ہے، قیمت کیا ہے اور سوال کیسے پوچھنا ہے۔"/></p><Link href="/products" className="button-text" data-testid="link-story-products"><Bi en="Browse the collection" ur="مصنوعات دیکھیں"/> <ArrowRight size={16}/></Link></div>
    </section>
    <section className="last-cta"><div className="container-wide last-cta-inner"><div className="cta-mark"><Mark/></div><div><span className="eyebrow"><Bi en="A question about the shop?" ur="دکان کے بارے میں سوال ہے؟"/></span><h2><Bi en={<>Tib-E-Nabwi is<br/>here to help.</>} ur={<>طبِ نبوی سے<br/>رابطہ کریں۔</>}/></h2></div><div className="cta-actions"><Link href="/products" className="button-primary" data-testid="link-final-products"><Bi en="Explore products" ur="مصنوعات دیکھیں"/> <ArrowRight size={16}/></Link><a className="button-outline" href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer" data-testid="link-whatsapp-direct"><Bi en="WhatsApp" ur="واٹس ایپ"/> <bdi>{number}</bdi></a></div></div></section>
  </main>;
}
function ProductCard() {
  const { add, preview }=useStore(); const [,setLocation]=useLocation();
  return <article className="catalog-product" data-testid={`card-product-${product.slug}`}>
    <div className="catalog-visual"><button className="catalog-image" aria-label="Preview original Al-Mizan pack — المیزان کی اصل پیکنگ دیکھیں" onClick={()=>preview(asset(product.photo))} data-testid="button-preview-product-card"><img src={asset(product.photo)} alt="Original Al-Mizan package, photographed from the front and back"/><span className="catalog-image-caption"><Bi en="Original product photo" ur="مصنوعات کی اصل تصویر"/></span></button><button className="button-primary catalog-image-add" onClick={()=>{add(product.slug);setLocation('/checkout');}} data-testid={`button-add-${product.slug}`}><Bi en="Add to Cart" ur="آرڈر میں شامل کریں"/> <ShoppingBag size={17}/></button></div>
    <div className="catalog-card-copy"><span className="eyebrow"><Bi en="HERBAL POWDER · 200 G" ur="ہربل پاؤڈر · ۲۰۰ گرام"/></span><h2><Bi en={product.name} ur={product.ur}/></h2><p><Bi en="A blend of herbs and botanicals. Review the full ingredients and precautions before use." ur="جڑی بوٹیوں کا آمیزہ۔ استعمال سے پہلے اجزاء اور احتیاطیں پڑھیں۔"/></p><div className="catalog-card-facts"><span><Bi en="Net weight" ur="خالص وزن"/></span><strong>200 g</strong></div><div className="catalog-bottom"><strong className="catalog-price"><Bi en={money(product.price)} ur="۲,۵۰۰ پاکستانی روپے"/></strong></div><Link href="/product/al-mizan" className="catalog-detail-link" data-testid="link-product-al-mizan"><Bi en="Full product details" ur="مصنوعات کی مکمل معلومات"/> <ArrowRight size={14}/></Link></div>
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
  const { add }=useStore(); const [,params]=useRoute('/product/:slug'); const [,setLocation]=useLocation();
  if(params?.slug !== product.slug) return <MissingPage/>;
  return <main id="main-content" data-testid="page-product-detail">
     <div className="detail-breadcrumb container-wide"><Link href="/products" data-testid="link-detail-back"><ArrowLeft size={14}/><Bi en="Back to the collection" ur="مجموعے پر واپس جائیں"/></Link></div>
    <section className="product-detail container-wide">
       <div className="detail-gallery-purchase"><ProductGallery/><button className="button-primary add-wide gallery-add" onClick={()=>{add(product.slug);setLocation('/checkout');}} data-testid="button-add-detail-al-mizan"><Bi en="Add to Cart" ur="آرڈر میں شامل کریں"/> <ShoppingBag size={18}/></button><p className="gallery-order-hint"><Bi en="Added to your bag; next, review your details at checkout." ur="بیگ میں شامل ہو گا؛ اگلا مرحلہ چیک آؤٹ پر تفصیل دیکھنا ہے۔"/></p></div>
       <div className="detail-purchase"><span className="eyebrow"><Bi en="From the Tib-E-Nabwi collection" ur="طبِ نبوی کی مصنوعات میں سے"/></span><h1><Bi en={product.name} ur={product.ur}/></h1><p className="detail-deck"><Bi en="Herbal powder · Net weight 200 g" ur="ہربل پاؤڈر · خالص وزن ۲۰۰ گرام"/></p><div className="detail-price"><strong><Bi en={money(product.price)} ur="۲,۵۰۰ پاکستانی روپے"/></strong><span><Bi en="Price supplied by the shop" ur="دکاندار کی درج کردہ قیمت"/></span></div><p className="product-description"><Bi en={productDescription.en} ur={productDescription.ur}/></p><p className="handoff-note"><Bi en="Your bag stays in this browser. WhatsApp opens a draft for you to review and send." ur="آپ کا بیگ اسی براؤزر میں رہے گا۔ واٹس ایپ کا مسودہ دیکھ کر خود بھیجیں۔"/></p><a className="detail-wa" href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer" data-testid="link-detail-support"><Bi en="Customer support" ur="صارفین کے لیے رابطہ"/> <bdi>{number}</bdi> <ArrowUpRight size={14}/></a></div>
    </section>
    <section className="product-information container-wide" data-testid="product-information"><div className="product-info-heading"><span className="eyebrow"><Bi en="Product details" ur="مصنوعات کی معلومات"/></span><h2><Bi en="What you should know." ur="ضروری معلومات۔"/></h2><p><Bi en="The ingredient names and manufacturer below are transcribed from the supplied product label." ur="اجزاء اور کمپنی کے نام فراہم کردہ پیکنگ کے لیبل سے نقل کیے گئے ہیں۔"/></p><a className="product-reviews-jump" href="#customer-reviews"><Bi en="Read customer reviews" ur="صارفین کی آراء پڑھیں"/> <ArrowRight size={14}/></a></div>
      <dl className="product-facts">
        <div><dt><Bi en="Net weight" ur="خالص وزن"/></dt><dd><Bi en="200 g" ur="۲۰۰ گرام"/></dd></div>
        <div><dt><Bi en="Ingredients (as listed on the label)" ur="لیبل پر درج اجزاء"/></dt><dd><Bi en="Senna leaf, ajwain, kalonji (black seed), green tea, mint, saunf (fennel), and ginger. The list is transcribed from the supplied label and has not been independently verified." ur="سنا کے پتے، اجوائن، کلونجی، سبز چائے، پودینہ، سونف اور ادرک۔ یہ فہرست فراہم کردہ لیبل سے نقل کی گئی ہے؛ الگ سے تصدیق نہیں کی گئی۔"/></dd></div>
        <div><dt><Bi en="Directions" ur="طریقۂ استعمال"/></dt><dd><Bi en="Follow the directions printed on the product label. The store has not independently reviewed them; contact the manufacturer if they are unclear." ur="پیک پر درج طریقۂ استعمال پر عمل کریں۔ دکان نے اس کی الگ سے طبی جانچ نہیں کی؛ ہدایات واضح نہ ہوں تو کمپنی سے پوچھیں۔"/></dd></div>
        <div><dt><Bi en="Storage" ur="محفوظ رکھنے کا طریقہ"/></dt><dd><Bi en="Storage instructions are not visible in the supplied package photo. Please confirm them with the manufacturer." ur="فراہم کردہ تصویر میں محفوظ رکھنے کی ہدایات نظر نہیں آتیں۔ براہِ کرم کمپنی سے تصدیق کریں۔"/></dd></div>
        <div><dt><Bi en="Manufacturer" ur="کمپنی"/></dt><dd><Bi en="Tib-E-Nabwi Dawakhana.store, Pakistan (as printed on the package)." ur="طبِ نبوی دواخانہ اسٹور، پاکستان (پیکنگ پر درج نام)۔"/></dd></div>
        <div><dt><Bi en="Customer support" ur="صارفین کے لیے رابطہ"/></dt><dd><a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer" data-testid="link-product-info-whatsapp"><bdi>{number}</bdi> <Bi en="Contact on WhatsApp" ur="واٹس ایپ پر رابطہ کریں"/></a></dd></div>
      </dl>
    </section>
    <section className="before-use container-wide" data-testid="before-use-note"><div className="before-use-icon"><ClipboardList size={22}/></div><div><span className="eyebrow"><Bi en="Before use" ur="استعمال سے پہلے"/></span><p><Bi en={beforeUse.en} ur={beforeUse.ur}/></p></div></section>
    <CustomerReviews
      id="customer-reviews"
      previewMode={showDevelopmentPreview}
      emptyAction={
        <a href={`https://wa.me/${waNumber}?text=${encodeURIComponent('I would like to share feedback about the Al-Mizan product.')}`} target="_blank" rel="noreferrer" data-testid="link-share-review-whatsapp">
          <Bi en="Be the first to share a review with us on WhatsApp." ur="واٹس ایپ پر اپنی رائے دے کر پہلے جائزہ دینے والے بنیں۔"/>
        </a>
      }
    />
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
function CheckoutFlow() {
  const {cart,change,remove}=useStore();
  const form=useForm<CheckoutFormValues>({
    resolver:zodResolver(checkoutSchema),
    defaultValues:{name:'',phone:'',city:'',address:'',note:''},
  });
  const fields=[
    {key:'name' as const,en:'Full name',ur:'پورا نام',placeholder:'Your full name',type:'text',autoComplete:'name'},
    {key:'phone' as const,en:'Phone / WhatsApp number',ur:'فون / واٹس ایپ نمبر',placeholder:'e.g. 03xx xxxxxxx',type:'tel',autoComplete:'tel'},
    {key:'city' as const,en:'City',ur:'شہر',placeholder:'Your city',type:'text',autoComplete:'address-level2'},
    {key:'address' as const,en:'Complete delivery address',ur:'مکمل ڈیلیوری پتہ',placeholder:'House, street, area and helpful directions',type:'text',autoComplete:'street-address'},
  ];
  const submit=(details:CheckoutFormValues)=>{
    if(!cart.length)return;
    const lines=cart.map(line=>`${product.name} / ${product.ur} — ${line.quantity} × ${money(product.price)} = ${money(line.quantity*product.price)}`).join('\n');
    const draft=`Assalam-o-alaikum Tib-E-Nabwi, I would like to enquire about this order:\n\nName: ${details.name}\nPhone / WhatsApp: ${details.phone}\nCity: ${details.city}\nComplete delivery address: ${details.address}\nNote: ${details.note.trim()||'None'}\n\nItems:\n${lines}\nProduct total: ${money(getTotal(cart))}\nPlease confirm delivery charges and final delivery details with me. This is a draft enquiry, not a submitted order.\n\nالسلام علیکم طبِ نبوی، میں اس آرڈر کے بارے میں معلومات چاہتا/چاہتی ہوں:\nنام: ${details.name}\nفون / واٹس ایپ: ${details.phone}\nشہر: ${details.city}\nمکمل ڈیلیوری پتہ: ${details.address}\nاضافی نوٹ: ${details.note.trim()||'کوئی نہیں'}\n\nمصنوعات:\n${lines}\nمصنوعات کی درج شدہ قیمت: ${moneyUr(getTotal(cart))}\nبراہِ کرم ڈیلیوری چارجز اور حتمی تفصیل کی تصدیق کریں۔ یہ صرف مسودہ ہے؛ اسے دیکھ کر خود بھیجیں۔`;
    window.location.href=`https://wa.me/${waNumber}?text=${encodeURIComponent(draft)}`;
  };
  return <main id="main-content" className="checkout-page" data-testid="page-checkout">
    <section className="order-hero"><div className="container-wide"><span className="eyebrow"><Bi en="A simple WhatsApp enquiry" ur="واٹس ایپ پر آسان رابطہ"/></span><h1><Bi en="Tell us where to deliver." ur="ڈیلیوری کی معلومات دیں۔"/></h1><p><Bi en="Enter your details and review the items. WhatsApp will open a message for you to check and send." ur="اپنی معلومات درج کریں اور مصنوعات دیکھیں۔ واٹس ایپ میں پیغام کھلے گا جسے آپ خود دیکھ کر بھیجیں گے۔"/></p></div></section>
    <section className="container-wide checkout-layout">
      <Form {...form}><form className="checkout-form" onSubmit={form.handleSubmit(submit)} noValidate aria-labelledby="checkout-title" data-testid="form-checkout">
        <span className="eyebrow"><Bi en="Delivery details" ur="ڈیلیوری کی معلومات"/></span><h2 id="checkout-title"><Bi en="Where should we send it?" ur="پتہ کہاں بھیجنا ہے؟"/></h2>
        <p className="checkout-explainer"><Bi en="Required details are marked. These details go only into your WhatsApp draft and are not saved by this shop." ur="ضروری معلومات نشان زد ہیں۔ یہ تفصیل صرف واٹس ایپ مسودے میں شامل ہو گی؛ دکان انہیں محفوظ نہیں کرتی۔"/></p>
        <div className="checkout-fields">{fields.map(field=><FormField key={field.key} control={form.control} name={field.key} render={({field:inputField})=><FormItem className="checkout-field">
          <FormLabel><Bi en={<>{field.en} <span className="required-mark">Required</span></>} ur={field.ur}/></FormLabel>
          <FormControl><Input {...inputField} id={`checkout-${field.key}`} type={field.type} required autoComplete={field.autoComplete} placeholder={field.placeholder} data-testid={`input-checkout-${field.key}`}/></FormControl>
          <FormDescription className="sr-only"><Bi en="This detail is required to prepare your WhatsApp order message." ur="واٹس ایپ آرڈر پیغام تیار کرنے کے لیے یہ معلومات ضروری ہیں۔"/></FormDescription>
          <FormMessage className="field-error-text" role="alert"/>
        </FormItem>}/>)}</div>
        <FormField control={form.control} name="note" render={({field})=><FormItem className="checkout-field note-field">
          <FormLabel><Bi en="Note (optional)" ur="اضافی نوٹ (اختیاری)"/></FormLabel>
          <FormControl><Textarea {...field} id="checkout-note" rows={3} placeholder="Anything else we should know?" data-testid="input-checkout-note"/></FormControl>
          <FormDescription className="sr-only"><Bi en="You can leave this empty." ur="آپ اسے خالی چھوڑ سکتے ہیں۔"/></FormDescription>
        </FormItem>}/>
        {!cart.length&&<p className="form-alert" role="status"><Bi en="Your bag is empty. Add an item before continuing." ur="آپ کا بیگ خالی ہے۔ آگے بڑھنے سے پہلے مصنوعات شامل کریں۔"/></p>}
        <button className="button-primary checkout-submit" type="submit" disabled={!cart.length} data-testid="button-whatsapp-order"><MessageCircle size={19}/><span><Bi en="Continue to WhatsApp" ur="واٹس ایپ پر جاری رکھیں"/></span><ArrowUpRight size={17}/></button>
        <p className="form-submit-note"><Bi en="WhatsApp opens a prefilled draft. Review it, then press Send yourself." ur="واٹس ایپ میں بھرا ہوا مسودہ کھلے گا۔ دیکھ کر خود بھیجیں۔"/></p>
      </form></Form>
      <aside className="checkout-summary"><span className="eyebrow"><Bi en="Your selection" ur="آپ کا انتخاب"/></span><h2><Bi en="Items & quantity" ur="مصنوعات اور تعداد"/></h2>
        {cart.length?cart.map(line=><div className="checkout-summary-line" key={line.slug} data-testid={`summary-item-${line.slug}`}><img src={asset(product.photo)} alt="Al-Mizan product package"/><div className="checkout-summary-copy"><strong><Bi en={product.name} ur={product.ur}/></strong><span><Bi en={`${money(product.price)} each`} ur={`فی عدد ${moneyUr(product.price)}`}/></span><div className="quantity-controls"><button type="button" onClick={()=>change(line.slug,-1)} aria-label="Decrease quantity — تعداد کم کریں" data-testid={`checkout-decrease-${line.slug}`}><Minus size={13}/></button><span>{line.quantity}</span><button type="button" onClick={()=>change(line.slug,1)} aria-label="Increase quantity — تعداد بڑھائیں" data-testid={`checkout-increase-${line.slug}`}><Plus size={13}/></button><button type="button" className="remove-link" onClick={()=>remove(line.slug)} data-testid={`checkout-remove-${line.slug}`}><Trash2 size={13}/><Bi en="Remove" ur="ہٹائیں"/></button></div></div><b>{money(line.quantity*product.price)}</b></div>):<div className="checkout-no-items"><p><Bi en="Your bag is empty." ur="آپ کا بیگ خالی ہے۔"/></p><Link href="/products" className="button-outline" data-testid="link-checkout-products"><Bi en="Explore products" ur="مصنوعات دیکھیں"/></Link></div>}
        <div className="checkout-total"><span><Bi en="Listed product total" ur="مصنوعات کی درج شدہ کل قیمت"/></span><strong data-testid="text-order-total">{money(getTotal(cart))}</strong></div>
        <p className="delivery-confirmation"><Bi en="Delivery charges and final delivery details are confirmed with you in WhatsApp." ur="ڈیلیوری چارجز اور حتمی تفصیل کی تصدیق واٹس ایپ پر کی جائے گی۔"/></p>
        <p className="checkout-trust"><MessageCircle size={17}/><Bi en="You review and send the message. No order is submitted automatically." ur="پیغام آپ خود دیکھ کر بھیجیں گے۔ آرڈر خودکار طور پر جمع نہیں ہوتا۔"/></p>
      </aside>
    </section>
  </main>;
}
void Checkout;
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
