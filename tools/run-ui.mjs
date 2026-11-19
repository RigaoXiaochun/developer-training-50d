import { spawnSync } from 'node:child_process';
const id = process.argv[2] ?? 'smoke';
if (id !== 'smoke' && !/^Q(0[1-9]|1\d|20)$/.test(id)) throw Error('课号无效');
const result = spawnSync(
  process.execPath,
  ['node_modules/@playwright/test/cli.js', 'test'],
  { stdio: 'inherit', windowsHide: true, env: { ...process.env, QID: id } },
);
process.exit(result.status ?? 1);
