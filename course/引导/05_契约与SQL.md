# 契约、关系模型与参数化SQL

先读现有v1返回，再形成字段、空值、状态、错误与权限表。TS类型只帮助开发，不会替代服务端运行时校验。独立函数契约和HTTP契约分层，辅助函数的boolean或错误数组需要服务层转换成HTTP响应。

Q07从JSON迁移到规范化SQLite，不能把整份JSON塞一列然后继续全量读写。Actor、Ticket、Event有主键、外键、NOT NULL和CHECK；version用于并发控制，archived保留记录。迁移版本成功后记录，重复启动不重灌，失败回滚不清库。

先在内存数据库做小实验，再写仓储：

```js
import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync(':memory:');
db.exec('CREATE TABLE example (id INTEGER PRIMARY KEY, label TEXT NOT NULL)');
db.prepare('INSERT INTO example(label) VALUES (?)').run('教学文本');
const result = db.prepare('SELECT id, label FROM example WHERE label = ?').all('教学文本');
console.log(result);
db.close();
```

这是通用入门示例，不是本题权限函数答案。正式仓储把输入作为参数绑定，字段与排序只能由白名单生成。NULL判断用IS NULL；JOIN保留范围要弄清INNER／LEFT差别。索引要按WHERE与ORDER BY和选择性论证，EXPLAIN QUERY PLAN核对，不能每列都加索引。

Node24.14的SQLite模块仍在开发中且同步执行，训练用于学SQL／事务和真实文件持久化；不宣称多实例生产能力。Node直接执行可擦除TS语法不会类型检查，仍要npm run typecheck。

参考：[Node24.14 SQLite](https://nodejs.org/download/release/v24.14.0/docs/api/sqlite.html)、[Node TypeScript](https://nodejs.org/docs/latest-v24.x/api/typescript.html)。
