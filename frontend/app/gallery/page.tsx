'use client';

import Link from 'next/link';
import { Lock, ShieldCheck } from 'lucide-react';
import { useAccount, useReadContract } from 'wagmi';
import { GrowthSBTABI } from '@/lib/abis/GrowthSBT';
import { CONTRACTS } from '@/lib/contracts/addresses';
import { MILESTONES, type Milestone } from './milestones';
import { ArtifactVisual } from './ArtifactVisual';
import { Header } from '@/components/Header';
import { RequireWallet } from '@/components/RequireWallet';

export default function JourneyGalleryPage() {
  const { address, isConnected } = useAccount();
  const { data: sbtBalance } = useReadContract({
    address: CONTRACTS.GROWTH_SBT,
    abi: GrowthSBTABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });
  const hasGenesis = Number(sbtBalance || 0) > 0;

  if (!isConnected) {
    return <RequireWallet />;
  }

  return (
    <div className="min-h-screen text-[#d6d6d6] relative overflow-hidden">
      <Header title="SBT" backHref="/journey" className="px-6 pt-8 lg:px-12" />
      <div className="relative px-6 pb-12 pt-6 lg:px-12 max-w-4xl mx-auto selection:bg-[#00E5FF]/30">
        <ListView milestones={MILESTONES} hasGenesis={hasGenesis} />
      </div>
    </div>
  );
}

function ListView({
  milestones,
  hasGenesis,
}: {
  milestones: Milestone[];
  hasGenesis: boolean;
}) {
  return (
    <>
      <div className="border-t border-white/10 pt-8">
        <div className="grid grid-cols-2 gap-4">
          {milestones.map((milestone) => (
            <MilestoneCard
              key={milestone.id}
              milestone={milestone}
              hasGenesis={hasGenesis}
            />
          ))}
        </div>
      </div>
    </>
  );
}

function MilestoneCard({
  milestone,
  hasGenesis,
}: {
  milestone: Milestone;
  hasGenesis: boolean;
}) {
  const isLocked = milestone.status === 'locked';
  const isVerified = milestone.id === 1 && hasGenesis;
  // const isVerified = milestone.id !== 4;
  const isUnverified = !isLocked && !isVerified;
  const isClickable = milestone.status === 'unlocked' && isVerified;

  const className = `relative aspect-[3/4] rounded-3xl overflow-hidden text-left transition-all duration-300
    ${
      isLocked
        ? 'border border-dashed border-white/10 bg-white/5 text-white/20 cursor-default'
        : isUnverified
          ? 'border border-white/10 bg-black/80 text-white/35 cursor-default'
          : 'border border-white/10 bg-[#121414] hover:border-white/20 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)]'
    }`;

  const cardContent = (
    <>
      {isLocked ? (
        <div className="h-full flex flex-col items-center justify-center gap-2">
          <Lock size={18} className="text-white/20" />
          <span className="text-[9px] uppercase tracking-[0.3em] text-white/20">
            Encrypted
          </span>
        </div>
      ) : (
        <>
          <div
            className={`absolute inset-0 ${
              isUnverified
                ? 'bg-gradient-to-br from-[#0b0d0e] via-[#050607] to-black'
                : 'bg-gradient-to-br from-[#1A1D1D] to-black'
            } opacity-90`}
          />
          <div
            className={`absolute inset-0 ${
              isUnverified
                ? 'bg-[radial-gradient(circle_at_top,_rgba(0,229,255,0.06),_transparent_60%)]'
                : 'bg-[radial-gradient(circle_at_top,_rgba(0,229,255,0.12),_transparent_60%)]'
            }`}
          />
          {milestone.style === 'crystal' && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-[#00E5FF]/10 blur-[40px] rounded-full animate-pulse" />
          )}
          <div className="relative h-full p-5 flex flex-col justify-between z-10">
            <span className="text-[9px] text-white/40 uppercase tracking-[0.2em]">
              {milestone.serial}
            </span>
            <div className="flex-1 flex items-center justify-center">
              {isVerified ? (
                <ArtifactVisual style={milestone.style} variant="card" />
              ) : (
                <div className="w-24 h-24" />
              )}
            </div>
            <div className={isUnverified ? 'text-white/55' : 'text-white'}>
              <h3 className="text-lg font-semibold">{milestone.title}</h3>
              {isVerified ? (
                <div className="mt-2 flex items-center gap-1 text-[9px] uppercase tracking-[0.25em] text-[#00E5FF]/80">
                  <ShieldCheck size={12} />
                  <span>Verified</span>
                </div>
              ) : (
                milestone.progressText && (
                  <p className="mt-2 text-[10px] text-white/20">
                    {milestone.progressText}
                  </p>
                )
              )}
            </div>
          </div>
        </>
      )}
    </>
  );

  if (isClickable) {
    return (
      <Link href={`/gallery/${milestone.id}`} className={className}>
        {cardContent}
      </Link>
    );
  }

  return <div className={className}>{cardContent}</div>;
}
