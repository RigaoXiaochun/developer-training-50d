import type { Actor, Ticket } from './types.ts';

// 独立编码区：禁止Agent生成、补全或修改。规则见本题任务书。
export function checkBulkVersions(
  tickets: { id: string; version: number }[],
  commands: { id: string; version: number }[],
): { validIds: string[]; conflicts: string[]; missing: string[] } {
  throw new Error('Q12 尚未实现');
}
