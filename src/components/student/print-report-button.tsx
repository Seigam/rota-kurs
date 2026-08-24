'use client';

import { Printer } from 'lucide-react';

export function PrintReportButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="glow-button flex min-h-11 items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-lg"
    >
      <Printer className="size-4" aria-hidden="true" />
      <span>Raporu yazdır / PDF</span>
    </button>
  );
}
