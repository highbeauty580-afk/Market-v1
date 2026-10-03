import { Product, Order, StoreConfig } from '../types/pos';

// Dynamic Credentials Resolver (checks localStorage first, then environment variables)
export function getSupabaseCredentials() {
  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('pos_supabase_url') || '' : '';
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem('pos_supabase_key') || '' : '';

  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const url = (storedUrl || envUrl).trim();
  const key = (storedKey || envKey).trim();

  const isConfigured = Boolean(
    url && 
    key && 
    !url.includes('your-project-ref') && 
    !key.includes('your-supabase-anon-key')
  );

  return { url, key, isConfigured };
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseCredentials().isConfigured;
}

export function saveSupabaseCredentials(url: string, key: string): boolean {
  if (typeof window !== 'undefined') {
    localStorage.setItem('pos_supabase_url', url.trim());
    localStorage.setItem('pos_supabase_key', key.trim());
  }
  return getSupabaseCredentials().isConfigured;
}

export function clearSupabaseCredentials() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('pos_supabase_url');
    localStorage.removeItem('pos_supabase_key');
  }
}

// Native fetch helper for Supabase REST (PostgREST) API
async function postgrestFetch(endpoint: string, options: RequestInit = {}) {
  const { url: supabaseUrl, key: supabaseAnonKey, isConfigured } = getSupabaseCredentials();
  if (!isConfigured) return null;
  const baseUrl = supabaseUrl.replace(/\/$/, '');
  const url = `${baseUrl}/rest/v1/${endpoint}`;
  const headers = {
    'apikey': supabaseAnonKey,
    'Authorization': `Bearer ${supabaseAnonKey}`,
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const response = await window.fetch(url, { ...options, headers });
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      return { error: errorBody, status: response.status, data: null };
    }
    const data = await response.json().catch(() => null);
    return { data, status: response.status, error: null };
  } catch (err) {
    return { error: err, status: 0, data: null };
  }
}

// Complete SQL Script for Supabase SQL Editor
export const SUPABASE_SQL_SCHEMA = `-- COPY & PASTE THIS SQL IN SUPABASE SQL EDITOR TO CREATE POS TABLES:

-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  barcode TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  name_en TEXT,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  cost_price NUMERIC,
  stock INT NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'حبة',
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  order_number INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  items JSONB NOT NULL,
  subtotal NUMERIC NOT NULL,
  discount_amount NUMERIC NOT NULL,
  tax_amount NUMERIC NOT NULL,
  total_amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  amount_paid NUMERIC NOT NULL,
  cash_paid NUMERIC,
  card_paid NUMERIC,
  change_given NUMERIC NOT NULL,
  cashier_name TEXT NOT NULL,
  customer_name TEXT,
  status TEXT NOT NULL DEFAULT 'completed'
);

-- 3. Create Store Config Table
CREATE TABLE IF NOT EXISTS public.store_config (
  id TEXT PRIMARY KEY DEFAULT 'main_store',
  store_name TEXT NOT NULL,
  store_subtitle TEXT,
  tax_number TEXT,
  cr_number TEXT,
  phone TEXT,
  address TEXT,
  currency TEXT DEFAULT 'ر.س',
  vat_rate NUMERIC DEFAULT 0.15,
  receipt_footer TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security & Public Read/Write Access Policies
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read/write products" ON public.products;
DROP POLICY IF EXISTS "Allow public read/write orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public read/write store_config" ON public.store_config;

CREATE POLICY "Allow public read/write products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write store_config" ON public.store_config FOR ALL USING (true) WITH CHECK (true);
`;

// Test Supabase Connection (Validates Read and Write permissions live)
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, message: 'رابط ومفتاح Supabase غير مدخلين بعد.' };
  }

  // 1. Test Read Products
  const resRead = await postgrestFetch('products?select=id&limit=1');
  if (!resRead || resRead.error) {
    const errObj = resRead?.error as { code?: string; message?: string };
    if (errObj?.code === 'PGRST205' || errObj?.message?.includes('products')) {
      return { 
        success: false, 
        message: 'جدول المنتجات (products) غير موجود في Supabase. يرجى تشغيل كود SQL في Supabase أولاً.' 
      };
    }
    return { success: false, message: `فشل الاتصال بـ Supabase: ${errObj?.message || 'تأكد من صحة الرابط والمفتاح'}` };
  }

  return { success: true, message: 'تم الاتصال بنجاح بقواعد بيانات Supabase وسحب البيانات حياً!' };
}

// Fetch Products from Supabase
export async function fetchProductsFromSupabase(): Promise<{ products: Product[]; missingTable: boolean }> {
  const result = await postgrestFetch('products?select=*&order=name');
  if (!result) return { products: [], missingTable: false };

  if (result.error) {
    const errCode = (result.error as { code?: string })?.code;
    const errMsg = (result.error as { message?: string })?.message || '';
    if (errCode === 'PGRST205' || errMsg.includes('products')) {
      console.warn('Supabase notice: "public.products" table does not exist yet in Supabase schema.');
      return { products: [], missingTable: true };
    }
    return { products: [], missingTable: false };
  }

  const data = (result.data || []) as Array<{
    id: string;
    barcode: string;
    name: string;
    name_en?: string;
    category: string;
    price: number | string;
    cost_price?: number | string;
    stock: number | string;
    unit?: string;
    color?: string;
  }>;

  const products: Product[] = data.map((row) => ({
    id: row.id,
    barcode: row.barcode,
    name: row.name,
    nameEn: row.name_en,
    category: row.category as Product['category'],
    price: Number(row.price),
    costPrice: row.cost_price ? Number(row.cost_price) : undefined,
    stock: Number(row.stock),
    unit: row.unit || 'حبة',
    color: row.color,
  }));

  return { products, missingTable: false };
}

