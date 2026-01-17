'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { motion } from 'framer-motion';
import { ExternalLink, ScrollText } from 'lucide-react';
import { InnerLedgerABI } from '@/lib/abis/InnerLedger';
import { CONTRACTS } from '@/lib/contracts/addresses';
import { decodeBase64, decryptText } from '@/lib/crypto';
import { Header } from '@/components/Header';
import { RequireWallet } from '@/components/RequireWallet';

interface LedgerRecord {
  contentHash: `0x${string}`;
  timestamp: bigint;
  emotion: string;
  user: `0x${string}`;
}

export default function JourneyEntriesPage() {
  const { address, isConnected } = useAccount();
  const [txByContentHash, setTxByContentHash] = useState<
    Record<string, `0x${string}`>
  >({});
  const [previewByContentHash, setPreviewByContentHash] = useState<
    Record<string, string>
  >({});
  const graphEndpoint = process.env.NEXT_PUBLIC_GRAPH_ENDPOINT;

  const { data: journeyData, isLoading: isLoadingJourney } = useReadContract({
    address: CONTRACTS.INNER_LEDGER,
    abi: InnerLedgerABI,
    functionName: 'getJourney',
    args: address ? [address] : undefined,
  });

  const records = useMemo(
    () => (journeyData as LedgerRecord[]) || [],
    [journeyData],
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
          const parsed = JSON.parse(raw) as {
            ciphertext?: string;
            iv?: string;
          };
          if (!parsed.ciphertext || !parsed.iv) {
            continue;
          }
          const ciphertext = decodeBase64(parsed.ciphertext);
          const iv = decodeBase64(parsed.iv);
          const plaintext = await decryptText(ciphertext, iv);
          next[record.contentHash.toLowerCase()] = plaintext;
        } catch (error) {
          console.warn('Failed to decrypt record', error);
          localStorage.removeItem(storageKey);
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
    return <RequireWallet />;
  }

  return (
    <div className="relative min-h-screen w-full overflow-y-auto overflow-x-hidden pb-24 text-slate-100 selection:bg-primary/30">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-56 h-56 bg-primary/10 rounded-full blur-[60px] -top-10 -left-8" />
        <div className="absolute w-72 h-72 bg-primary/15 rounded-full blur-[80px] top-28 right-0" />
        <div className="absolute w-80 h-80 bg-primary/10 rounded-full blur-[90px] bottom-10 left-1/3" />
      </div>

      <Header title="Journey Entries" backHref="/journey" />

      <div className="relative z-10 px-6 pt-10">
        <div className="flex items-center justify-between mb-6">
          <p className="text-[10px] tracking-[0.3em] uppercase text-slate-500">
            Entries
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
