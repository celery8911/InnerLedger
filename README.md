# 长了么 (InnerLedger)

A Web3 mindfulness application built on Monad.

## 🌟 Features

- **Awareness Tracking**: Record and reflect on your emotional states
- **AI-Powered Insights**: Get gentle, understanding responses to your reflections
- **Blockchain Permanence**: Mint your moments as immutable records on Monad
- **Soulbound Achievements**: Earn non-transferable SBT tokens for growth milestones
- **Journey Visualization**: View your complete mindfulness journey

## 📦 Project Structure

- **frontend/**: Next.js application (App Router, RainbowKit, Wagmi, OpenAI)
- **blockchain/**: Smart Contracts (Hardhat, Solidity, Monad Testnet)
- **docs/**: Project documentation (PRD, UI Design, Deployment)

## 🚀 Deployed Contracts (Monad Testnet)

| Contract | Address |
|----------|---------|
| **InnerLedger** | `0x622a9E2c8E13B930C54D4263A00ee4BAC2930e3D` |
| **GrowthSBT** | `0x3c689A9800e1216CCEa4cC0D264D7A1422aCd0d1` |

**Network**: Monad Testnet (Chain ID: 10143)  
**RPC**: https://testnet-rpc.monad.xyz/

📖 See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for full deployment details.

## 🏃 Getting Started

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit http://localhost:3000

### Blockchain

```bash
cd blockchain
npm install
npx hardhat compile
npx hardhat test
```

### Deploy Contracts

```bash
cd blockchain
npx hardhat run scripts/deploy.ts --network monadTestnet
```

### Test Deployed Contracts

```bash
cd blockchain
npx hardhat run scripts/test-deployed.ts --network monadTestnet
```

## 📚 Documentation

- [Deployment Summary](./docs/DEPLOYMENT_SUMMARY.md) - Complete deployment info and next steps
- [Deployment Details](./docs/DEPLOYMENT.md) - Contract addresses and integration guide
- [PRD](./docs/PRD.md) - Product requirements (if exists)

## 🛠 Tech Stack

### Frontend
- Next.js 15 (App Router)
- TypeScript
- RainbowKit + Wagmi (Web3)
- Framer Motion (Animations)
- OpenAI API (AI Insights)

### Blockchain
- Solidity 0.8.20
- Hardhat
- OpenZeppelin Contracts
- Monad Testnet

## 🎯 Core Contracts

### InnerLedger
Main contract for emotional journaling:
- `createRecord(emotion, contentHash)` - Create a new record
- `getJourney(user)` - Get user's complete journey
- `getRecordCount(user)` - Get number of records

### GrowthSBT
Soulbound token for milestones:
- Non-transferable NFT
- Minted by InnerLedger for achievements
- Represents growth milestones

## 🔗 Links

- [Monad Testnet Explorer](https://testnet.monadexplorer.com/)
- [Monad Documentation](https://docs.monad.xyz/)

## 📝 License

MIT

