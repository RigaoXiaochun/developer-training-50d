import { spawn } from 'node:child_process';
import net from 'node:net';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
async function available(port) {
  await new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.once('error', () =>
      reject(
        new Error(
          `端口${port}已占用，请先停止本人训练服务；不要结束无关进程。`,
        ),
      ),
    );
    probe.listen(port, '127.0.0.1', () => probe.close(resolve));
  });
}
await available(4780);
await available(4781);
const entries = [
  ['server/main.mjs'],
  [
    'node_modules/vite/bin/vite.js',
    ...(process.argv.includes('--preview') ? ['preview'] : []),
  ],
];
const children = entries.map((args) =>
  spawn(process.execPath, args, {
    cwd: root,
    stdio: 'inherit',
    windowsHide: true,
  }),
);
let stopping = false;
function close(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) if (child.exitCode === null) child.kill();
  process.exitCode = code;
}
for (const child of children) {
  child.once('error', (error) => {
    console.error(error.message);
    close(1);
  });
  child.once('exit', (code) => close(code ?? 0));
}
process.on('SIGINT', () => close());
process.on('SIGTERM', () => close());
console.log(
  '静态练习：http://127.0.0.1:4780/   Vue练习：http://127.0.0.1:4780/vue.html',
);
