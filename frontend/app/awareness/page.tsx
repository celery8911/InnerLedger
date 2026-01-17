'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Typewriter } from '@/components/Typewriter';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { InnerLedgerABI } from '@/lib/abis/InnerLedger';
import { keccak256, toHex } from 'viem';
import { encryptText, encodeBase64 } from '@/lib/crypto';
import { Header } from '@/components/Header';
import { RequireWallet } from '@/components/RequireWallet';

const INNER_LEDGER_ADDRESS =
  '0x622a9E2c8E13B930C54D4263A00ee4BAC2930e3D' as const;

export default function AwarenessPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [reflection, setReflection] = useState('');
  const [emotion, setEmotion] = useState<string | null>(null);
  const [step, setStep] = useState<
    | 'input'
    | 'processing'
    | 'ai_response'
    | 'ready_to_mint'
    | 'minting'
    | 'success'
  >('input');
  const [aiResponse, setAiResponse] = useState('');
  const [skipConfirmed, setSkipConfirmed] = useState(false);
  const [ignoreHash, setIgnoreHash] = useState(false);

  const {
    data: hash,
    isPending: isMinting,
    writeContract,
  } = useWriteContract();
  const effectiveHash = ignoreHash ? undefined : hash;
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: effectiveHash,
    });

  const resolvedStep = skipConfirmed ? step : isConfirmed ? 'success' : step;

  const handleAIAnalysis = async () => {
    if (!reflection || !emotion) return;
    setSkipConfirmed(false);
    setStep('processing');
    const emotionLabel =
      emotion === '😊' ? '积极' : emotion === '😐' ? '中性' : '消极';
    const userInput = `心情：${emotionLabel}\n\n${reflection}`;

    try {
      const res = await fetch('/api/ai/understand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput }),
      });
      const data = await res.json();
      setAiResponse(data.aiResponse || '我听到了。');
      setStep('ai_response');
    } catch (e) {
      console.error(e);
      setAiResponse('（点头示意）');
      setStep('ai_response');
    }
  };

  const handleMint = async () => {
    if (!address || !emotion) return;
    try {
      setSkipConfirmed(false);
      setIgnoreHash(false);
      const { ciphertext, iv } = await encryptText(reflection);
      const contentHash = keccak256(toHex(ciphertext));
      const storageKey = `innerledger:record:${contentHash}`;
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          ciphertext: encodeBase64(ciphertext),
          iv: encodeBase64(iv),
          createdAt: Date.now(),
        })
      );
      writeContract({
        address: INNER_LEDGER_ADDRESS,
        abi: InnerLedgerABI,
        functionName: 'createRecord',
        args: [emotion, contentHash],
      });
    } catch (error) {
      console.error('Failed to encrypt record', error);
    }
  };

  if (!isConnected) {
    return <RequireWallet />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-6 pt-24 max-w-2xl mx-auto selection:bg-primary/30">
      <Header backHref="/" overlay showConnectButton={false} />

      <AnimatePresence mode="wait">
        {resolvedStep === 'input' && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full space-y-8 relative z-10"
          >
            <h1 className="text-3xl md:text-4xl font-light text-transparent bg-clip-text bg-gradient-to-r from-white/90 to-primary/70">
              刚才{' '}
              <span className="text-primary font-serif italic mx-2">
                此时此刻
              </span>
              <br />
              有什么被你注意到了？
            </h1>

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-white/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
              <textarea
                className="relative w-full h-48 p-8 rounded-2xl bg-white/5 border border-white/10 shadow-inner resize-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 outline-none text-lg text-white/80 placeholder-white/30 transition-all font-light leading-relaxed"
                placeholder="例如：呼吸变慢了，或者感受到了一丝焦虑..."
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
              />
            </div>

            <div className="flex justify-center gap-8 py-4">
              {['😊', '😐', '😔'].map((e) => (
                <button
                  key={e}
                  onClick={() => setEmotion(e)}
                  className={`text-4xl p-4 rounded-full transition-all duration-300 ${
                    emotion === e
                      ? 'bg-primary/15 shadow-[0_0_20px_rgba(82,122,119,0.25)] scale-110'
                      : 'hover:bg-white/5 opacity-40 hover:opacity-100 grayscale hover:grayscale-0'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleAIAnalysis}
                disabled={!reflection || !emotion}
                className="rounded-full px-10 py-6 text-xs bg-primary/80 hover:bg-primary text-white/90 shadow-[0_0_20px_rgba(82,122,119,0.25)] hover:shadow-[0_0_30px_rgba(82,122,119,0.45)] disabled:opacity-30 disabled:hover:shadow-none transition-all"
              >
                倾诉
              </Button>
            </div>
          </motion.div>
        )}

        {resolvedStep === 'processing' && (
          <motion.div
            key="processing"
            className="flex flex-col items-center justify-center space-y-6 pt-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="relative">
              <div className="w-16 h-16 border-2 border-primary/20 rounded-full animate-ping absolute inset-0" />
              <div className="w-16 h-16 border-2 border-t-primary rounded-full animate-spin relative z-10" />
            </div>
            <p className="text-white/50 font-light tracking-[0.3em] text-xs uppercase">
              倾听中...
            </p>
          </motion.div>
        )}

        {resolvedStep === 'ai_response' && (
          <motion.div
            key="ai-response"
            className="w-full space-y-8 pt-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="glass-card p-10 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary/60" />
              <Typewriter
                text={aiResponse}
                onComplete={() =>
                  setTimeout(() => setStep('ready_to_mint'), 1500)
                }
              />
            </div>
          </motion.div>
        )}

        {(resolvedStep === 'ready_to_mint' || resolvedStep === 'minting') && (
          <motion.div
            key="mint"
            className="w-full space-y-8 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="glass-card p-8 text-left mb-8 border-l-4 border-l-primary/60">
              <p className="text-white/80 font-serif text-lg leading-relaxed">
                {aiResponse}
              </p>
            </div>

            <div className="glass-card p-8 text-left border border-white/10">
              <p className="text-white/70 text-xs tracking-[0.3em] uppercase mb-4 flex items-center gap-2">
                你的记录
                <span className="text-base">{emotion}</span>
              </p>
              <p className="text-white/80 font-light leading-relaxed whitespace-pre-wrap">
                {reflection}
              </p>
            </div>

            <p className="text-white/60 text-sm font-light">
              这就是你当下的真实形状。
              <br />
              要将它永久铭刻在 InnerLedger 上吗？
            </p>

            <Button
              onClick={handleMint}
              disabled={isMinting || isConfirming || !address}
              className="w-full rounded-full py-6 text-sm font-semibold tracking-[0.12em] bg-white/90 text-white hover:bg-white shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all hover:scale-[1.01]"
            >
              {isMinting || isConfirming ? (
                <Loader2 className="animate-spin mr-2" />
              ) : (
                <CheckCircle2 className="mr-2" />
              )}
              {isMinting
                ? '钱包确认中...'
                : isConfirming
                ? '区块确认中...'
                : '永久铭刻 (Mint to Monad)'}
            </Button>

            <button
              onClick={() => router.push('/')}
              disabled={isMinting}
              className="w-full mt-[-5px] py-4 text-white/50 hover:text-white transition-colors text-xs font-light tracking-[0.3em] uppercase mt-2 hover:bg-white/5 rounded-full"
            >
              放下此刻 (Let it go)
            </button>

            {effectiveHash && (
              <a
                href={`https://testnet.monadexplorer.com/tx/${effectiveHash}`}
                target="_blank"
                rel="noreferrer"
                className="block text-[10px] text-primary/70 mt-4 truncate hover:text-primary transition-colors"
              >
                Tx: {effectiveHash}
              </a>
            )}
          </motion.div>
        )}

        {resolvedStep === 'success' && (
          <motion.div
            key="success"
            className="w-full space-y-8 pt-10 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                <CheckCircle2 className="text-green-400 w-10 h-10" />
              </div>
            </div>
            <h2 className="text-2xl font-light text-white/90 italic">
              铭刻完成
            </h2>
            <p className="text-white/60 font-light">
              这一刻已成为你生命序列中永恒的一格。
            </p>

            <div className="space-y-4 pt-4">
              <Button
                onClick={() => router.push('/journey')}
                className="w-full rounded-full py-6 text-xs bg-primary/80 hover:bg-primary text-white transition-all shadow-lg"
              >
                查看我的履历 (Journey)
              </Button>
              <button
                onClick={() => {
                  setReflection('');
                  setEmotion(null);
                  setAiResponse('');
                  setSkipConfirmed(true);
                  setIgnoreHash(true);
                  setStep('input');
                }}
                className="text-primary/70 hover:text-primary text-xs font-light transition-colors uppercase tracking-[0.2em]"
              >
                回到此刻 (Back to Present)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
