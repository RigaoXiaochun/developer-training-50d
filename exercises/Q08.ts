import type { Actor, Ticket } from './types.ts';

// 独立编码区：禁止Agent生成、补全或修改。规则见本题任务书。
export function canUpdate(
  actor: Actor,
  ticket: Ticket,
  patch: Record<string, unknown>,
): boolean {
  throw new Error('Q08 尚未实现');
}
