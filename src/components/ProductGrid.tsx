import React from 'react';
import { Product } from '../types/pos';
import { Plus, PackageX, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../utils/receiptGenerator';

interface ProductGridProps {
  products: Product[];
  currency: string;
  onAddToCart: (product: Product) => void;
  onOpenCustomItem: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  currency,
  onAddToCart,
  onOpenCustomItem
}) => {
  if (products.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-900/40">
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-slate-500 mb-3 border border-slate-700">
          <PackageX className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-base font-bold text-slate-200">لم يتم العثور على أية أصناف</h3>
        <p className="text-xs text-slate-400 max-w-xs mt-1 mb-4">
          جرّب كتابة كلمة بحث أخرى أو امسح البارکود مرة أخرى أو أضف صنف مخصص.
        </p>
        <button
          onClick={onOpenCustomItem}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-md"
        >
          إضافة صنف مخصص جديد
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 align-content-start">
      {products.map((product) => {
        const isLowStock = product.stock <= 5;
        const isOutOfStock = product.stock <= 0;

        return (
          <button
            key={product.id}
            disabled={isOutOfStock}
            onClick={() => onAddToCart(product)}
            className={`group relative flex flex-col justify-between p-3.5 rounded-2xl border text-right transition-all cursor-pointer select-none h-36 ${
              isOutOfStock
                ? 'bg-slate-900/50 border-slate-800 opacity-50 cursor-not-allowed'
                : 'bg-slate-800/90 border-slate-700/80 hover:border-emerald-500/70 hover:bg-slate-800 hover:shadow-xl hover:shadow-emerald-950/30 active:scale-[0.98]'
            }`}
          >
            {/* Top Row: Category tag / Stock badge */}
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded-md font-mono border border-slate-700/50">
                {product.barcode.slice(-4)}
              </span>

              {isLowStock && !isOutOfStock && (
                <span className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded-md border border-amber-800/50 font-medium">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  متبقي {product.stock}
                </span>
              )}

              {isOutOfStock && (
                <span className="text-[10px] text-rose-400 bg-rose-950/60 px-1.5 py-0.5 rounded-md border border-rose-800/50 font-bold">
                  نفذ المخزون
                </span>
              )}
            </div>

            {/* Middle: Product Name */}
            <div className="my-auto py-1">
              <h4 className="text-xs sm:text-sm font-bold text-slate-100 line-clamp-2 leading-snug group-hover:text-emerald-300 transition-colors">
                {product.name}
              </h4>
              {product.nameEn && (
                <p className="text-[10px] text-slate-400 truncate mt-0.5 font-mono dir-ltr text-right">
                  {product.nameEn}
                </p>
              )}
            </div>

            {/* Bottom Row: Price & Add Button */}
            <div className="flex items-end justify-between w-full pt-1 border-t border-slate-700/40">
              <div>
                <span className="text-sm sm:text-base font-black text-emerald-400 font-mono tracking-tight">
                  {formatCurrency(product.price, currency)}
                </span>
                <span className="text-[10px] text-slate-400 mr-1">/ {product.unit}</span>
              </div>

              <div className="w-7 h-7 rounded-xl bg-slate-700/70 group-hover:bg-emerald-600 text-slate-300 group-hover:text-white flex items-center justify-center transition-all shadow-sm">
                <Plus className="w-4 h-4" />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
