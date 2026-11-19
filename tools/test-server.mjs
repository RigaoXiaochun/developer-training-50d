import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { createServer as viteServer } from 'vite';
import { createServer } from '../server/app.mjs';
import { root } from './base-check.mjs';
const api = await createServer(
  path.join(root, '.local/ui-runs', randomUUID(), 'training.db'),
);
await api.listen(4781);
const vite = await viteServer({
  configFile: path.join(root, 'vite.config.ts'),
});
await vite.listen();
async function close() {
  await vite.close();
  await api.close();
  process.exit(0);
}
process.on('SIGINT', close);
process.on('SIGTERM', close);
console.log('隔离UI检查服务就绪，不使用日常训练数据。');
