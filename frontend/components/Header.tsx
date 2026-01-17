'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

type HeaderProps = {
  title?: ReactNode;
  backHref?: string;
  overlay?: boolean;
  rightSlot?: ReactNode;
  className?: string;
  showConnectButton?: boolean;
};

export function Header({
  title,
  backHref,
  overlay = false,
  rightSlot,
  className = '',
  showConnectButton = true,
}: HeaderProps) {
  const router = useRouter();
  const containerClassName = `${overlay ? 'absolute top-0 left-0 w-full' : 'relative'} z-10 px-6 pt-8 flex items-center justify-between ${className}`;

  const backButton = backHref ? (
    <Link
      href={backHref}
      className="p-2 -ml-2 rounded-full hover:bg-white/5 transition-colors group"
      aria-label="Back"
    >
      <ArrowLeft className="text-white/60 group-hover:text-white/90 transition-colors" />
    </Link>
  ) : (
    <button
      type="button"
      onClick={() => router.back()}
      className="p-2 -ml-2 rounded-full hover:bg-white/5 transition-colors group"
      aria-label="Back"
    >
      <ArrowLeft className="text-white/60 group-hover:text-white/90 transition-colors" />
    </button>
  );

  return (
    <header className={containerClassName}>
      {backButton}
      {title ? (
        <div className="text-base uppercase tracking-[0.35em] text-white/85">
          {title}
        </div>
      ) : (
        <div />
      )}
      {rightSlot ?? (showConnectButton ? <ConnectButton showBalance={false} accountStatus="avatar" /> : <div className="w-9" />)}
    </header>
  );
}
