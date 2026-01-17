'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { useAccount, useReadContract } from 'wagmi';
import { GrowthSBTABI } from '@/lib/abis/GrowthSBT';
import { CONTRACTS } from '@/lib/contracts/addresses';
import { MILESTONES } from '../milestones';
import { ArtifactVisual } from '../ArtifactVisual';
import { Header } from '@/components/Header';
import { RequireWallet } from '@/components/RequireWallet';

export default function JourneyGalleryDetailPage() {
  const params = useParams();
  const idParam = Array.isArray(params?.id) ? params?.id[0] : params?.id;
  const id = Number(idParam);
  const milestone = MILESTONES.find((item) => item.id === id);

  const { address, isConnected } = useAccount();
  const { data: sbtBalance } = useReadContract({
    address: CONTRACTS.GROWTH_SBT,
    abi: GrowthSBTABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });
  const hasGenesis = Number(sbtBalance || 0) > 0;
  const isVerified = milestone?.id === 1 && hasGenesis;

  if (!isConnected) {
    return <RequireWallet />;
  }

  if (!milestone || Number.isNaN(id)) {
    return (
      <div className="min-h-screen bg-[#050505] text-[#d6d6d6]">
        <div className="relative p-6 lg:p-12 max-w-4xl mx-auto selection:bg-[#00E5FF]/30">
          <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-white/60">
            <p className="text-sm uppercase tracking-[0.3em]">
              Artifact Not Found
            </p>
            <Link
              href="/gallery"
              className="px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-xs uppercase tracking-[0.2em]"
            >
              Back to Vault
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#d6d6d6]">
      <Header
        title={`SBT · Archive_${milestone.id}`}
        backHref="/gallery"
        className="px-6 pt-8 lg:px-12"
      />
      <div className="relative px-6 pb-12 pt-6 lg:px-12 max-w-4xl mx-auto selection:bg-[#00E5FF]/30">
        <div className="min-h-[70vh] flex flex-col">

          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-[520px] aspect-[3/4.8] rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.05),transparent_70%)]" />

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between text-[9px] uppercase tracking-[0.2em] text-white/40">
                  <span>Sec_Lvl: {milestone.rarity}</span>
                  <span>{milestone.serial}</span>
                </div>

                <div className="flex-1 flex items-center justify-center">
                  <ArtifactVisual style={milestone.style} />
                </div>

                <div className="text-center">
                  <h1 className="text-2xl font-semibold text-white/90 mb-2">
                    {milestone.title}
                  </h1>
                  {isVerified && (
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#00E5FF]/30 text-[#00E5FF] text-[9px] uppercase tracking-[0.2em] bg-white/5">
                      <ShieldCheck size={12} />
                      Soulbound_Verified
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
