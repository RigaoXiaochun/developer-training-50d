const view = new URLSearchParams(location.search).get('view') || 'list';
const allowed = ['list', 'form', 'detail', 'components'];
const current = allowed.includes(view) ? view : 'list';
document.querySelectorAll('[data-view]').forEach(el => { el.hidden = el.dataset.view !== current; });
document.querySelectorAll('nav a').forEach(el => { if (el.getAttribute('href') === '?view=' + current) el.setAttribute('aria-current', 'page'); });
const rows = [
  { id: 'TCK-0001', title: '登录页面无法显示', status: 'open', assignee: '未分配', time: '01-01 09:00' },
  { id: 'TCK-0002', title: '账单金额核对', status: 'in_progress', assignee: '许言', time: '01-01 08:45' },
  { id: 'TCK-0003', title: '资料更新后的显示问题：长标题需要保持卡片、状态和操作位置稳定，不应把页面撑开', status: 'resolved', assignee: '陈禾', time: '01-01 08:30' },
];
function render() {
  const q = document.querySelector('#q').value.trim().toLowerCase();
  const status = document.querySelector('#status').value;
  const visible = rows.filter(r => (!q || (r.id + r.title).toLowerCase().includes(q)) && (status === 'all' || r.status === status));
  const container = document.querySelector('#rows'); container.replaceChildren();
  for (const row of visible) {
    const link = document.createElement('a'); link.href = '?view=detail'; link.className = 'ticket-row';
    const name = document.createElement('div'); name.className = 'ticket-text';
    const id = document.createElement('small'); id.textContent = row.id;
    const title = document.createElement('b'); title.textContent = row.title; name.append(id, title);
    const badge = document.createElement('span'); badge.className = 'badge ' + ({ open: 'open', in_progress: 'working', resolved: 'resolved' })[row.status];
    badge.textContent = ({ open: '待处理', in_progress: '处理中', resolved: '已解决' })[row.status];
    const assignee = document.createElement('span'); assignee.className = 'ticket-assignee'; assignee.textContent = row.assignee;
    const time = document.createElement('span'); time.className = 'ticket-time'; time.textContent = row.time;
    link.append(name, badge, assignee, time); container.append(link);
  }
  document.querySelector('#empty').hidden = visible.length !== 0;
  document.querySelector('#count').textContent = '共' + visible.length + '条';
}
render();
document.querySelector('#search-form').addEventListener('submit', e => e.preventDefault());
document.querySelector('#q').addEventListener('input', render);
document.querySelector('#status').addEventListener('change', render);
document.querySelector('#ticket-form').addEventListener('submit', e => {
  e.preventDefault(); document.querySelector('#form-result').textContent = '参考表单已演示；没有提交到教学API。';
});
document.querySelector('#archive').addEventListener('click', () => document.querySelector('#confirm').showModal());
