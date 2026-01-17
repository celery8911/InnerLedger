'use client';

import { useMemo } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { InnerLedgerABI } from '@/lib/abis/InnerLedger';
import { GrowthSBTABI } from '@/lib/abis/GrowthSBT';
import { CONTRACTS } from '@/lib/contracts/addresses';
import { Header } from '@/components/Header';
import { RequireWallet } from '@/components/RequireWallet';

interface LedgerRecord {
  contentHash: `0x${string}`;
  timestamp: bigint;
  emotion: string;
  user: `0x${string}`;
}

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function JourneyPage() {
  const { address, isConnected } = useAccount();
  // 获取真实的旅程记录
  const { data: journeyData } = useReadContract({
    address: CONTRACTS.INNER_LEDGER,
    abi: InnerLedgerABI,
    functionName: 'getJourney',
    args: address ? [address] : undefined,
  });

  // 获取 SBT 余额
  const { data: sbtBalance } = useReadContract({
    address: CONTRACTS.GROWTH_SBT,
    abi: GrowthSBTABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const records = useMemo(
    () => (journeyData as LedgerRecord[]) || [],
    [journeyData],
  );
  const countsByDay = useMemo(() => {
    const map: Record<string, number> = {};
    for (const record of records) {
      const date = new Date(Number(record.timestamp) * 1000);
      const key = formatDateKey(date);
      map[key] = (map[key] || 0) + 1;
    }
    return map;
  }, [records]);
  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
      }),
    [],
  );

  if (!isConnected) {
    return <RequireWallet />;
  }

  return (
    <div className="relative min-h-screen w-full overflow-y-auto overflow-x-hidden pb-24 text-slate-100 selection:bg-primary/30">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-56 h-56 bg-primary/10 rounded-full blur-[60px] -top-10 -left-8" />
        <div className="absolute w-72 h-72 bg-primary/15 rounded-full blur-[80px] top-28 right-0" />
        <div className="absolute w-80 h-80 bg-primary/10 rounded-full blur-[90px] bottom-10 left-1/3" />
      </div>

      <Header title="成长履历" backHref="/" />

      <div className="relative z-10 px-8 pt-10 pb-6 text-center">
        <h2 className="text-[32px] lg:text-[40px] font-extralight tracking-tight leading-[1.15]">
          你已保存{' '}
          <span className="font-bold text-primary italic">
            {records.length}
          </span>{' '}
          个当下
        </h2>
        <p className="mt-4 text-slate-500 text-[10px] tracking-[0.3em] uppercase">
          {todayLabel}
        </p>
      </div>

      <div className="relative z-10 grid grid-cols-2 gap-4 px-6 py-4">
        <Link
          href="/journey/entries"
          className="group bg-primary/5 rounded-2xl p-6 border border-primary/10 shadow-sm backdrop-blur-sm hover:border-primary/30 transition-colors"
        >
          <div className="flex items-center justify-between text-sm uppercase tracking-[0.35em] text-slate-200 mb-3">
            <span>留存时刻</span>
            <ArrowRight
              size={16}
              className="text-primary/70 transition-transform duration-300 animate-pulse group-hover:translate-x-1 group-hover:-translate-y-0.5 group-hover:text-primary"
            />
          </div>
          <div className="text-[36px] font-light italic text-slate-100">
            {records.length}
          </div>
        </Link>
        <Link
          href="/gallery"
          className="group bg-primary/5 rounded-2xl p-6 border border-primary/10 shadow-sm backdrop-blur-sm hover:border-primary/30 transition-colors"
        >
          <div className="flex items-center justify-between text-sm uppercase tracking-[0.35em] text-slate-200 mb-3">
            <span>里程徽章</span>
            <ArrowRight
              size={16}
              className="text-primary/70 transition-transform duration-300 animate-pulse group-hover:translate-x-1 group-hover:-translate-y-0.5 group-hover:text-primary"
            />
          </div>
          <div className="text-[36px] font-light italic text-slate-100">
            {Number(sbtBalance || 0)}
          </div>
        </Link>
      </div>

      <div className="relative z-10 px-6 pt-6">
        <div className="border-t border-white/10 mb-6" />
        <Link
          href="/journey/heatmap"
          className="group block mt-2 pb-8 text-center"
        >
          <p className="text-[10px] tracking-[0.3em] uppercase text-slate-500 mb-6 group-hover:text-slate-300 transition-colors">
            Monthly Heatmap
          </p>
          <div className="neon-border-card rounded-2xl px-4 py-5 text-left">
            {(() => {
              const now = new Date();
              const year = now.getFullYear();
              const month = now.getMonth();
              const monthStart = new Date(year, month, 1);
              const daysInMonth = new Date(year, month + 1, 0).getDate();
              const firstWeekday = monthStart.getDay();
              const monthLabel = monthStart.toLocaleDateString('zh-CN', {
                month: 'long',
              });
              const cells = Array.from(
                { length: firstWeekday + daysInMonth },
                (_, index) => {
                  if (index < firstWeekday) {
                    return null;
                  }
                  const day = index - firstWeekday + 1;
                  const date = new Date(year, month, day);
                  const key = formatDateKey(date);
                  const count = countsByDay[key] || 0;
                  let className = 'bg-white/5';
                  if (count >= 5) {
                    className =
                      'bg-cyan-400 shadow-[0_0_14px_rgba(34,211,238,0.75)]';
                  } else if (count >= 3) {
                    className =
                      'bg-fuchsia-400 shadow-[0_0_14px_rgba(232,121,249,0.7)]';
                  } else if (count >= 1) {
                    className =
                      'bg-fuchsia-500/70 shadow-[0_0_12px_rgba(217,70,239,0.6)]';
                  }
                  return { key, count, className };
                },
              );

              return (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">
                      {monthLabel}
                    </h3>
                    <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
                      Heatmap
                    </span>
                  </div>
                  <div className="grid grid-cols-7 gap-3 text-[10px] text-slate-500 tracking-widest uppercase">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                      (label) => (
                        <span key={label} className="text-center">
                          {label}
                        </span>
                      ),
                    )}
                  </div>
                  <div className="grid grid-cols-7 gap-3">
                    {cells.map((cell, index) =>
                      cell ? (
                        <div
                          key={cell.key}
                          className={`h-5 w-5 rounded-md ${cell.className}`}
                          title={`${cell.key} · ${cell.count}`}
                        />
                      ) : (
                        <div key={`empty-${index}`} className="h-5 w-5" />
                      ),
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </Link>
      </div>
    </div>
  );
}
