import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const directory = path.resolve('tests/learner');
const files = [];
function scan(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) scan(p);
    else if (e.name.endsWith('.test.mjs')) files.push(p);
  }
}
scan(directory);
if (!files.length) {
  console.error('尚未提交本人新增测试，不能记为通过。');
  process.exit(1);
}
const result = spawnSync(process.execPath, ['--test', ...files], {
  stdio: 'inherit',
  windowsHide: true,
});
process.exit(result.status ?? 1);
