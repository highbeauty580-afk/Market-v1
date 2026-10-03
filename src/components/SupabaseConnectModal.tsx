import React, { useState } from 'react';
import { isSupabaseConfigured, SUPABASE_SQL_SCHEMA } from '../lib/supabase';
import { X, Database, CheckCircle2, AlertCircle, Copy, Key, Sparkles, RefreshCw } from 'lucide-react';

interface SupabaseConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncSupabase: () => void;
  onClearAllProducts: () => void;
  productsCount: number;
}

export const SupabaseConnectModal: React.FC<SupabaseConnectModalProps> = ({
  isOpen,
  onClose,
  onSyncSupabase,
  onClearAllProducts,
  productsCount
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span>ربط قاعدة البيانات Supabase</span>
                {isSupabaseConfigured ? (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border border-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> متصل
                  </span>
                ) : (
                  <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border border-amber-300 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-amber-600" /> في انتظار المفاتيح
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500">ربط الكاشير بقواعد بيانات Supabase الحية</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Step 1: Environment Variables Location */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2 shadow-xs">
            <h4 className="font-extrabold text-slate-900 flex items-center gap-2 text-sm">
              <Key className="w-4 h-4 text-emerald-600" />
              1. إعداد المتغيرات البيئية (Environment Variables / Secrets)
            </h4>
            <p className="text-slate-600 leading-relaxed font-medium">
              ضع المفاتيح التالية في لوحة **Secrets / Environment Variables** في بيئة التطوير أو في ملف <code className="text-emerald-700 font-mono font-bold">.env</code>:
            </p>

            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 font-mono text-emerald-400 space-y-1 dir-ltr text-left">
              <div>VITE_SUPABASE_URL="https://your-project.supabase.co"</div>
              <div>VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiI..."</div>
            </div>
          </div>

          {/* Step 2: SQL Tables Setup */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-slate-900 flex items-center gap-2 text-sm">
                <Database className="w-4 h-4 text-cyan-600" />
                2. إنشاء الجداول في Supabase SQL Editor
              </h4>
              <button
                onClick={handleCopySql}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 rounded-xl border border-slate-300 font-bold transition-colors flex items-center gap-1.5 cursor-pointer font-sans text-xs shadow-xs"
              >
                <Copy className="w-3.5 h-3.5 text-cyan-600" />
                <span>{copied ? 'تم النسخ!' : 'نسخ كود SQL'}</span>
              </button>
            </div>
            <p className="text-slate-600 leading-relaxed font-medium">
              افتح محرر SQL في موقع Supabase والصق الكود التالي لإنشاء جدول المنتجات وجدول الفواتير تلقائياً:
            </p>

            <pre className="bg-slate-900 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-200 max-h-36 overflow-y-auto dir-ltr text-left">
              {SUPABASE_SQL_SCHEMA}
            </pre>
          </div>

          {/* Step 3: Clear or Sync Products */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3 shadow-xs">
            <h4 className="font-extrabold text-slate-900 flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-amber-600" />
              3. التحكم في الأصناف والبيانات
            </h4>
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
              <div>
                <div className="text-slate-900 font-extrabold">عدد المنتجات الحالية بالنظام: {productsCount}</div>
                <div className="text-slate-500 text-[11px]">
                  {productsCount === 0 ? 'القائمة فارغة (جاهز لإدخال أصناف جديدة أو الجلب من Supabase)' : 'يوجد منتجات حالياً'}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onSyncSupabase}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1 shadow-md shadow-emerald-600/20"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>جلب الأصناف من Supabase</span>
                </button>

                <button
                  onClick={onClearAllProducts}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  تفريغ الأصناف (البدء بجدول فارغ)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