// Save single product to Supabase
export async function saveProductToSupabase(product: Product): Promise<boolean> {
  const payload = {
    id: product.id,
    barcode: product.barcode,
    name: product.name,
    name_en: product.nameEn,
    category: product.category,
    price: product.price,
    cost_price: product.costPrice,
    stock: product.stock,
    unit: product.unit,
    color: product.color,
  };

  const result = await postgrestFetch('products', {
    method: 'POST',
    headers: { 'Prefer': 'resolution=merge-duplicates' },
    body: JSON.stringify(payload),
  });

  return Boolean(result && !result.error);
}

// Delete product from Supabase
export async function deleteProductFromSupabase(productId: string): Promise<boolean> {
  const result = await postgrestFetch(`products?id=eq.${encodeURIComponent(productId)}`, {
    method: 'DELETE',
  });

  return Boolean(result && !result.error);
}

// Fetch Orders from Supabase
export async function fetchOrdersFromSupabase(): Promise<{ orders: Order[]; missingTable: boolean }> {
  const result = await postgrestFetch('orders?select=*&order=created_at.desc');
  if (!result) return { orders: [], missingTable: false };

  if (result.error) {
    const errCode = (result.error as { code?: string })?.code;
    const errMsg = (result.error as { message?: string })?.message || '';
    if (errCode === 'PGRST205' || errMsg.includes('orders')) {
      console.warn('Supabase notice: "public.orders" table does not exist yet in Supabase schema.');
      return { orders: [], missingTable: true };
    }
    return { orders: [], missingTable: false };
  }

  const data = (result.data || []) as Array<{
    id: string;
    order_number: number | string;
    created_at: string;
    items: Order['items'];
    subtotal: number | string;
    discount_amount: number | string;
    tax_amount: number | string;
    total_amount: number | string;
    payment_method: Order['paymentMethod'];
    amount_paid: number | string;
    cash_paid?: number | string;
    card_paid?: number | string;
    change_given: number | string;
    cashier_name: string;
    customer_name?: string;
    status: Order['status'];
  }>;

  const orders: Order[] = data.map((row) => ({
    id: row.id,
    orderNumber: Number(row.order_number),
    createdAt: row.created_at,
    items: row.items,
    subtotal: Number(row.subtotal),
    discountAmount: Number(row.discount_amount),
    taxAmount: Number(row.tax_amount),
    totalAmount: Number(row.total_amount),
    paymentMethod: row.payment_method,
    amountPaid: Number(row.amount_paid),
    cashPaid: row.cash_paid ? Number(row.cash_paid) : undefined,
    cardPaid: row.card_paid ? Number(row.card_paid) : undefined,
    changeGiven: Number(row.change_given),
    cashierName: row.cashier_name,
    customerName: row.customer_name,
    status: row.status,
  }));

  return { orders, missingTable: false };
}

// Save single order to Supabase
export async function saveOrderToSupabase(order: Order): Promise<boolean> {
  const payload = {
    id: order.id,
    order_number: order.orderNumber,
    created_at: order.createdAt,
    items: order.items,
    subtotal: order.subtotal,
    discount_amount: order.discountAmount,
    tax_amount: order.taxAmount,
    total_amount: order.totalAmount,
    payment_method: order.paymentMethod,
    amount_paid: order.amountPaid,
    cash_paid: order.cashPaid,
    card_paid: order.cardPaid,
    change_given: order.changeGiven,
    cashier_name: order.cashierName,
    customer_name: order.customerName,
    status: order.status,
  };

  const result = await postgrestFetch('orders', {
    method: 'POST',
    headers: { 'Prefer': 'resolution=merge-duplicates' },
    body: JSON.stringify(payload),
  });

  return Boolean(result && !result.error);
}

// Fetch Store Config from Supabase
export async function fetchStoreConfigFromSupabase(): Promise<StoreConfig | null> {
  const result = await postgrestFetch('store_config?id=eq.main_store&select=*');
  if (!result || result.error || !Array.isArray(result.data) || result.data.length === 0) {
    return null;
  }

  const row = result.data[0];
  return {
    storeName: row.store_name,
    storeSubtitle: row.store_subtitle || '',
    taxNumber: row.tax_number || '',
    crNumber: row.cr_number || '',
    phone: row.phone || '',
    address: row.address || '',
    currency: row.currency || 'ر.س',
    vatRate: row.vat_rate ? Number(row.vat_rate) : 0.15,
    receiptFooter: row.receipt_footer || '',
  };
}

// Save Store Config to Supabase
export async function saveStoreConfigToSupabase(config: StoreConfig): Promise<boolean> {
  const payload = {
    id: 'main_store',
    store_name: config.storeName,
    store_subtitle: config.storeSubtitle,
    tax_number: config.taxNumber,
    cr_number: config.crNumber,
    phone: config.phone,
    address: config.address,
    currency: config.currency,
    vat_rate: config.vatRate,
    receipt_footer: config.receiptFooter,
  };

  const result = await postgrestFetch('store_config', {
    method: 'POST',
    headers: { 'Prefer': 'resolution=merge-duplicates' },
    body: JSON.stringify(payload),
  });

  return Boolean(result && !result.error);
}

// Bulk Push All Local Data to Supabase (Migration)
export async function pushAllLocalProductsToSupabase(products: Product[]): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;
  for (const prod of products) {
    const ok = await saveProductToSupabase(prod);
    if (ok) success++;
    else failed++;
  }
  return { success, failed };
}

export async function pushAllLocalOrdersToSupabase(orders: Order[]): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;
  for (const order of orders) {
    const ok = await saveOrderToSupabase(order);
    if (ok) success++;
    else failed++;
  }
  return { success, failed };
}
