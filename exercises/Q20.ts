import type { Actor, Ticket } from './types.ts';

// 独立编码区：禁止Agent生成、补全或修改。规则见本题任务书。
export function contractDiff(
  expected: Record<string, 'string' | 'number' | 'boolean'>,
  payload: Record<string, unknown>,
): { missing: string[]; unexpected: string[]; typeMismatch: string[] } {
  throw new Error('Q20 尚未实现');
}
