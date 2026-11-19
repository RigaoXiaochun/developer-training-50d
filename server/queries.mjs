import { visible, present } from './domain.mjs';
import { positive, fail } from './validation.mjs';
import {
  parsePriority,
  filterByPriority,
  countPriorities,
} from './extensions/priority.mjs';

export function list(data, actor, query, v2 = false) {
  const allowed = [
    'q',
    'status',
    'page',
    'pageSize',
    ...(v2 ? ['priority'] : []),
  ];
  if ([...query.keys()].some((k) => !allowed.includes(k)))
    fail(400, 'UNKNOWN_QUERY', '包含不支持的查询条件');
  const q = (query.get('q') ?? '').trim().toLocaleLowerCase(),
    status = query.get('status') || 'all';
  if (q.length > 120) fail(400, 'INVALID_QUERY', '搜索条件过长');
  if (!['all', 'open', 'in_progress', 'resolved'].includes(status))
    fail(400, 'INVALID_STATUS', '状态筛选不正确');
  const page = positive(query.get('page'), 1),
    pageSize = positive(query.get('pageSize'), 5, 20);
  if (![5, 10, 20].includes(pageSize))
    fail(400, 'INVALID_QUERY', '每页仅支持5、10、20条');
  let items = data.tickets.filter(
    (t) =>
      visible(actor, t) &&
      (!q || (t.id + ' ' + t.title).toLocaleLowerCase().includes(q)) &&
      (status === 'all' || t.status === status),
  );
  let priorityCounts;
  if (v2) {
    const priority = parsePriority(query.get('priority') ?? undefined);
    priorityCounts = countPriorities(items);
    items = filterByPriority(items, priority);
  }
  items.sort(
    (a, b) =>
      b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id),
  );
  const total = items.length,
    totalPages = Math.max(1, Math.ceil(total / pageSize));
  return {
    data: items.slice((page - 1) * pageSize, page * pageSize).map(present),
    meta: {
      page,
      pageSize,
      total,
      totalPages,
      ...(v2 ? { priorityCounts } : {}),
    },
  };
}
