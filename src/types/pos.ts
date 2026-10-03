export type CategoryId = 'all' | 'beverages' | 'bakery' | 'dairy' | 'snacks' | 'produce' | 'cleaning' | 'personal';

export interface Category {
  id: CategoryId;
  name: string;
  icon: string;
}

export interface Product {
  id: string;
  barcode: string;
  name: string;
  nameEn?: string;
  category: CategoryId;
  price: number; // In SAR (or selected currency)
  costPrice?: number;
  stock: number;
  unit: string; // e.g., 'حبة', 'كيلو', 'كرتون'
  image?: string;
  color?: string; // fallback tile color
}

export interface CartItem {
  product: Product;
  quantity: number;
  discountPercent?: number; // per item discount
  customPrice?: number;
  notes?: string;
}

export type PaymentMethod = 'cash' | 'card' | 'split';

export interface Order {
  id: string;
  orderNumber: number;
  createdAt: string; // ISO string or timestamp
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number; // VAT 15%
  totalAmount: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  cashPaid?: number;
  cardPaid?: number;
  changeGiven: number;
  cashierName: string;
  customerName?: string;
  customerPhone?: string;
  status: 'completed' | 'refunded' | 'held';
}

export interface HeldOrder {
  id: string;
  orderNumber: number;
  heldAt: string;
  items: CartItem[];
  customerName?: string;
  note?: string;
}

export interface StoreConfig {
  storeName: string;
  storeSubtitle: string;
  taxNumber: string; // الرقم الضريبي
  crNumber: string;  // السجل التجاري
  phone: string;
  address: string;
  currency: string;
  vatRate: number;   // default 0.15 (15%)
  receiptFooter: string;
}

export interface ShiftReport {
  shiftId: string;
  startTime: string;
  cashierName: string;
  totalSales: number;
  totalOrders: number;
  cashSales: number;
  cardSales: number;
  taxCollected: number;
  topProducts: { name: string; quantity: number; total: number }[];
}
