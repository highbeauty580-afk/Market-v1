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
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>ربط قاعدة البيانات Supabase</span>
                {isSupabaseConfigured ? (
                  <span className="bg-emerald-950 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-mono border border-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> متصل
                  </span>
                ) : (
                  <span className="bg-amber-950 text-amber-400 text-[10px] px-2 py-0.5 rounded font-mono border border-amber-800 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> في انتظار المفاتيح
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">ربط الكاشير بقواعد بيانات Supabase الحية</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Step 1: Environment Variables Location */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
            <h4 className="font-bold text-slate-200 flex items-center gap-2 text-sm">
              <Key className="w-4 h-4 text-emerald-400" />
              1. إعداد المتغيرات البيئية (Environment Variables / Secrets)
            </h4>
            <p className="text-slate-400 leading-relaxed">
              ضع المفاتيح التالية في لوحة **Secrets / Environment Variables** في بيئة التطوير أو في ملف <code className="text-emerald-400 font-mono">.env</code>:
            </p>

            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 font-mono text-emerald-300 space-y-1 dir-ltr text-left">
              <div>VITE_SUPABASE_URL="https://your-project.supabase.co"</div>
              <div>VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiI..."</div>
            </div>
          </div>

          {/* Step 2: SQL Tables Setup */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-200 flex items-center gap-2 text-sm">
                <Database className="w-4 h-4 text-cyan-400" />
                2. إنشاء الجداول في Supabase SQL Editor
              </h4>
              <button
                onClick={handleCopySql}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer font-sans text-xs"
              >
                <Copy className="w-3.5 h-3.5 text-cyan-400" />
                <span>{copied ? 'تم النسخ!' : 'نسخ كود SQL'}</span>
              </button>
            </div>
            <p className="text-slate-400 leading-relaxed">
              افتح محرر SQL في موقع Supabase والصق الكود التالي لإنشاء جدول المنتجات وجدول الفواتير تلقائياً:
            </p>

            <pre className="bg-slate-900 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 max-h-36 overflow-y-auto dir-ltr text-left">
              {SUPABASE_SQL_SCHEMA}
            </pre>
          </div>

          {/* Step 3: Clear or Sync Products */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
            <h4 className="font-bold text-slate-200 flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-amber-400" />
              3. التحكم في الأصناف والبيانات
            </h4>
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
              <div>
                <div className="text-slate-200 font-bold">عدد المنتجات الحالية بالنظام: {productsCount}</div>
                <div className="text-slate-400 text-[11px]">
                  {productsCount === 0 ? 'القائمة فارغة (جاهز لإدخال أصناف جديدة أو الجلب من Supabase)' : 'يوجد منتجات حالياً'}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onSyncSupabase}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>جلب الأصناف من Supabase</span>
                </button>

                <button
                  onClick={onClearAllProducts}
                  className="px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/60 font-bold rounded-lg transition-colors cursor-pointer"
                >
                  تفريغ الأصناف (البدء بجدول فارغ)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
