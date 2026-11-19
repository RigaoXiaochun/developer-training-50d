import { test } from 'node:test';
import assert from 'node:assert/strict';
import { setup, draft } from './helpers.mjs';
test('健康、身份和来源边界', async (t) => {
  const { call } = await setup(t);
  assert.equal((await call('health', 'GET', undefined, '')).status, 200);
  assert.equal(
    (await call('v1/tickets', 'GET', undefined, 'unknown')).status,
    401,
  );
  assert.equal(
    (
      await call('v1/tickets', 'GET', undefined, 'user-01', {
        Origin: 'https://invalid.example',
      })
    ).status,
    403,
  );
});
test('角色范围、分页与未知查询', async (t) => {
  const { call } = await setup(t);
  for (const [actor, field] of [
    ['user-01', 'ownerId'],
    ['staff-01', 'assigneeId'],
  ]) {
    const result = await call(
      'v1/tickets?pageSize=20',
      'GET',
      undefined,
      actor,
    );
    assert.equal(result.status, 200);
    assert.ok(result.body.data.length > 0);
    assert.ok(result.body.data.every((row) => row[field] === actor));
  }
  const page = await call(
    'v1/tickets?page=2&pageSize=5',
    'GET',
    undefined,
    'manager-01',
  );
  assert.equal(page.body.data.length, 5);
  assert.equal(page.body.meta.total, 25);
  for (const query of [
    'page=0',
    'pageSize=7',
    'status=bad',
    'unknown=x',
    'priority=high',
  ])
    assert.equal((await call('v1/tickets?' + query)).status, 400);
});
test('真实创建、重启持久及事件', async (t) => {
  const { call, restart } = await setup(t);
  const created = await call('v1/tickets', 'POST', draft);
  assert.equal(created.status, 201);
  const id = created.body.data.id;
  assert.equal(
    (await call('v1/tickets/' + id + '/events')).body.data.filter(
      (e) => e.action === 'CREATED',
    ).length,
    1,
  );
  await restart();
  const detail = await call('v1/tickets/' + id);
  assert.equal(detail.status, 200);
  assert.equal(detail.body.data.title, draft.title);
});
test('输入校验和Unicode边界不留下无效记录', async (t) => {
  const { call } = await setup(t);
  const before = (await call('v1/tickets')).body.meta.total;
  for (const data of [
    { ...draft, title: ' ' },
    { ...draft, title: '😀'.repeat(61) },
    { ...draft, description: '字'.repeat(1001) },
    { ...draft, category: 'bad' },
    { ...draft, ownerId: 'user-02' },
    [],
  ])
    assert.equal((await call('v1/tickets', 'POST', data)).status, 400);
  assert.equal((await call('v1/tickets')).body.meta.total, before);
  assert.equal(
    (await call('v1/tickets', 'POST', { ...draft, title: '😀'.repeat(60) }))
      .status,
    201,
  );
  assert.equal(
    (await call('v1/tickets', 'POST', draft, 'staff-01')).status,
    403,
  );
  assert.equal(
    (
      await call('v1/tickets', 'POST', {
        ...draft,
        description: 'x'.repeat(17000),
      })
    ).status,
    413,
  );
  assert.equal(
    (
      await call('v1/tickets', 'POST', draft, 'user-01', {
        'Content-Type': 'text/plain',
      })
    ).status,
    415,
  );
});
test('对象与字段权限、分配、旧版本保护', async (t) => {
  const { call } = await setup(t);
  const id = (await call('v1/tickets', 'POST', draft)).body.data.id,
    url = 'v1/tickets/' + id;
  assert.equal((await call(url, 'GET', undefined, 'user-02')).status, 404);
  assert.equal(
    (await call(url, 'PATCH', { version: 1, status: 'resolved' })).status,
    403,
  );
  assert.equal(
    (
      await call(
        url,
        'PATCH',
        { version: 1, assigneeId: 'staff-01' },
        'manager-01',
      )
    ).status,
    200,
  );
  assert.equal(
    (await call(url, 'PATCH', { version: 1, title: '旧版本' })).status,
    409,
  );
  assert.equal(
    (await call(url, 'PATCH', { version: 2, status: 'resolved' }, 'staff-01'))
      .status,
    200,
  );
  assert.equal(
    (await call(url, 'PATCH', { version: 3, title: '禁止编辑' })).status,
    409,
  );
  assert.equal((await call(url)).body.data.title, draft.title);
});
test('同版本并发更新只能成功一次', async (t) => {
  const { call } = await setup(t);
  const id = (await call('v1/tickets', 'POST', draft)).body.data.id;
  const result = await Promise.all(
    ['甲', '乙'].map((title) =>
      call('v1/tickets/' + id, 'PATCH', { version: 1, title }),
    ),
  );
  assert.deepEqual(result.map((r) => r.status).sort(), [200, 409]);
  assert.equal((await call('v1/tickets/' + id)).body.data.version, 2);
});
test('归档权限、版本与不可见范围', async (t) => {
  const { call } = await setup(t);
  const id = (await call('v1/tickets', 'POST', draft)).body.data.id,
    url = 'v1/tickets/' + id;
  assert.equal((await call(url, 'DELETE', { version: 1 })).status, 403);
  assert.equal(
    (await call(url, 'DELETE', { version: 0 }, 'manager-01')).status,
    400,
  );
  assert.equal(
    (await call(url, 'DELETE', { version: 99 }, 'manager-01')).status,
    409,
  );
  assert.equal(
    (await call(url, 'DELETE', { version: 1 }, 'manager-01')).status,
    200,
  );
  for (const actor of ['user-01', 'staff-01', 'manager-01'])
    assert.equal((await call(url, 'GET', undefined, actor)).status, 404);
});
