import type { Actor, Ticket } from './types.ts';

// 独立编码区：禁止Agent生成、补全或修改。规则见本题任务书。
export function parseBranch(
  name: string,
): { kind: string; task: string; slug: string } | null {
  throw new Error('Q02 尚未实现');
}
