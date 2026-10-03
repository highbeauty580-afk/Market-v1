import React, { useState, useEffect } from 'react';
import { 
  getSupabaseCredentials, 
  saveSupabaseCredentials, 
  clearSupabaseCredentials, 
  SUPABASE_SQL_SCHEMA,
  testSupabaseConnection,
  pushAllLocalProductsToSupabase,
  pushAllLocalOrdersToSupabase
} from '../lib/supabase';
import { Product, Order } from '../types/pos';
import { X, Database, CheckCircle2, AlertCircle, Copy, Key, Sparkles, RefreshCw, Save, Trash2, Upload, Activity } from 'lucide-react';

interface SupabaseConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncSupabase: () => void;
  onClearAllProducts: () => void;
  productsCount: number;
  productsList: Product[];
  ordersList: Order[];
}

export const SupabaseConnectModal: React.FC<SupabaseConnectModalProps> = ({
  isOpen,
  onClose,
  onSyncSupabase,
  onClearAllProducts,
  productsCount,
  productsList,
  ordersList,
}) => {
  const [copied, setCopied] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string }>({});

  useEffect(() => {
    if (isOpen) {
      const creds = getSupabaseCredentials();
      setUrlInput(creds.url);
      setKeyInput(creds.key);
      setIsSaved(creds.isConfigured);
      setUploadMessage('');
      setTestResult({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveAndTestCredentials = async () => {
    if (!urlInput.trim() || !keyInput.trim()) {
      alert('يرجى إدخال رابط المشروع (Supabase URL) ومفتاح (Anon Key) أولاً.');
      return;
    }

    setIsTesting(true);
    setTestResult({});

    saveSupabaseCredentials(urlInput.trim(), keyInput.trim());
    
    // Live Read/Write Connection Test
    const testRes = await testSupabaseConnection();
    setIsTesting(false);
    setTestResult(testRes);

    if (testRes.success) {
      setIsSaved(true);
      onSyncSupabase();
    } else {
      setIsSaved(false);
    }
  };

  const handleClearCredentials = () => {
    if (confirm('هل أنت متأكد من إزالة مفاتيح الربط المحفوظة؟')) {
      clearSupabaseCredentials();
      setUrlInput('');
      setKeyInput('');
      setIsSaved(false);
      setTestResult({});
      alert('تم إزالة المفاتيح المحفوظة.');
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUploadAllToSupabase = async () => {
    if (!isSaved) {
      alert('يرجى حفظ واختبار الاتصال بـ Supabase بنجاح أولاً.');
      return;
    }
    setIsUploading(true);
    setUploadMessage('جاري رفع كافة المنتجات والفواتير المحلية إلى Supabase...');

    try {
      const prodRes = await pushAllLocalProductsToSupabase(productsList);
      const orderRes = await pushAllLocalOrdersToSupabase(ordersList);
      setUploadMessage(
        `تم بنجاح رفع ${prodRes.success} منتج و ${orderRes.success} فاتورة إلى Supabase! (فشل: ${prodRes.failed + orderRes.failed})`
      );
      onSyncSupabase();
    } catch {
      setUploadMessage('حدث خطأ أثناء الرفع إلى Supabase.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span>ربط قاعدة البيانات السحابية Supabase (PostgreSQL)</span>
                {isSaved ? (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border border-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> متصل ومربوط
                  </span>
                ) : (
                  <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border border-amber-300 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-amber-600" /> غير متصل
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500">مزامنة حية ولحظية بين الكمبيوتر والهواتف من رابط Vercel</p>
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
          {/* Step 1: Input Credentials & Live Test */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3 shadow-xs">
            <h4 className="font-extrabold text-slate-900 flex items-center gap-2 text-sm">
              <Key className="w-4 h-4 text-emerald-600" />
              1. إدخال بيانات الاتصال بالسحابة (Supabase Credentials)
            </h4>
            <p className="text-slate-600 leading-relaxed font-medium">
              أدخل رابط مشروعك والمفتاح الخاص بـ Supabase لمزامنة كافة الأجهزة والهواتف مع نفس السحابة:
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  رابط المشروع (Supabase URL)
                </label>
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://xxxxxx.supabase.co"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-left dir-ltr"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  المفتاح العام (Supabase Anon Key)
                </label>
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiI..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-left dir-ltr"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleSaveAndTestCredentials}
                  disabled={isTesting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                >
                  <Activity className="w-4 h-4" />
                  <span>{isTesting ? 'جاري اختبار الاتصال بالقراءة والكتابة...' : 'حفظ واختبار الاتصال حياً'}</span>
                </button>

                {isSaved && (
                  <button
                    onClick={handleClearCredentials}
                    className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>مسح المفاتيح المحفوظة</span>
                  </button>
                )}
              </div>

              {testResult.message && (
                <div
                  className={`p-3 rounded-xl border text-[11px] font-bold flex items-center gap-2 ${
                    testResult.success
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-rose-50 border-rose-300 text-rose-800'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}
            </div>
          </div>

          {/* Step 2: SQL Tables Setup */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-slate-900 flex items-center gap-2 text-sm">
                <Database className="w-4 h-4 text-cyan-600" />
                2. إنشاء الجداول بضغطة زر واحدة (Supabase SQL Editor)
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
              انسخ كود SQL التالي، ثم الصقه في صفحة **SQL Editor** بداخل موقع Supabase واضغط **Run** لإنشاء الجداول وسياسات الأمان تلقائياً:
            </p>

            <pre className="bg-slate-900 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-200 max-h-36 overflow-y-auto dir-ltr text-left">
              {SUPABASE_SQL_SCHEMA}
            </pre>
          </div>

          {/* Step 3: Batch Migration */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3 shadow-xs">
            <h4 className="font-extrabold text-slate-900 flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-amber-600" />
              3. نقل ونقل البيانات الحالية إلى السحابة الموحدة
            </h4>
            <p className="text-slate-600 leading-relaxed font-medium">
              اضغط الزر أدناه لرفع كافة منتجات وفواتير جهازك الحالي فوراً إلى Supabase لكي تظهر على الهاتف وباقي الأجهزة:
            </p>

            {uploadMessage && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold rounded-xl text-[11px]">
                {uploadMessage}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
              <div>
                <div className="text-slate-900 font-extrabold">المنتجات بالحافظة الحالية: {productsCount}</div>
                <div className="text-slate-500 text-[11px]">
                  الفواتير الحالية بالنظام: {ordersList.length}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleUploadAllToSupabase}
                  disabled={isUploading || !isSaved}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1 shadow-md shadow-indigo-600/20"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>رفع ورَفْع البيانات لـ Supabase</span>
                </button>

                <button
                  onClick={onSyncSupabase}
                  disabled={!isSaved}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1 shadow-md shadow-emerald-600/20"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>سحب القراءة المباشرة من Supabase</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium">
            {isSaved ? '✅ الاتصال بالسحابة فعال وجميع الأجهزة تتشارك نفس البيانات' : '⚠️ لم يتم تأكيد الاتصال بالسحابة بعد'}
          </span>
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
