import { Product, Order, StoreConfig } from '../types/pos';

export interface ServerSyncData {
  products: Product[];
  orders: Order[];
  config: StoreConfig | null;
  updatedAt?: string;
}

// Fetch all data from central server
export async function fetchServerData(): Promise<ServerSyncData | null> {
  try {
    const res = await fetch('/api/pos/all');
    if (!res.ok) return null;
    const data = await res.json();
    return {
      products: Array.isArray(data.products) ? data.products : [],
      orders: Array.isArray(data.orders) ? data.orders : [],
      config: data.config || null,
      updatedAt: data.updatedAt,
    };
  } catch (err) {
    console.error('Failed to fetch from server sync API:', err);
    return null;
  }
}

// Save or update single product on server
export async function saveProductToServer(product: Product): Promise<boolean> {
  try {
    const res = await fetch('/api/pos/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to save product to server:', err);
    return false;
  }
}

// Delete product on server
export async function deleteProductFromServer(productId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/pos/products/${encodeURIComponent(productId)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to delete product from server:', err);
    return false;
  }
}

// Save new completed order on server
export async function saveOrderToServer(order: Order): Promise<boolean> {
  try {
    const res = await fetch('/api/pos/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to save order to server:', err);
    return false;
  }
}

// Save store config on server
export async function saveConfigToServer(config: StoreConfig): Promise<boolean> {
  try {
    const res = await fetch('/api/pos/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to save config to server:', err);
    return false;
  }
}

// Bulk Sync Local to Server
export async function syncBulkLocalToServer(
  products: Product[],
  orders: Order[],
  config: StoreConfig
): Promise<boolean> {
  try {
    const res = await fetch('/api/pos/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products, orders, config }),
    });
    return res.ok;
  } catch (err) {
    console.error('Failed bulk sync to server:', err);
    return false;
  }
}
