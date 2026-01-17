import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';
import { ProvidersClient } from './providers-client';

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
        <ProvidersClient>
          {children}
        </ProvidersClient>
      </body>
    </html>
  );
}
