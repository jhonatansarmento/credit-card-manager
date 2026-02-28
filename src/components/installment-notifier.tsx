'use client';

import { useEffect } from 'react';

export default function InstallmentNotifier() {
  useEffect(() => {
    if (!('Notification' in window)) return;

    const checkUpcoming = async () => {
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }

      if (Notification.permission !== 'granted') return;

      try {
        const res = await fetch('/api/debts?pageSize=100');
        if (!res.ok) return;

        const result = await res.json();
        const today = new Date();
        const threeDaysFromNow = new Date(
          today.getTime() + 3 * 24 * 60 * 60 * 1000,
        );

        let upcomingCount = 0;
        for (const debt of result.data ?? []) {
          for (const inst of debt.installments ?? []) {
            const dueDate = new Date(inst.dueDate);
            if (
              !inst.isPaid &&
              dueDate >= today &&
              dueDate <= threeDaysFromNow
            ) {
              upcomingCount++;
            }
          }
        }

        if (upcomingCount > 0) {
          new Notification('Parcelas próximas do vencimento', {
            body: `Você tem ${upcomingCount} parcela${upcomingCount > 1 ? 's' : ''} vencendo nos próximos 3 dias.`,
            icon: '/icons/icon-192x192.svg',
            tag: 'upcoming-installments',
          });
        }
      } catch {
        // silently fail
      }
    };

    // Check after a short delay on mount
    const timeout = setTimeout(checkUpcoming, 5000);
    return () => clearTimeout(timeout);
  }, []);

  return null;
}
