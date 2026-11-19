import type { Actor, Ticket } from './types.ts';

// 独立编码区：禁止Agent生成、补全或修改。规则见本题任务书。
export function threeWayMerge(
  base: Record<string, unknown>,
  local: Record<string, unknown>,
  remote: Record<string, unknown>,
): { merged: Record<string, unknown>; conflicts: string[] } {
  throw new Error('Q17 尚未实现');
}
