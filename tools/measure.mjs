import fs from 'node:fs/promises';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
const args = process.argv.slice(2),
  get = (key, fallback) => {
    const i = args.indexOf(key);
    return i < 0 ? fallback : args[i + 1];
  };
const base = new URL(get('--base', 'http://127.0.0.1:4780/api/training/'));
if (
  base.hostname !== '127.0.0.1' ||
  base.protocol !== 'http:' ||
  base.pathname !== '/api/training/' ||
  base.username ||
  base.password ||
  base.search ||
  base.hash
)
  throw Error('只允许回环训练服务标准路径，不接受业务或公网目标');
const samples = Number(get('--samples', '500')),
  concurrency = Number(get('--concurrency', '10'));
if (
  !Number.isInteger(samples) ||
  samples < 1 ||
  samples > 2000 ||
  !Number.isInteger(concurrency) ||
  concurrency < 1 ||
  concurrency > 20
)
  throw Error('samples 1—2000，concurrency 1—20');
const health = await fetch(new URL('health', base)).then((r) => r.json());
if (
  health.data?.mode !== 'local-training-only' ||
  health.data?.storage !== 'sqlite'
)
  throw Error('必须是Q07之后明确标识的本地SQL训练服务；拒绝JSON基线');
const headers = { 'X-Training-Actor': 'user-01' };
if (args.includes('--seed')) {
  if (!args.includes('--confirm-local-seed'))
    throw Error('生成样本需显式--confirm-local-seed，只操作独立训练库');
  const count = Number(get('--seed', '10000'));
  if (count !== 10000) throw Error('固定样本10000条');
  for (let i = 0; i < count; i++) {
    const r = await fetch(new URL('v1/tickets', base), {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
        'Idempotency-Key': 'perf-v2-' + String(i).padStart(5, '0'),
      },
      body: JSON.stringify({
        title: '性能样本 [PERF-V2] ' + i,
        description: '仅本地训练，不含真实资料。',
        category: 'support',
      }),
    });
    if (r.status !== 201) throw Error('样本创建失败：' + r.status);
    await r.arrayBuffer();
    if ((i + 1) % 1000 === 0) console.log('已确认样本 ' + (i + 1));
  }
}
const route = new URL('v2/tickets?pageSize=20', base);
for (let i = 0; i < 20; i++) {
  const r = await fetch(route, { headers });
  if (!r.ok) throw Error('预热失败：' + r.status);
  await r.arrayBuffer();
}
let next = 0;
const raw = [];
await Promise.all(
  Array.from({ length: concurrency }, async (_, worker) => {
    while (next < samples) {
      const index = next++,
        start = performance.now();
      let status = 0,
        error = null;
      try {
        const response = await fetch(route, {
          headers,
          signal: AbortSignal.timeout(10000),
        });
        status = response.status;
        await response.arrayBuffer();
      } catch (e) {
        error = e.name;
      }
      raw.push({ index, worker, status, ms: performance.now() - start, error });
    }
  }),
);
const sorted = raw.map((r) => r.ms).sort((a, b) => a - b),
  percentile = (p) => sorted[Math.ceil(p * sorted.length) - 1];
const report = {
  at: new Date().toISOString(),
  environment: { node: process.version, platform: process.platform },
  scope: '本地读取工具，不证明写一致性或生产容量；计时不含分配worker前等待',
  warmup: 20,
  samples,
  concurrency,
  p50: percentile(0.5),
  p95: percentile(0.95),
  max: sorted.at(-1),
  unexpectedErrors: raw.filter((r) => r.status !== 200).length,
  raw: raw.sort((a, b) => a.index - b.index),
};
const directory = path.resolve('.local/performance');
await fs.mkdir(directory, { recursive: true });
const filename = path.join(directory, Date.now() + '.json');
await fs.writeFile(filename, JSON.stringify(report, null, 2), 'utf8');
console.log(
  JSON.stringify(
    {
      samples,
      p95: report.p95,
      max: report.max,
      unexpectedErrors: report.unexpectedErrors,
      report: filename,
    },
    null,
    2,
  ),
);
if (report.unexpectedErrors) process.exitCode = 1;
