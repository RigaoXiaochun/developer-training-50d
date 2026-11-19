export const demoTickets = Array.from({ length: 12 }, (_, i) => ({
  id: 'TCK-' + String(i + 1).padStart(4, '0'),
  title:
    i === 2
      ? '测试长标题'.repeat(12)
      : i === 3
        ? '<这是一段文本，不是HTML>'
        : ['登录页面无法显示', '账单金额核对', '资料更新咨询'][i % 3],
  description:
    i === 2
      ? '连续长内容用于检查详情换行。'.repeat(50)
      : '这条记录仅用于本地静态练习。',
  category: ['support', 'billing', 'other'][i % 3],
  status: ['open', 'in_progress', 'resolved'][i % 3],
  priority: ['low', 'normal', 'high'][i % 3],
  ownerId: 'user-01',
  assigneeId: 'staff-01',
  ownerName: '林晓',
  assigneeName: '陈禾',
  version: 1,
  archived: false,
  createdAt: new Date(Date.UTC(2026, 0, 1, 0, i)).toISOString(),
  updatedAt: new Date(Date.UTC(2026, 0, 1, 0, i)).toISOString(),
}));
