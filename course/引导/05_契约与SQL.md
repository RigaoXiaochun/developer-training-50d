# 接口约定与 SQLite 迁移

先从 v1 的真实请求与返回中确认字段、空值、权限、状态和错误。运行时校验在服务端执行。独立函数的结果由服务层转换成 HTTP 响应。

迁移采用 Actor、Ticket 和 Event 关系表及版本表。外键、`NOT NULL` 与 `CHECK` 用于限制数据。版本字段用于并发控制，归档保留原记录。迁移成功后记录版本，失败时回滚。

可以先在内存数据库验证参数绑定。

```js
import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync(':memory:');
db.exec('CREATE TABLE example (id INTEGER PRIMARY KEY, label TEXT NOT NULL)');
db.prepare('INSERT INTO example(label) VALUES (?)').run('教学文本');
const result = db.prepare('SELECT id, label FROM example WHERE label = ?').all('教学文本');
console.log(result);
db.close();
```

查询输入使用参数绑定。动态字段名和排序方向从白名单选取。使用 `IS NULL` 检查空值，结合 `EXPLAIN QUERY PLAN` 核对索引和排序。训练库使用单进程同步 SQLite 驱动。
