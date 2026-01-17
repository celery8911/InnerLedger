'use client';

import { useEstimateFeesPerGas } from 'wagmi';
import { useEffect, useState } from 'react';
import { formatGwei } from 'viem';

export const GasTracker = () => {
  const { data } = useEstimateFeesPerGas();
  const [gasPrice, setGasPrice] = useState<string>('...');

  useEffect(() => {
    if (data?.maxFeePerGas) {
      const fees = formatGwei(data.maxFeePerGas);
      // Simple formatting to avoid long decimals
      setGasPrice(parseFloat(fees).toFixed(4));
    }
  }, [data]);

  return (
    <div className="fixed bottom-4 right-4 glass-pill px-4 py-2 rounded-full text-[10px] uppercase tracking-[0.2em] text-white/60 shadow-lg">
      Monad Testnet Gas: <span className="text-primary font-semibold">{gasPrice} Gwei</span>
    </div>
  );
};
