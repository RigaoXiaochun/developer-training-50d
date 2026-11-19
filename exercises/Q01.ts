import type { Actor, Ticket } from './types.ts';

// 独立编码区：禁止Agent生成、补全或修改。规则见本题任务书。
export function normalizeDraft(draft: Record<string, unknown>): {
  value: { title: string; description: string; category: string } | null;
  errors: { field: string; code: string }[];
} {
  throw new Error('Q01 尚未实现');
}
