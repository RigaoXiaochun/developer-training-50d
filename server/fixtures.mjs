export const actors = [
  { id: 'user-01', name: '林晓', role: 'user' },
  { id: 'user-02', name: '周宁', role: 'user' },
  { id: 'staff-01', name: '陈禾', role: 'staff' },
  { id: 'staff-02', name: '许言', role: 'staff' },
  { id: 'manager-01', name: '训练管理员', role: 'manager' },
];
export function seedData() {
  const names = [
    '无法查看订单',
    '需要修改开票信息',
    '咨询服务时间',
    '页面显示异常',
    '申请补充说明',
    '付款记录核对',
  ];
  return {
    nextId: 26,
    events: [],
    tickets: Array.from({ length: 25 }, (_, n) => ({
      id: 'TCK-' + String(n + 1).padStart(4, '0'),
      title:
        n === 3
          ? '用于验证连续内容边界的标题' + '很长的名称'.repeat(8)
          : names[n % names.length] + ' · ' + (n + 1),
      description:
        n === 3
          ? '长内容仅作训练。'.repeat(100)
          : '这是虚构工单，供界面、接口及权限练习使用。',
      category: ['support', 'billing', 'other'][n % 3],
      status: ['open', 'in_progress', 'resolved'][n % 3],
      priority: ['low', 'normal', 'high'][n % 3],
      ownerId: n % 2 ? 'user-02' : 'user-01',
      assigneeId: n % 4 === 0 ? null : n % 2 ? 'staff-02' : 'staff-01',
      createdAt: new Date(Date.UTC(2026, 0, 1, 0, n)).toISOString(),
      updatedAt: new Date(Date.UTC(2026, 0, 1, 0, n)).toISOString(),
      version: 1,
      archived: false,
    })),
  };
}
