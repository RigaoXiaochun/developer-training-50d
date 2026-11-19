import { test } from 'node:test';
import assert from 'node:assert/strict';
import { setup, draft } from '../helpers.mjs';
const q = Number((process.env.QID ?? '').slice(1));
test('Q08 创建幂等、规范请求、并发和重启', { skip: !(q >= 8) }, async (t) => {
  const { call, restart } = await setup(t);
  const headers = { 'Idempotency-Key': 'training-key-0001' };
  const results = await Promise.all(
    Array.from({ length: 5 }, () =>
      call('v1/tickets', 'POST', draft, 'user-01', headers),
    ),
  );
  assert.ok(results.every((r) => r.status === 201));
  assert.equal(new Set(results.map((r) => r.body.data.id)).size, 1);
  const id = results[0].body.data.id;
  assert.equal(
    (await call('v1/tickets/' + id + '/events')).body.data.filter(
      (e) => e.action === 'CREATED',
    ).length,
    1,
  );
  assert.equal(
    (
      await call(
        'v1/tickets',
        'POST',
        { ...draft, title: '不同请求' },
        'user-01',
        headers,
      )
    ).status,
    409,
  );
  await restart();
  const replay = await call(
    'v1/tickets',
    'POST',
    { ...draft, title: ' ' + draft.title + ' ' },
    'user-01',
    headers,
  );
  assert.equal(replay.status, 201);
  assert.equal(replay.body.data.id, id);
});
test('Q12 批量版本冲突必须整体回滚', { skip: !(q >= 12) }, async (t) => {
  const { call } = await setup(t);
  const one = (await call('v1/tickets', 'POST', draft)).body.data;
  const two = (await call('v1/tickets', 'POST', draft)).body.data;
  await call(
    'v1/tickets/' + two.id,
    'PATCH',
    { version: 1, status: 'in_progress' },
    'manager-01',
  );
  const failed = await call(
    'v2/bulk-status',
    'POST',
    {
      items: [
        { id: one.id, version: 1 },
        { id: two.id, version: 1 },
      ],
      status: 'resolved',
    },
    'manager-01',
  );
  assert.equal(failed.status, 409);
  assert.equal(failed.body.error.code, 'BULK_VERSION_CONFLICT');
  const preserved = (await call('v1/tickets/' + one.id)).body.data;
  assert.equal(preserved.status, 'open');
  assert.equal(preserved.version, 1);
  const success = await call(
    'v2/bulk-status',
    'POST',
    {
      items: [
        { id: one.id, version: 1 },
        { id: two.id, version: 2 },
      ],
      status: 'resolved',
    },
    'manager-01',
  );
  assert.equal(success.status, 200);
  assert.deepEqual(success.body.data.updatedIds, [one.id, two.id]);
  assert.equal(
    (
      await call(
        'v2/bulk-status',
        'POST',
        { items: [{ id: one.id, version: 2 }], status: 'open' },
        'user-01',
      )
    ).status,
    403,
  );
});
test('Q13 游标分页稳定且输入严格校验', { skip: !(q >= 13) }, async (t) => {
  const { call } = await setup(t);
  const first = await call(
    'v2/tickets?pageSize=2',
    'GET',
    undefined,
    'manager-01',
  );
  assert.equal(first.status, 200);
  assert.equal(first.body.data.length, 2);
  assert.equal(first.body.meta.hasMore, true);
  const second = await call(
    'v2/tickets?pageSize=2&cursor=' +
      encodeURIComponent(first.body.meta.nextCursor),
    'GET',
    undefined,
    'manager-01',
  );
  assert.equal(second.status, 200);
  assert.equal(
    new Set([...first.body.data, ...second.body.data].map((r) => r.id)).size,
    4,
  );
  assert.equal(
    (await call('v2/tickets?cursor=bad', 'GET', undefined, 'manager-01'))
      .status,
    400,
  );
});
test(
  'Q16 优先级统计先权限、搜索和状态，再优先级',
  { skip: !(q >= 16) },
  async (t) => {
    const { call } = await setup(t);
    for (const actor of ['user-01', 'staff-01', 'manager-01']) {
      const all = await call(
          'v2/overview?pageSize=20',
          'GET',
          undefined,
          actor,
        ),
        high = await call(
          'v2/overview?priority=high&pageSize=20',
          'GET',
          undefined,
          actor,
        );
      assert.equal(all.status, 200);
      assert.equal(high.status, 200);
      assert.deepEqual(
        all.body.meta.priorityCounts,
        high.body.meta.priorityCounts,
      );
      assert.equal(
        Object.values(all.body.meta.priorityCounts).reduce((a, b) => a + b, 0),
        all.body.meta.total,
      );
      assert.ok(high.body.data.every((r) => r.priority === 'high'));
    }
  },
);
