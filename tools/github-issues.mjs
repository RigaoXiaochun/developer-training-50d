import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { root } from './base-check.mjs';
const args = process.argv.slice(2),
  at = args.indexOf('--repo'),
  repo = at < 0 ? '' : args[at + 1];
const { tasks } = JSON.parse(
  fs.readFileSync(path.join(root, 'course/tasks.json'), 'utf8'),
);
const phases = [...new Set(tasks.map((t) => t.phase))];
if (!args.includes('--apply')) {
  console.log(
    JSON.stringify(
      {
        mode: 'dry-run',
        remoteWrites: false,
        repository: repo || '未指定，apply时必须是本人training-开头的独立仓库',
        issues: 20,
        milestones: phases,
        hours: 88,
        labels: [
          'training',
          'checkpoint',
          ...phases.map((p) => 'phase:' + p.slice(0, 2)),
        ],
        sample: tasks
          .slice(0, 2)
          .map((t) => ({ title: `[${t.id}] ${t.title}`, branch: t.branch })),
      },
      null,
      2,
    ),
  );
  process.exit(0);
}
if (
  !/^[A-Za-z0-9-]+\/training-[A-Za-z0-9_.-]+$/.test(repo ?? '') ||
  /mirai-world|muniai_chat|tatsujin/i.test(repo)
)
  throw Error('只允许本人training-开头的独立训练仓库');
const run = (cmd, argv) =>
  execFileSync(cmd, argv, {
    cwd: root,
    encoding: 'utf8',
    windowsHide: true,
    maxBuffer: 8 * 1024 * 1024,
  }).trim();
const top = run('git', ['rev-parse', '--show-toplevel']);
if (path.resolve(top).toLowerCase() !== path.resolve(root).toLowerCase())
  throw Error('学员包必须是独立Git根目录');
const remote = run('git', ['remote', 'get-url', 'origin']).replace(
  /\.git$/,
  '',
);
if (
  !remote.endsWith('github.com/' + repo) &&
  !remote.endsWith('github.com:' + repo)
)
  throw Error('origin和目标仓库不一致');
const gh = (argv) => run('gh', argv),
  login = JSON.parse(gh(['api', 'user'])).login;
if (repo.split('/')[0].toLowerCase() !== login.toLowerCase())
  throw Error('只能初始化当前用户自己的个人训练仓库');
for (const [name, color] of [
  ['training', '0f766e'],
  ['checkpoint', 'b45309'],
  ...phases.map((p) => ['phase:' + p.slice(0, 2), '526170']),
])
  gh(['label', 'create', name, '--repo', repo, '--color', color, '--force']);
const milestones = JSON.parse(
  gh(['api', `repos/${repo}/milestones?state=all&per_page=100`]),
);
for (const title of phases)
  if (!milestones.some((m) => m.title === title))
    gh([
      'api',
      `repos/${repo}/milestones`,
      '--method',
      'POST',
      '-f',
      'title=' + title,
    ]);
const existing = JSON.parse(
  gh([
    'issue',
    'list',
    '--repo',
    repo,
    '--state',
    'all',
    '--limit',
    '1000',
    '--json',
    'title,body',
  ]),
);
const directory = path.join(root, '.local/issue-bodies');
fs.mkdirSync(directory, { recursive: true });
for (const t of tasks) {
  const marker = `<!-- engineering20:${t.id} -->`;
  if (
    existing.some(
      (i) => i.body?.includes(marker) || i.title.startsWith(`[${t.id}]`),
    )
  ) {
    console.log('已存在，跳过' + t.id);
    continue;
  }
  const text = `${marker}\n## 目标\n${t.objective}\n\n任务书：course/20项任务/${t.file}\n分支：${t.branch}\n预计${t.hours}小时\n\n## 验收\n${t.acceptance.map((a) => '- [ ] ' + a).join('\n')}\n\n独立编码先提交，Agent综合实现后审查；交付证据见learning/${t.id}/。${t.checkpoint ? '阶段需带教签收。' : '个人训练普通题自查交付。'}`;
  const file = path.join(directory, t.id + '.md');
  fs.writeFileSync(file, text, 'utf8');
  const argv = [
    'issue',
    'create',
    '--repo',
    repo,
    '--title',
    `[${t.id}] ${t.title}`,
    '--body-file',
    file,
    '--assignee',
    login,
    '--milestone',
    t.phase,
    '--label',
    'training',
    '--label',
    'phase:' + t.phase.slice(0, 2),
  ];
  if (t.checkpoint) argv.push('--label', 'checkpoint');
  console.log(gh(argv));
}
console.log('20项初始化完成；Project由本人按手册建立，不由此工具自动创建。');
