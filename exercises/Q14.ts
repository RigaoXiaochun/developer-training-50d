import type { Actor, Ticket } from './types.ts';

// 独立编码区：禁止Agent生成、补全或修改。规则见本题任务书。
export function changedFields(
  original: Record<string, unknown>,
  draft: Record<string, unknown>,
  allowed: string[],
): Record<string, unknown> {
  throw new Error('Q14 尚未实现');
}
