import React, { useState } from 'react';
import { Product, CategoryId } from '../types/pos';
import { CATEGORIES } from '../data/initialProducts';
import { X, Plus, Package, Edit, Trash2, Save, ScanBarcode } from 'lucide-react';
import { formatCurrency } from '../utils/receiptGenerator';

interface ProductManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  currency: string;
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

export const ProductManagerModal: React.FC<ProductManagerModalProps> = ({
  isOpen,
  onClose,
  products,
  currency,
  onSaveProduct,
  onDeleteProduct,
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product>>({
    category: 'beverages',
    unit: 'حبة',
    stock: 50,
  });

  if (!isOpen) return null;

  const filtered = products.filter(
    (p) =>
      p.name.includes(filterQuery) ||
      p.barcode.includes(filterQuery) ||
      (p.nameEn && p.nameEn.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleAddNewClick = () => {
    setEditingProduct({
      id: `p-${Date.now()}`,
      barcode: `628100${Math.floor(1000000 + Math.random() * 9000000)}`,
      name: '',
      category: 'beverages',
      price: 10,
      stock: 50,
      unit: 'حبة',
    });
    setIsFormOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct.name || !editingProduct.price) return;

    onSaveProduct(editingProduct as Product);
    setIsFormOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-100 text-cyan-700 rounded-xl border border-cyan-200">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">إدارة أصناف المنتجات والمخزون</h3>
              <p className="text-xs text-slate-500">إضافة، تعديل الأسعار، وتحديث كميات المخزون</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAddNewClick}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة صنف جديد</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="تصفية بالأسم أو البارکود..."
            className="w-full bg-white border border-slate-200 text-slate-900 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500 shadow-xs"
          />
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Product Form Drawer */}
          {isFormOpen && (
            <form
              onSubmit={handleSubmitForm}
              className="bg-slate-50 border border-cyan-200 p-4 rounded-2xl space-y-3 shadow-md"
            >
              <h4 className="text-xs font-bold text-cyan-800 uppercase tracking-wider">
                {editingProduct.id ? 'تعديل الصنف الحالي' : 'إضافة صنف جديد'}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-600 font-bold block mb-1">اسم المنتج بالكامل:</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-cyan-500 shadow-xs"
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-bold block mb-1">البارکود (Barcode):</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.barcode || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, barcode: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-900 font-mono focus:outline-none focus:border-cyan-500 shadow-xs"
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-bold block mb-1">السعر ({currency}):</label>
                  <input
                    type="number"
                    step="0.10"
                    required
                    value={editingProduct.price || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-emerald-700 font-mono font-bold focus:outline-none focus:border-cyan-500 shadow-xs"
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-bold block mb-1">القسم:</label>
                  <select
                    value={editingProduct.category || 'beverages'}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, category: e.target.value as CategoryId })
                    }
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-cyan-500 shadow-xs"
                  >
                    {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-600 font-bold block mb-1">كمية المخزون:</label>
                  <input
                    type="number"
                    value={editingProduct.stock ?? 50}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })
                    }
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-900 font-mono focus:outline-none focus:border-cyan-500 shadow-xs"
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-bold block mb-1">الوحدة:</label>
                  <input
                    type="text"
                    value={editingProduct.unit || 'حبة'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, unit: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-cyan-500 shadow-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>حفظ الصنف</span>
                </button>
              </div>
            </form>
          )}

          {/* Product List Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">البارکود</th>
                  <th className="p-3">اسم المنتج</th>
                  <th className="p-3">القسم</th>
                  <th className="p-3">السعر</th>
                  <th className="p-3">المخزون</th>
                  <th className="p-3 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono text-slate-500">{prod.barcode}</td>
                    <td className="p-3 font-extrabold text-slate-800">{prod.name}</td>
                    <td className="p-3 text-slate-500">
                      {CATEGORIES.find((c) => c.id === prod.category)?.name || prod.category}
                    </td>
                    <td className="p-3 font-mono font-bold text-emerald-600">
                      {formatCurrency(prod.price, currency)}
                    </td>
                    <td className="p-3 font-mono text-slate-700">
                      {prod.stock} {prod.unit}
                    </td>
                    <td className="p-3 text-center flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleEditClick(prod)}
                        className="p-1.5 text-slate-400 hover:text-cyan-700 hover:bg-cyan-50 rounded-lg transition-colors cursor-pointer"
                        title="تعديل"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteProduct(prod.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
