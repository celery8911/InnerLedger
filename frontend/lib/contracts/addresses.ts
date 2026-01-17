// Contract addresses for Monad Testnet
export const CONTRACTS = {
  GROWTH_SBT: '0x3c689A9800e1216CCEa4cC0D264D7A1422aCd0d1' as const,
  INNER_LEDGER: '0x622a9E2c8E13B930C54D4263A00ee4BAC2930e3D' as const,
} as const;

// Network configuration
export const MONAD_TESTNET = {
  chainId: 10143,
  name: 'Monad Testnet',
  rpcUrl: 'https://testnet-rpc.monad.xyz/',
  blockExplorer: 'https://explorer.monad.xyz/', // Update with actual explorer URL if different
} as const;
