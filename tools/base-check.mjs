import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
export const root = fileURLToPath(new URL('../', import.meta.url));
export function baseCheck() {
  const [major, minor] = process.versions.node.split('.').map(Number);
  if (major !== 24 || minor < 14) throw Error('统一使用Node24.14或更高24.x');
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let count = 0;
  function scan(directory) {
    for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
      if (
        [
          'node_modules',
          '.local',
          '.git',
          'dist',
          'test-results',
          'playwright-report',
        ].includes(item.name)
      )
        continue;
      const full = path.join(directory, item.name);
      if (item.isSymbolicLink()) throw Error('训练材料不应有符号链接：' + full);
      if (item.isDirectory()) scan(full);
      else if (/\.(md|mjs|js|ts|vue|css|html|json|yml)$/.test(item.name)) {
        const text = decoder.decode(fs.readFileSync(full));
        if (text.includes('\ufffd')) throw Error('编码替换字符：' + full);
        count++;
      }
    }
  }
  scan(root);
  const { tasks } = JSON.parse(
    fs.readFileSync(path.join(root, 'course/tasks.json'), 'utf8'),
  );
  if (tasks.length !== 20 || new Set(tasks.map((t) => t.id)).size !== 20)
    throw Error('固定任务必须20项');
  console.log(
    `基础检查通过：Node24.14+、UTF-8、20项任务（${count}个文本文件）；不代表业务验收。`,
  );
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  baseCheck();
