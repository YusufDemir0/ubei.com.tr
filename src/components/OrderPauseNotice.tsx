import React from 'react';
import { PauseCircle } from 'lucide-react';
import { ORDERS_PAUSED, ORDERS_PAUSED_TEXT, ORDERS_PAUSED_TITLE } from '../lib/storeStatus';

/** Sipariş alımı kapalıyken satış adımlarında gösterilen uyarı. */
export default function OrderPauseNotice({ compact = false }: { compact?: boolean }) {
  if (!ORDERS_PAUSED) return null;
  return (
    <div role="status" className="flex gap-3 rounded-xs border border-signal/30 bg-signal/5 p-3.5 text-ink">
      <PauseCircle className="h-5 w-5 shrink-0 text-signal" aria-hidden="true" />
      <div className="space-y-0.5">
        <p className="text-sm font-semibold">{ORDERS_PAUSED_TITLE}</p>
        {!compact && <p className="text-xs leading-relaxed text-neutral-700">{ORDERS_PAUSED_TEXT}</p>}
      </div>
    </div>
  );
}
