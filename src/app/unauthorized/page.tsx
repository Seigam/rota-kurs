'use client';

import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-6 text-center">
      <div className="glass-panel max-w-md w-full p-8 rounded-3xl border border-red-500/20 space-y-6 shadow-2xl">
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto border border-red-500/20 text-red-400">
          <ShieldAlert className="w-8 h-8 animate-bounce" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Erişim Yetkiniz Bulunmuyor</h1>
          <p className="text-sm text-gray-400 leading-relaxed">
            Bu bölüme girmek için hesabınızın gerekli rol yetkisi (Öğrenci, Rehber Öğretmen veya Yönetici) bulunmamaktadır.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-sm flex items-center justify-center gap-2 transition-all"
          >
            <Home className="w-4 h-4" />
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  );
}
