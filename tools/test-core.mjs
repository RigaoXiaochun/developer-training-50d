import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { root } from './base-check.mjs';
const specs = JSON.parse(
  fs.readFileSync(path.join(root, 'course/core-specs.json'), 'utf8'),
);
export async function testCore(id) {
  const spec = specs.find((s) => s.id === id);
  if (!spec) throw Error('使用Q01—Q20');
  const module = await import(
    pathToFileURL(path.join(root, 'exercises', id + '.ts'))
  );
  const fn = module[spec.name];
  assert.equal(typeof fn, 'function', '缺少导出函数' + spec.name);
  let count = 0;
  for (const sample of spec.cases) {
    const args = structuredClone(sample.args),
      before = structuredClone(args);
    if (sample.throws)
      assert.throws(
        () => fn(...args),
        (e) =>
          e.status === sample.throws.status && e.code === sample.throws.code,
      );
    else if (sample.sqlIds) {
      const { DatabaseSync } = await import('node:sqlite');
      const db = new DatabaseSync(':memory:');
      try {
        db.exec(
          "CREATE TABLE tickets(id TEXT,owner_id TEXT,assignee_id TEXT,archived INTEGER);INSERT INTO tickets VALUES('a','user-01','staff-01',0),('b','user-02','staff-01',0),('c','user-03',NULL,0),('d','user-01','staff-01',1)",
        );
        const query = fn(...args);
        assert.equal(typeof query.clause, 'string');
        assert.ok(Array.isArray(query.params));
        assert.ok(!query.clause.includes(args[0].id), '身份值不能拼接进SQL');
        const actual = db
          .prepare(
            'SELECT id FROM tickets WHERE ' + query.clause + ' ORDER BY id',
          )
          .all(...query.params)
          .map((r) => r.id);
        assert.deepEqual(actual, sample.sqlIds);
      } finally {
        db.close();
      }
    } else {
      const result = fn(...args);
      assert.deepEqual(result, sample.result);
      if (id === 'Q09') assert.notEqual(result, args[0], '必须返回新数组');
      if (id === 'Q05')
        assert.notEqual(result.ids, args[0], '选择结果必须是新数组');
      if (id === 'Q14')
        for (const arg of args) assert.notEqual(result, arg, '必须返回新对象');
    }
    assert.deepEqual(args, before, '核心函数修改了输入');
    count++;
  }
  if (id === 'Q18')
    for (const value of [NaN, Infinity, -Infinity]) {
      assert.throws(
        () => fn([value]),
        (e) => e.status === 400 && e.code === 'INVALID_SAMPLE',
      );
      count++;
    }
  if (id === 'Q20') {
    assert.deepEqual(fn({ value: 'number' }, { value: NaN }), {
      missing: [],
      unexpected: [],
      typeMismatch: ['value'],
    });
    count++;
  }
  console.log(
    `${id} ${spec.name}：${count}个固定样本通过；独立完成与理解须现场抽查。`,
  );
  return count;
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const id = process.argv[2];
  if (id === 'all') {
    for (const s of specs) await testCore(s.id);
  } else await testCore(id);
}
