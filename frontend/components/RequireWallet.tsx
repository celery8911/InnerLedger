'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Header } from '@/components/Header';

type RequireWalletProps = {
  message?: string;
};

export function RequireWallet({ message }: RequireWalletProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header backHref="/" overlay showConnectButton={false} />
      <div className="flex-1 flex flex-col items-center justify-center space-y-6 text-white/80">
        <h2 className="text-2xl font-light tracking-wide">
          {message ?? '请连接钱包查看'}
        </h2>
        <ConnectButton />
      </div>
    </div>
  );
}
