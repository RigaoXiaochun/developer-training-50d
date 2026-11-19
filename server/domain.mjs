import { actors } from './fixtures.mjs';
import { fail, object, text, category } from './validation.mjs';

export function visible(actor, ticket) {
  return (
    !ticket.archived &&
    (actor.role === 'manager' ||
      (actor.role === 'user' && ticket.ownerId === actor.id) ||
      (actor.role === 'staff' && ticket.assigneeId === actor.id))
  );
}
export function present(ticket) {
  return {
    ...ticket,
    ownerName: actors.find((a) => a.id === ticket.ownerId)?.name ?? '未知',
    assigneeName:
      actors.find((a) => a.id === ticket.assigneeId)?.name ?? '未分配',
  };
}
export function find(data, actor, id) {
  const ticket = data.tickets.find((t) => t.id === id && visible(actor, t));
  if (!ticket) fail(404, 'TICKET_NOT_FOUND', '工单不存在或不可查看');
  return ticket;
}
function event(data, actor, ticket, action) {
  data.events.push({
    id: `EV-${data.events.length + 1}`,
    ticketId: ticket.id,
    actorId: actor.id,
    action,
    at: new Date().toISOString(),
    version: ticket.version,
  });
}
export function create(data, actor, input) {
  if (actor.role !== 'user')
    fail(403, 'ACTION_FORBIDDEN', '当前身份不能新建工单');
  object(input, ['title', 'description', 'category']);
  const now = new Date().toISOString();
  const ticket = {
    id: 'TCK-' + String(data.nextId).padStart(4, '0'),
    title: text(input.title, 'title', 60),
    description: text(input.description, 'description', 1000),
    category: category(input.category),
    status: 'open',
    priority: 'normal',
    ownerId: actor.id,
    assigneeId: null,
    createdAt: now,
    updatedAt: now,
    version: 1,
    archived: false,
  };
  data.nextId++;
  data.tickets.push(ticket);
  event(data, actor, ticket, 'CREATED');
  return present(ticket);
}
export function patch(data, actor, id, input) {
  const ticket = find(data, actor, id);
  object(input, [
    'version',
    'title',
    'description',
    'category',
    'status',
    'assigneeId',
  ]);
  const allowed =
    actor.role === 'manager'
      ? ['status', 'assigneeId']
      : actor.role === 'staff'
        ? ['status']
        : ['title', 'description', 'category'];
  const keys = Object.keys(input).filter((k) => k !== 'version');
  if (!keys.length) fail(400, 'EMPTY_CHANGE', '没有可保存的修改');
  if (keys.some((k) => !allowed.includes(k)))
    fail(403, 'ACTION_FORBIDDEN', '当前身份无权修改此字段');
  if (!Number.isInteger(input.version) || input.version < 1)
    fail(400, 'INVALID_VERSION', '请提供有效版本');
  if (ticket.version !== input.version)
    fail(409, 'VERSION_CONFLICT', '工单已更新，请读取最新内容后确认');
  if (actor.role === 'user' && ticket.status !== 'open')
    fail(409, 'INVALID_STATE', '当前状态不能编辑');
  if ('title' in input) ticket.title = text(input.title, 'title', 60);
  if ('description' in input)
    ticket.description = text(input.description, 'description', 1000);
  if ('category' in input) ticket.category = category(input.category);
  if ('status' in input) {
    if (!['open', 'in_progress', 'resolved'].includes(input.status))
      fail(400, 'VALIDATION_ERROR', '状态不正确');
    const transitions = {
      open: ['in_progress', 'resolved'],
      in_progress: ['resolved'],
      resolved: [],
    };
    if (
      actor.role === 'staff' &&
      !transitions[ticket.status].includes(input.status)
    )
      fail(409, 'INVALID_STATE', '当前状态不能执行此变更');
    ticket.status = input.status;
  }
  if ('assigneeId' in input) {
    if (
      input.assigneeId !== null &&
      !actors.some((a) => a.id === input.assigneeId && a.role === 'staff')
    )
      fail(400, 'INVALID_ASSIGNEE', '只能分配给工作人员');
    ticket.assigneeId = input.assigneeId;
  }
  ticket.version++;
  ticket.updatedAt = new Date().toISOString();
  event(data, actor, ticket, 'UPDATED');
  return present(ticket);
}
export function archive(data, actor, id, input) {
  const ticket = find(data, actor, id);
  if (actor.role !== 'manager')
    fail(403, 'ACTION_FORBIDDEN', '只有管理者可归档');
  object(input, ['version']);
  if (!Number.isInteger(input.version) || input.version < 1)
    fail(400, 'INVALID_VERSION', '请提供有效版本');
  if (ticket.version !== input.version)
    fail(409, 'VERSION_CONFLICT', '工单已更新，请重新确认');
  ticket.archived = true;
  ticket.version++;
  ticket.updatedAt = new Date().toISOString();
  event(data, actor, ticket, 'ARCHIVED');
  return { id: ticket.id, archived: true, version: ticket.version };
}
