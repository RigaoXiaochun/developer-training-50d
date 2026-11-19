import { fileURLToPath } from 'node:url';
import { createServer } from './app.mjs';

const app = await createServer(
  fileURLToPath(new URL('../.local/training-data.json', import.meta.url)),
);
await app.listen(4781);
console.log('教学API：http://127.0.0.1:4781/api/training/health');
console.log('仅回环训练；无真实登录认证，不用于生产。');
let stopping = false;
async function close() {
  if (stopping) return;
  stopping = true;
  await app.close();
}
process.on('SIGINT', () => void close());
process.on('SIGTERM', () => void close());
