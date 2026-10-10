import type { CustomerReview } from '@/components/storefront/CustomerReviews';
import type { TrustMetric } from '@/components/storefront/HomepageTrustStats';

export const demoReviews: readonly CustomerReview[] = [
  { id: 'demo-ali', name: 'Ali', title: 'Clear and easy to follow', rating: 5, language: 'ur', text: 'مجھے پیکنگ کی صاف ستھری پیشکش پسند آئی۔ پروڈکٹ کی معلومات اور طریقۂ استعمال پڑھنا بھی آسان ہے۔' },
  { id: 'demo-ahmad', name: 'Ahmad', title: 'A thoughtful product page', rating: 5, language: 'en', text: 'I like the product presentation. The ingredients, pack size, and directions are easy to find without searching around.' },
  { id: 'demo-usman', name: 'Usman', title: 'Website use karna asaan hai', rating: 5, language: 'ur-Latn', text: 'Product ki details ek jagah par clear hain. Website par information dekhna aur order ka tareeqa samajhna asaan laga.' },
  { id: 'demo-hassan', name: 'Hassan', title: 'Neat presentation', rating: 4.5, language: 'en', text: 'Good product information and a neat page layout. I could quickly check the listed ingredients and how to contact the store.' },
  { id: 'demo-bilal', name: 'Bilal', title: 'Details achi tarah di hui hain', rating: 5, language: 'ur-Latn', text: 'Mujhe product ki packing aur page ka simple design pasand aya. Zaroori maloomat bhi asani se mil gayi.' },
  { id: 'demo-ayesha', name: 'Ayesha', title: 'معلومات واضح اور منظم ہیں', rating: 5, language: 'ur', text: 'پروڈکٹ کی تفصیل سادہ اور منظم انداز میں دی گئی ہے۔ اجزاء اور پیک کے وزن کو تلاش کرنا مشکل نہیں تھا۔' },
  { id: 'demo-fatima', name: 'Fatima', title: 'Easy to browse in both languages', rating: 5, language: 'en', text: 'I love that the product details are presented thoughtfully in English and Urdu. The page feels calm and easy to browse.' },
  { id: 'demo-sana', name: 'Sana', title: 'Achi aur simple presentation', rating: 4.5, language: 'ur-Latn', text: 'Product ki maloomat samajhna asaan hai aur istemal ki hidayat bhi page par mil jati hai. Design clean aur achha laga.' },
  { id: 'demo-hamza', name: 'Hamza', title: 'ضروری تفصیل ایک جگہ', rating: 5, language: 'ur', text: 'وزن، درج شدہ قیمت اور اجزاء کی فہرست واضح انداز میں موجود ہیں۔ آرڈر کے بارے میں رابطے کا طریقہ بھی سمجھ آ گیا۔' },
  { id: 'demo-zain', name: 'Zain', title: 'Simple, clean, and helpful', rating: 5, language: 'en', text: 'I like the clean product page and packaging photos. The information is laid out clearly, and the ordering steps are straightforward.' },
  { id: 'demo-maryam', name: 'Maryam', title: 'Product ki details pasand aayin', rating: 4.5, language: 'ur-Latn', text: 'Product ki maloomat achi tarah likhi hui hai. Website par sawal poochne aur order ka tareeqa bhi asaan nazar aya.' },
  { id: 'demo-muhammad', name: 'Muhammad', title: 'سادہ اور اچھی پیشکش', rating: 5, language: 'ur', text: 'پیکنگ کی تصویر، واضح معلومات اور آسان ویب سائٹ اچھی لگی۔ پروڈکٹ کے بارے میں سوال کرنے کا راستہ بھی موجود ہے۔' },
];

export const demoMetrics: readonly TrustMetric[] = [
  { id: 'orders', value: '50,000+', label: 'Total orders', labelUr: 'کل آرڈرز', icon: 'orders' },
  { id: 'returning-customers', value: '10,000+', label: 'Returning customers', labelUr: 'دوبارہ خریدنے والے صارفین', icon: 'customers' },
  { id: 'average-rating', value: '4.8/5', label: 'Average customer rating', labelUr: 'اوسط صارف درجہ بندی', icon: 'rating' },
  { id: 'satisfaction', value: '95%', label: 'Customer satisfaction', labelUr: 'صارفین کا اطمینان', icon: 'satisfaction' },
];
