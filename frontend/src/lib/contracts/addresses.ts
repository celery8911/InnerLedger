// Contract addresses for Monad Testnet (from environment variables)
export const CONTRACTS = {
  GROWTH_SBT: (process.env.NEXT_PUBLIC_GROWTH_SBT_ADDRESS || '0x1572281F7604D09333dCdFBD9F5A971dcA0a67Ea') as `0x${string}`,
  INNER_LEDGER: (process.env.NEXT_PUBLIC_INNER_LEDGER_ADDRESS || '0x0379201C1014ece6FEc1bFE4E6371C484748406a') as `0x${string}`,
  FORWARDER: (process.env.NEXT_PUBLIC_FORWARDER_ADDRESS || '0x6Fd7b0D88e8b812aa2Cb4F394ee2660FC2FeA4A5') as `0x${string}`,
} as const;

// Network configuration
export const MONAD_TESTNET = {
  chainId: 10143,
  name: 'Monad Testnet',
  rpcUrl: 'https://testnet-rpc.monad.xyz/',
  blockExplorer: 'https://explorer.monad.xyz/', // Update with actual explorer URL if different
} as const;
