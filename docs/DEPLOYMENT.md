# 合约部署信息

## 部署详情

**部署时间**: 2026-01-14 17:17:00 +08:00  
**网络**: Monad Testnet  
**Chain ID**: 10143  
**RPC URL**: https://testnet-rpc.monad.xyz/  
**部署账户**: 0x7993576ae40996479fC549410cab4A9ee8Ae5AAf

## 已部署合约

### 1. GrowthSBT (成长灵魂绑定代币)
- **地址**: `0x3c689A9800e1216CCEa4cC0D264D7A1422aCd0d1`
- **功能**: 不可转让的 NFT,用于记录用户成长里程碑
- **特性**: 
  - Soulbound (灵魂绑定,不可转让)
  - 只有 owner (InnerLedger) 可以铸造
  - 每个 token 关联一个里程碑名称

### 2. InnerLedger (内在账本)
- **地址**: `0x622a9E2c8E13B930C54D4263A00ee4BAC2930e3D`
- **功能**: 主合约,用于情绪日记和觉察追踪
- **特性**:
  - 创建情绪记录 (emotion + contentHash)
  - 查询用户的完整旅程
  - 自动触发 SBT 铸造 (里程碑)
  - 拥有 GrowthSBT 的所有权

## 合约关系

```
InnerLedger (主合约)
    ↓ owns
GrowthSBT (SBT 合约)
```

InnerLedger 是 GrowthSBT 的 owner,可以根据用户的成长里程碑自动铸造 SBT。

## 前端集成

### 环境变量
已在 `frontend/.env.local` 中配置:
```bash
NEXT_PUBLIC_GROWTH_SBT_ADDRESS=0x3c689A9800e1216CCEa4cC0D264D7A1422aCd0d1
NEXT_PUBLIC_INNER_LEDGER_ADDRESS=0x622a9E2c8E13B930C54D4263A00ee4BAC2930e3D
```

### ABI 文件
- `frontend/src/lib/abis/InnerLedger.ts` - InnerLedger ABI
- `frontend/src/lib/abis/GrowthSBT.ts` - GrowthSBT ABI

### 合约配置
- `frontend/src/lib/contracts/addresses.ts` - 合约地址常量

### 已更新页面
- `frontend/src/app/awareness/page.tsx` - 使用实际合约地址

## 主要功能

### InnerLedger 合约方法

1. **createRecord(emotion, contentHash)**
   - 创建新的情绪记录
   - 参数:
     - `emotion`: string - 情绪标识 (如 "😊", "😐", "😔")
     - `contentHash`: bytes32 - 内容的 keccak256 哈希
   - 事件: `RecordCreated(user, contentHash, timestamp)`

2. **getJourney(user)**
   - 获取用户的完整旅程记录
   - 返回: Record[] 数组
   - Record 结构:
     - `contentHash`: bytes32
     - `timestamp`: uint256
     - `emotion`: string
     - `user`: address

3. **getRecordCount(user)**
   - 获取用户的记录数量
   - 返回: uint256

### GrowthSBT 合约方法

1. **mint(to, milestoneName)**
   - 铸造新的 SBT (仅 owner 可调用)
   - 参数:
     - `to`: address - 接收者地址
     - `milestoneName`: string - 里程碑名称

2. **milestones(tokenId)**
   - 查询 token 的里程碑名称
   - 返回: string

3. **balanceOf(owner)**
   - 查询地址拥有的 SBT 数量
   - 返回: uint256

## 区块链浏览器

- 交易查看: `https://testnet.monadexplorer.com/tx/{txHash}`
- 地址查看: `https://testnet.monadexplorer.com/address/{address}`

## 下一步开发建议

1. **Journey 页面集成**
   - 使用 `getJourney()` 替换 mock 数据
   - 显示真实的链上记录

2. **SBT 展示**
   - 读取用户的 SBT
   - 显示里程碑成就

3. **自动铸造逻辑**
   - 在 InnerLedger 中添加里程碑检测
   - 达到特定条件时自动铸造 SBT
   - 例如: 第 1 条记录、第 7 天、第 30 天等

4. **内容存储**
   - 考虑使用 IPFS 存储完整内容
   - contentHash 可以是 IPFS CID

## 测试

### 获取测试币
访问 Monad 测试网水龙头获取测试币用于交互。

### 测试流程
1. 连接钱包到 Monad Testnet
2. 访问 Awareness 页面
3. 输入情绪和反思内容
4. 点击"永久铭刻"创建链上记录
5. 在 Journey 页面查看历史记录
