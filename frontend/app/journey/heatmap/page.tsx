'use client';

import { useMemo } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { InnerLedgerABI } from '@/lib/abis/InnerLedger';
import { CONTRACTS } from '@/lib/contracts/addresses';
import { Header } from '@/components/Header';
import { RequireWallet } from '@/components/RequireWallet';

interface LedgerRecord {
  contentHash: `0x${string}`;
  timestamp: bigint;
  emotion: string;
  user: `0x${string}`;
}

const weekdayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getIntensityClass = (count: number) => {
  if (count >= 5) {
    return 'bg-cyan-400 shadow-[0_0_14px_rgba(34,211,238,0.75)]';
  }
  if (count >= 3) {
    return 'bg-fuchsia-400 shadow-[0_0_14px_rgba(232,121,249,0.7)]';
  }
  if (count >= 1) {
    return 'bg-fuchsia-500/70 shadow-[0_0_12px_rgba(217,70,239,0.6)]';
  }
  return 'bg-white/5';
};

export default function JourneyHeatmapPage() {
  const { address, isConnected } = useAccount();
  const { data: journeyData } = useReadContract({
    address: CONTRACTS.INNER_LEDGER,
    abi: InnerLedgerABI,
    functionName: 'getJourney',
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

  const months = useMemo(() => {
    const now = new Date();
    const list: Array<{ year: number; month: number }> = [];
    for (let offset = 0; offset <= 2; offset += 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      list.push({ year: date.getFullYear(), month: date.getMonth() });
    }
    return list;
  }, []);

  if (!isConnected) {
    return <RequireWallet />;
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden overflow-y-auto pb-24 text-slate-100 selection:bg-primary/30">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-56 h-56 bg-primary/10 rounded-full blur-[60px] -top-10 -left-8" />
        <div className="absolute w-72 h-72 bg-primary/15 rounded-full blur-[80px] top-28 right-0" />
        <div className="absolute w-80 h-80 bg-primary/10 rounded-full blur-[90px] bottom-10 left-1/3" />
      </div>

      <Header title="Heatmap" backHref="/journey" />

      <div className="relative z-10 px-8 pt-10 pb-6 text-center">
        <h2 className="text-[32px] lg:text-[40px] font-extralight tracking-tight leading-[1.15]">
          最近三个月的
          <span className="font-bold text-primary italic"> 心绪热力 </span>
        </h2>
        <p className="mt-4 text-slate-500 text-[10px] tracking-[0.3em] uppercase">
          Last 3 Months
        </p>
      </div>

      <div className="relative z-10 px-6 space-y-12">
        <div className="border-b border-white/10 pb-6">
          <div className="flex flex-wrap items-center justify-center gap-8 text-xs text-slate-500">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_14px_rgba(34,211,238,0.75)]" />
              高沉淀
            </div>
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-fuchsia-400 shadow-[0_0_14px_rgba(232,121,249,0.7)]" />
              中沉淀
            </div>
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-fuchsia-500/70 shadow-[0_0_12px_rgba(217,70,239,0.6)]" />
              低沉淀
            </div>
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-white/5" />
              无记录
            </div>
          </div>
        </div>
        {months.map(({ year, month }) => {
          const monthStart = new Date(year, month, 1);
          const daysInMonth = new Date(year, month + 1, 0).getDate();
          const firstWeekday = monthStart.getDay();
          const monthLabel = monthStart.toLocaleDateString('zh-CN', {
            month: 'long',
          });
          const monthTitle = monthStart.toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
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
              return {
                key,
                count,
                className: getIntensityClass(count),
              };
            },
          );

          return (
            <section key={`${year}-${month}`} className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">
                  {monthLabel}
                </h3>
                <span className="text-xs tracking-widest text-slate-500 uppercase">
                  {monthTitle}
                </span>
              </div>

              <div className="grid grid-cols-7 gap-4 text-[10px] text-slate-500 tracking-widest uppercase">
                {weekdayLabels.map((label, index) => (
                  <span key={`${year}-${month}-${index}`} className="text-center">
                    {label}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-4">
                {cells.map((cell, index) =>
                  cell ? (
                    <div
                      key={cell.key}
                      className={`w-5 h-5 rounded-full ${cell.className}`}
                      title={`${cell.key} · ${cell.count}`}
                    />
                  ) : (
                    <div key={`empty-${index}`} className="w-5 h-5" />
                  ),
                )}
              </div>
            </section>
          );
        })}

      </div>
    </div>
  );
}
