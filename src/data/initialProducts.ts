import { Category, Product, StoreConfig } from '../types/pos';

export const CATEGORIES: Category[] = [
  { id: 'all', name: 'جميع الأصناف', icon: 'Grid' },
  { id: 'honey_bucket', name: 'جردل العسل', icon: 'Heart' },
  { id: 'beverages', name: 'مشروبات ومياه', icon: 'CupSoda' },
  { id: 'dairy', name: 'ألبان وأجبان', icon: 'Milk' },
  { id: 'bakery', name: 'مخبوزات وحلويات', icon: 'UtensilsCrossed' },
  { id: 'snacks', name: 'تسالي وشوكولاتة', icon: 'Cookie' },
  { id: 'produce', name: 'خضروات وفواكه', icon: 'Apple' },
  { id: 'cleaning', name: 'منظفات ومستلزمات', icon: 'Sparkles' },
  { id: 'personal', name: 'عناية شخصية', icon: 'Heart' },
];

export const DEFAULT_STORE_CONFIG: StoreConfig = {
  storeName: 'أسواق البركة المركزية',
  storeSubtitle: 'فرع طريق الملك فهد - الرياض',
  taxNumber: '310123456700003',
  crNumber: '1010987654',
  phone: '011-4567890 / 0501234567',
  address: 'الرياض - حي العليا - شارع التخصصي',
  currency: 'ر.س',
  vatRate: 0.15,
  receiptFooter: 'شكراً لتسوقكم معنا - يسعدنا خدمتكم دائماً',
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'honey-amouna-1',
    barcode: '999999',
    name: 'امونه العسل',
    nameEn: 'Amouna Honey Special',
    category: 'honey_bucket',
    price: 999,
    stock: 1,
    unit: 'قلبي',
    color: '#e11d48'
  }
];
