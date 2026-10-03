import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, Order, HeldOrder, StoreConfig } from '../types/pos';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project-ref') && 
  !supabaseAnonKey.includes('your-supabase-anon-key')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
      global: {
        fetch: (...args) => globalThis.fetch(...args),
      },
    })
  : null;

// Database Schema SQL Script for user setup
export const SUPABASE_SQL_SCHEMA = `-- Copy & Paste this SQL script into your Supabase SQL Editor to create tables for POS

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

-- Enable RLS & public access policies
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read/write products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);
`;

// Supabase API Helper Functions
export async function fetchProductsFromSupabase(): Promise<{ products: Product[]; missingTable: boolean }> {
  if (!supabase) return { products: [], missingTable: false };
  try {
    const { data, error } = await supabase.from('products').select('*').order('name');
    if (error) {
      if (error.code === 'PGRST205') {
        console.warn('Supabase notice: "public.products" table does not exist yet in Supabase schema.');
        return { products: [], missingTable: true };
      }
      console.warn('Notice fetching products from Supabase:', error.message);
      return { products: [], missingTable: false };
    }
    const products: Product[] = (data || []).map((row) => ({
      id: row.id,
      barcode: row.barcode,
      name: row.name,
      nameEn: row.name_en,
      category: row.category,
      price: Number(row.price),
      costPrice: row.cost_price ? Number(row.cost_price) : undefined,
      stock: Number(row.stock),
      unit: row.unit || 'حبة',
      color: row.color,
    }));
    return { products, missingTable: false };
  } catch (err) {
    console.warn('Supabase fetch products notice:', err);
    return { products: [], missingTable: false };
  }
}

export async function saveProductToSupabase(product: Product): Promise<boolean> {
  if (!supabase) return false;
  try {
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
    const { error } = await supabase.from('products').upsert(payload, { onConflict: 'id' });
    if (error) {
      console.error('Error saving product to Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase save product failed:', err);
    return false;
  }
}

export async function deleteProductFromSupabase(productId: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) {
      console.error('Error deleting product from Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase delete product failed:', err);
    return false;
  }
}

export async function fetchOrdersFromSupabase(): Promise<{ orders: Order[]; missingTable: boolean }> {
  if (!supabase) return { orders: [], missingTable: false };
  try {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) {
      if (error.code === 'PGRST205') {
        console.warn('Supabase notice: "public.orders" table does not exist yet in Supabase schema.');
        return { orders: [], missingTable: true };
      }
      console.warn('Notice fetching orders from Supabase:', error.message);
      return { orders: [], missingTable: false };
    }
    const orders: Order[] = (data || []).map((row) => ({
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
  } catch (err) {
    console.warn('Supabase fetch orders notice:', err);
    return { orders: [], missingTable: false };
  }
}

export async function saveOrderToSupabase(order: Order): Promise<boolean> {
  if (!supabase) return false;
  try {
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
    const { error } = await supabase.from('orders').insert([payload]);
    if (error) {
      console.error('Error saving order to Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase save order failed:', err);
    return false;
  }
}
