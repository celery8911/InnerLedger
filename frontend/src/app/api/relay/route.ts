/**
 * Gasless Relayer API
 *
 * 这个 API 端点是 Gasless 交易系统的核心组件。
 * 它接收用户签名的元交易请求，并代替用户支付 Gas 费用提交到区块链。
 *
 * 工作流程:
 * 1. 用户在前端签名一个元交易请求（不消耗 Gas）
 * 2. 签名后的请求发送到这个 API
 * 3. Relayer 钱包支付 Gas 费用，通过 Forwarder 合约执行交易
 * 4. Forwarder 合约验证签名后，以用户身份调用目标合约
 *
 * 安全措施:
 * - 白名单检查：只允许调用 InnerLedger 合约
 * - 速率限制：每个用户每分钟最多 10 次请求
 * - Gas 限制：单次请求最大 500000 gas
 */

import { NextRequest, NextResponse } from 'next/server';
import { createWalletClient, http, Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { monadTestnet } from 'wagmi/chains';

// 环境变量配置
const FORWARDER_ADDRESS = process.env.FORWARDER_ADDRESS as `0x${string}`;
const INNER_LEDGER_ADDRESS = process.env.INNER_LEDGER_ADDRESS as `0x${string}`;
const RELAYER_PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY as `0x${string}`;

// ERC2771Forwarder 的 execute 函数 ABI
const forwarderAbi = [
  {
    inputs: [
      {
        components: [
          { name: 'from', type: 'address' }, // 实际发起交易的用户地址
          { name: 'to', type: 'address' }, // 目标合约地址
          { name: 'value', type: 'uint256' }, // 发送的 ETH 数量
          { name: 'gas', type: 'uint256' }, // Gas 限制
          { name: 'deadline', type: 'uint48' }, // 请求过期时间
          { name: 'data', type: 'bytes' }, // 编码后的函数调用数据
          { name: 'signature', type: 'bytes' }, // 用户的 EIP-712 签名
        ],
        name: 'request',
        type: 'tuple',
      },
    ],
    name: 'execute',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
] as const;

// ============ 速率限制 ============
// 简单的内存速率限制器，防止滥用
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // 每分钟最大请求数
const RATE_WINDOW = 60 * 1000; // 时间窗口：1 分钟

/**
 * 检查用户是否超过速率限制
 * @param address 用户钱包地址
 * @returns 是否允许请求
 */
function checkRateLimit(address: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(address);

  // 如果没有记录或时间窗口已过期，重置计数
  if (!record || now > record.resetTime) {
    requestCounts.set(address, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }

  // 检查是否超过限制
  if (record.count >= RATE_LIMIT) {
    return false;
  }

  // 增加计数
  record.count++;
  return true;
}

// ============ API 处理函数 ============
export async function POST(request: NextRequest) {
  try {
    // 1. 验证环境配置
    if (!FORWARDER_ADDRESS || !RELAYER_PRIVATE_KEY) {
      console.error('Relayer not configured: missing FORWARDER_ADDRESS or RELAYER_PRIVATE_KEY');
      return NextResponse.json(
        { error: 'Relayer not configured' },
        { status: 500 }
      );
    }

    // 2. 解析请求体
    const { forwardRequest } = await request.json();

    // 3. 验证请求格式
    if (!forwardRequest || !forwardRequest.from || !forwardRequest.signature) {
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
    }

    // 4. 白名单检查：只允许调用 InnerLedger 合约
    if (
      INNER_LEDGER_ADDRESS &&
      forwardRequest.to.toLowerCase() !== INNER_LEDGER_ADDRESS.toLowerCase()
    ) {
      return NextResponse.json(
        { error: 'Target contract not allowed' },
        { status: 403 }
      );
    }

    // 5. 速率限制检查
    if (!checkRateLimit(forwardRequest.from.toLowerCase())) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // 6. Gas 限制检查（防止恶意消耗 Relayer 资金）
    const maxGas = 500000n;
    if (BigInt(forwardRequest.gas) > maxGas) {
      return NextResponse.json(
        { error: 'Gas limit exceeded' },
        { status: 400 }
      );
    }

    // 7. 创建 Relayer 钱包客户端
    const account = privateKeyToAccount(RELAYER_PRIVATE_KEY);
    const walletClient = createWalletClient({
      account,
      chain: monadTestnet,
      transport: http('https://testnet-rpc.monad.xyz/'),
    });

    // 8. 通过 Forwarder 合约执行元交易
    // Forwarder 会验证签名，然后以 forwardRequest.from 的身份调用目标合约
    const hash = await walletClient.writeContract({
      address: FORWARDER_ADDRESS,
      abi: forwarderAbi,
      functionName: 'execute',
      args: [
        {
          from: forwardRequest.from as `0x${string}`,
          to: forwardRequest.to as `0x${string}`,
          value: BigInt(forwardRequest.value || '0'),
          gas: BigInt(forwardRequest.gas),
          deadline: BigInt(forwardRequest.deadline),
          data: forwardRequest.data as Hex,
          signature: forwardRequest.signature as Hex,
        },
      ],
    });

    // 9. 返回交易哈希
    return NextResponse.json({ hash });
  } catch (error) {
    console.error('Relay error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Relay failed' },
      { status: 500 }
    );
  }
}
