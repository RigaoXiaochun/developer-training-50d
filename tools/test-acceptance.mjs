import { spawnSync } from 'node:child_process';
const id = process.argv[2];
if (!/^Q(0[1-9]|1\d|20)$/.test(id ?? ''))
  throw Error('用法 npm run test:acceptance -- Q08');
const result = spawnSync(
  process.execPath,
  ['--test', 'tests/acceptance/advanced.test.mjs'],
  { stdio: 'inherit', windowsHide: true, env: { ...process.env, QID: id } },
);
process.exit(result.status ?? 1);
