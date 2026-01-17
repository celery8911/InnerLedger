import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
// import { GasTracker } from '@/components/GasTracker';

const manrope = Manrope({ subsets: ['latin'], variable: '--font-display' });

export const metadata: Metadata = {
  title: '长了么 (InnerLedger)',
  description: 'AI 理解你，区块链记住你',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={manrope.variable}>
        <Providers>
          {children}
          {/* <GasTracker /> */}
        </Providers>
      </body>
    </html>
  );
}
