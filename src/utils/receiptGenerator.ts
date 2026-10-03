import { Order, StoreConfig } from '../types/pos';

/**
 * Generate simplified ZATCA QR Code Payload representation for KSA VAT Invoice
 */
export function generateZatcaQrString(order: Order, config: StoreConfig): string {
  const seller = config.storeName;
  const vatNo = config.taxNumber;
  const timestamp = order.createdAt;
  const total = order.totalAmount.toFixed(2);
  const vat = order.taxAmount.toFixed(2);

  // Simple Base64 mock string encoding of basic tax fields
  const rawText = `Seller:${seller}|VAT:${vatNo}|Time:${timestamp}|Total:${total}|VATVal:${vat}`;
  try {
    return btoa(unescape(encodeURIComponent(rawText)));
  } catch {
    return `ZATCA-INV-${order.orderNumber}-${order.totalAmount}`;
  }
}

/**
 * Format currency number with locale
 */
export function formatCurrency(amount: number, currency = 'ر.س'): string {
  return `${amount.toFixed(2)} ${currency}`;
}

/**
 * Format date string for POS receipt
 */
export function formatPosDate(isoString: string): { date: string; time: string } {
  const d = new Date(isoString);
  const date = d.toLocaleDateString('ar-SA', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const time = d.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  return { date, time };
}
