'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, ScrollText } from 'lucide-react';
import { InnerLedgerABI } from '@/lib/abis/InnerLedger';
import { GrowthSBTABI } from '@/lib/abis/GrowthSBT';
import { CONTRACTS } from '@/lib/contracts/addresses';
import { decodeBase64, decryptText } from '@/lib/crypto';

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
  const [txByContentHash, setTxByContentHash] = useState<
    Record<string, `0x${string}`>
  >({});
  const [previewByContentHash, setPreviewByContentHash] = useState<
    Record<string, string>
  >({});
  const graphEndpoint = process.env.NEXT_PUBLIC_GRAPH_ENDPOINT;

  // 获取真实的旅程记录
  const { data: journeyData, isLoading: isLoadingJourney } = useReadContract({
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
    [journeyData]
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
    []
  );

  useEffect(() => {
    if (!address || !graphEndpoint) return;
    let cancelled = false;

    const fetchTxHashes = async () => {
      try {
        const query = `
          query ($user: Bytes!) {
            recordCreateds(where: { user: $user }) {
              contentHash
              transactionHash
            }
          }
        `;
        const res = await fetch(graphEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query,
            variables: { user: address.toLowerCase() },
          }),
        });
        const { data, errors } = await res.json();
        if (errors) {
          console.error('Subgraph errors', errors);
          return;
        }

        if (cancelled) return;
        const next: Record<string, `0x${string}`> = {};
        for (const item of data?.recordCreateds || []) {
          const contentHash = String(item.contentHash || '').toLowerCase();
          const transactionHash = String(item.transactionHash || '');
          if (contentHash && transactionHash) {
            next[contentHash] = transactionHash as `0x${string}`;
          }
        }
        setTxByContentHash(next);
      } catch (error) {
        console.error('Failed to load record tx hashes', error);
      }
    };

    fetchTxHashes();
    return () => {
      cancelled = true;
    };
  }, [address, graphEndpoint]);

  useEffect(() => {
    if (records.length === 0) return;
    let cancelled = false;

    const loadPreviews = async () => {
      const next: Record<string, string> = {};
      for (const record of records) {
        const storageKey = `innerledger:record:${record.contentHash}`;
        const raw = localStorage.getItem(storageKey);
        if (!raw) continue;
        try {
          const parsed = JSON.parse(raw) as { ciphertext: string; iv: string };
          const ciphertext = decodeBase64(parsed.ciphertext);
          const iv = decodeBase64(parsed.iv);
          const plaintext = await decryptText(ciphertext, iv);
          next[record.contentHash.toLowerCase()] = plaintext;
        } catch (error) {
          console.error('Failed to decrypt record', error);
        }
      }

      if (cancelled) return;
      setPreviewByContentHash(next);
    };

    loadPreviews();
    return () => {
      cancelled = true;
    };
  }, [records]);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-6 text-white/80">
        <h2 className="text-2xl font-light tracking-wide">请连接钱包查看</h2>
        <ConnectButton />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-y-auto overflow-x-hidden pb-24 text-slate-100 selection:bg-primary/30">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-56 h-56 bg-primary/10 rounded-full blur-[60px] -top-10 -left-8" />
        <div className="absolute w-72 h-72 bg-primary/15 rounded-full blur-[80px] top-28 right-0" />
        <div className="absolute w-80 h-80 bg-primary/10 rounded-full blur-[90px] bottom-10 left-1/3" />
      </div>

      <header className="relative z-10 px-6 pt-8 flex items-center justify-between">
        <Link
          href="/"
          className="p-2 -ml-2 rounded-full hover:bg-white/5 transition-colors group"
        >
          <ArrowLeft className="text-primary/70 group-hover:text-primary transition-colors" />
        </Link>
        <h1 className="text-xs uppercase tracking-[0.4em] text-slate-500">
          成长履历
        </h1>
        <div className="w-9" />
      </header>

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
        <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 shadow-sm backdrop-blur-sm">
          <div className="text-xs uppercase tracking-[0.3em] text-slate-300 mb-3">
            留存时刻
          </div>
          <div className="text-3xl font-light italic text-slate-100">
            {records.length}
          </div>
        </div>
        <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 shadow-sm backdrop-blur-sm">
          <Link href="/gallery">
            <div className="text-xs uppercase tracking-[0.3em] text-slate-300 mb-3">
              里程徽章
            </div>
            <div className="text-3xl font-light italic text-slate-100">
              {Number(sbtBalance || 0)}
            </div>
          </Link>
        </div>
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
                }
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
                      )
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
                      )
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </Link>
        <div className="border-t border-white/10 mb-6" />

        <div className="flex items-center justify-between mb-6">
          <p className="text-[10px] tracking-[0.3em] uppercase text-slate-500">
            Journey Entries
          </p>
          <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-widest">
            <ScrollText size={10} className="text-primary/70" />
            {records.length} Total
          </div>
        </div>

        {isLoadingJourney ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : records.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-slate-400 font-light">
              还没有留存过此刻。回主页倾诉一下吧。
            </p>
          </div>
        ) : (
          <div className="space-y-6 pb-12">
            {[...records].reverse().map((record, index) => {
              const dateObj = new Date(Number(record.timestamp) * 1000);
              const date = dateObj.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });
              const time = dateObj.toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="bg-primary/5 rounded-2xl p-6 border border-primary/10 shadow-sm backdrop-blur-sm"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{record.emotion}</span>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-100">
                          {date}
                        </span>
                        <span className="text-xs text-slate-400 tracking-tight">
                          {time}
                        </span>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                      <ScrollText size={10} className="text-primary/70" />
                      <span>#{records.length - index}</span>
                    </div>
                  </div>

                  <div className="space-y-4 border-t border-dashed border-white/10 pt-4 mt-4">
                    {previewByContentHash[record.contentHash.toLowerCase()] ? (
                      <div className="text-slate-200 text-sm leading-relaxed font-light tracking-wide">
                        <span className="text-slate-400 text-[10px] block mb-1 uppercase tracking-widest">
                          Reflection
                        </span>
                        {previewByContentHash[record.contentHash.toLowerCase()]}
                      </div>
                    ) : (
                      <div className="text-slate-300 text-xs leading-relaxed font-light tracking-wide break-all">
                        <span className="text-slate-400 text-[10px] block mb-1 uppercase tracking-widest">
                          Blockchain Hash
                        </span>
                        {record.contentHash}
                      </div>
                    )}

                    {txByContentHash[record.contentHash.toLowerCase()] ? (
                      <a
                        href={`https://testnet.monadexplorer.com/tx/${
                          txByContentHash[record.contentHash.toLowerCase()]
                        }`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-[10px] text-primary/70 hover:text-primary transition-colors uppercase tracking-widest group/link"
                      >
                        Verify On Monad{' '}
                        <ExternalLink
                          size={8}
                          className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform"
                        />
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[10px] text-slate-500 uppercase tracking-widest">
                        Tx Unavailable
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
