import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createServer } from '../server/app.mjs';
export async function setup(t) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'vibe20-test-'));
  const filename = path.join(directory, 'training.db');
  let api, base;
  async function start() {
    api = await createServer(filename);
    const address = await api.listen(0);
    base = 'http://127.0.0.1:' + address.port + '/api/training/';
  }
  await start();
  t.after(async () => {
    await api.close();
    const p = path.resolve(directory);
    assert.equal(path.dirname(p), path.resolve(os.tmpdir()));
    assert.ok(path.basename(p).startsWith('vibe20-test-'));
    await fs.rm(p, { recursive: true });
  });
  const call = async (
    route = '',
    method = 'GET',
    data,
    actor = 'user-01',
    headers = {},
  ) => {
    const response = await fetch(base + route, {
      method,
      headers: {
        'X-Training-Actor': actor,
        ...(data === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...headers,
      },
      ...(data === undefined ? {} : { body: JSON.stringify(data) }),
    });
    return { status: response.status, body: await response.json() };
  };
  return {
    call,
    restart: async () => {
      await api.close();
      await start();
    },
  };
}
export const draft = {
  title: '训练工单',
  description: '仅为虚构样本',
  category: 'support',
};
