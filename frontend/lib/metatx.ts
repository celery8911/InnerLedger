/**
 * 元交易 (Meta Transaction) 工具库
 *
 * 这个模块提供了创建和发送 Gasless 交易所需的所有功能。
 * 基于 ERC-2771 标准，让用户无需持有原生代币即可与区块链交互。
 *
 * 核心概念:
 * 1. 用户签署一个"转发请求"（ForwardRequest），而不是直接发送交易
 * 2. 签名使用 EIP-712 标准，确保安全性和可验证性
 * 3. Relayer 服务接收签名，代替用户支付 Gas 并提交交易
 * 4. Forwarder 合约验证签名后，以用户身份执行目标函数
 */

import { encodeFunctionData } from 'viem';
import type { Address, Hex, PublicClient } from 'viem';
import { signTypedData, type Config } from '@wagmi/core';
import { InnerLedgerABI } from './abis/InnerLedger';
import { CONTRACTS } from './contracts/addresses';

// ============ 类型定义 ============

/**
 * 转发请求结构
 * 这是 ERC-2771 标准定义的元交易格式
 */
export interface ForwardRequest {
  from: Address; // 实际发起交易的用户地址
  to: Address; // 目标合约地址
  value: bigint; // 发送的 ETH 数量（通常为 0）
  gas: bigint; // Gas 限制
  nonce: bigint; // 用户的 nonce，防止重放攻击
  deadline: bigint; // 请求过期时间戳
  data: Hex; // 编码后的函数调用数据
}

/**
 * 带签名的转发请求
 */
export interface ForwardRequestData extends ForwardRequest {
  signature: Hex; // 用户的 EIP-712 签名
}

// ============ EIP-712 类型定义 ============
// 用于签名的类型结构，必须与 Forwarder 合约中的定义完全匹配
const FORWARDER_TYPES = {
  ForwardRequest: [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'gas', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint48' },
    { name: 'data', type: 'bytes' },
  ],
} as const;

// ============ 合约地址配置 ============
// 与前端读合约保持一致，避免默认地址不一致导致写/读错合约
export const FORWARDER_ADDRESS = CONTRACTS.FORWARDER as Address;
export const INNER_LEDGER_ADDRESS = CONTRACTS.INNER_LEDGER as Address;

// Forwarder 合约的 nonces 函数 ABI
const forwarderNonceAbi = [
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'nonces',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// ============ 核心函数 ============

/**
 * 从 Forwarder 合约获取用户的当前 nonce
 * Nonce 用于防止重放攻击，每次成功执行后会自动递增
 *
 * @param publicClient - viem 公共客户端
 * @param forwarderAddress - Forwarder 合约地址
 * @param userAddress - 用户钱包地址
 * @returns 用户当前的 nonce 值
 */
export async function getNonce(
  publicClient: PublicClient,
  forwarderAddress: Address,
  userAddress: Address
): Promise<bigint> {
  return publicClient.readContract({
    address: forwarderAddress,
    abi: forwarderNonceAbi,
    functionName: 'nonces',
    args: [userAddress],
  });
}

/**
 * 创建并签名一个转发请求
 * 这是 Gasless 交易的核心步骤
 *
 * @param config - wagmi 配置对象
 * @param publicClient - viem 公共客户端
 * @param userAddress - 用户钱包地址
 * @param emotion - 情绪标签
 * @param contentHash - 内容哈希（觉察记录的加密哈希）
 * @returns 带签名的转发请求
 */
export async function createForwardRequest(
  config: Config,
  publicClient: PublicClient,
  userAddress: Address,
  emotion: string,
  contentHash: Hex
): Promise<ForwardRequestData> {
  // 1. 从 Forwarder 获取用户当前 nonce
  const nonce = await getNonce(publicClient, FORWARDER_ADDRESS, userAddress);

  // 2. 编码 InnerLedger.createRecord 函数调用
  const data = encodeFunctionData({
    abi: InnerLedgerABI,
    functionName: 'createRecord',
    args: [emotion, contentHash],
  });

  // 3. 设置过期时间为 1 小时后
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);

  // 4. 构建转发请求
  const request: ForwardRequest = {
    from: userAddress,
    to: INNER_LEDGER_ADDRESS,
    value: BigInt(0), // 不发送 ETH
    gas: BigInt(450000), // 预估 Gas 限制（含 SBT 铸造，留足余量）
    nonce,
    deadline,
    data,
  };

  // 5. 使用 EIP-712 签名请求
  // 这一步会弹出钱包签名确认，但不消耗 Gas
  const signature = await signTypedData(config, {
    domain: {
      name: 'InnerLedgerForwarder', // 必须与合约构造函数中的名称匹配
      version: '1',
      chainId: 10143, // Monad Testnet 链 ID
      verifyingContract: FORWARDER_ADDRESS,
    },
    types: FORWARDER_TYPES,
    primaryType: 'ForwardRequest',
    message: {
      from: request.from,
      to: request.to,
      value: request.value,
      gas: request.gas,
      nonce: request.nonce,
      deadline: Number(request.deadline),
      data: request.data,
    },
  });

  return {
    ...request,
    signature,
  };
}

/**
 * 将签名的转发请求发送到 Relayer API
 * Relayer 会代替用户支付 Gas 并提交交易
 *
 * @param request - 带签名的转发请求
 * @returns 交易哈希
 * @throws 如果 Relayer 返回错误
 */
export async function relayTransaction(
  request: ForwardRequestData
): Promise<Hex> {
  const response = await fetch('/api/relay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      forwardRequest: {
        from: request.from,
        to: request.to,
        value: request.value.toString(), // BigInt 转字符串
        gas: request.gas.toString(),
        deadline: Number(request.deadline),
        data: request.data,
        signature: request.signature,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Relay failed');
  }

  const { hash } = await response.json();
  return hash;
}
