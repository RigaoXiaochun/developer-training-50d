import fs from 'node:fs';
import path from 'node:path';
import { root, baseCheck } from './base-check.mjs';
import { testCore } from './test-core.mjs';
const id = process.argv[2];
const { tasks } = JSON.parse(
  fs.readFileSync(path.join(root, 'course/tasks.json'), 'utf8'),
);
const task = tasks.find((t) => t.id === id);
if (!task) throw Error('用法 npm run check:task -- Q01');
baseCheck();
for (const t of tasks) {
  if (t.id > id) break;
  await testCore(t.id);
}
const directory = path.join(root, 'learning', id);
for (const name of ['交付.md', '独立编码.md', '上下文.md', '审查.md']) {
  const full = path.join(directory, name);
  if (!fs.existsSync(full)) throw Error('缺少交付文件：' + name);
  const text = fs.readFileSync(full, 'utf8');
  if (text.length < 180 || /待填写|请在这里填写/.test(text))
    throw Error(name + '仍是占位／过少');
}
const evidence = fs.readFileSync(path.join(directory, '独立编码.md'), 'utf8');
for (const item of ['用时', '提示', '核心提交', '反例'])
  if (!evidence.includes(item)) throw Error('独立编码记录缺少：' + item);
const dest = path.join(root, '.local/checks');
fs.mkdirSync(dest, { recursive: true });
fs.writeFileSync(
  path.join(dest, id + '.json'),
  JSON.stringify(
    {
      task: id,
      at: new Date().toISOString(),
      automatedSubset: 'passed',
      independentAuthorship: 'NOT_PROVEN_BY_SCRIPT',
      manualReview: 'PENDING',
      note: '记录格式与固定函数检查不代替工程、UI、语言或本人能力验收',
    },
    null,
    2,
  ),
  'utf8',
);
console.log(id + '自动覆盖项通过，继续业务／SQL／UI／现场检查。');
