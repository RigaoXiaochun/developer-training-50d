import fs from 'node:fs/promises';
import path from 'node:path';
import { seedData } from './fixtures.mjs';

export class TrainingStore {
  pending = Promise.resolve();
  constructor(filename) {
    this.filename = filename;
  }
  async open() {
    await fs.mkdir(path.dirname(this.filename), { recursive: true });
    try {
      this.data = JSON.parse(await fs.readFile(this.filename, 'utf8'));
    } catch (error) {
      if (error.code !== 'ENOENT')
        throw new Error(
          '训练数据读取失败；请保留文件并按手册处理，不自动清空。',
        );
      this.data = seedData();
      await this.save(this.data);
    }
    if (
      !Array.isArray(this.data.tickets) ||
      !Array.isArray(this.data.events) ||
      !Number.isInteger(this.data.nextId)
    )
      throw new Error('训练数据格式不正确');
  }
  read() {
    return structuredClone(this.data);
  }
  async save(data) {
    const temporary = this.filename + '.writing';
    await fs.writeFile(temporary, JSON.stringify(data, null, 2) + '\n', 'utf8');
    await fs.rename(temporary, this.filename);
  }
  update(action) {
    const current = this.pending.then(async () => {
      const next = this.read(),
        result = action(next);
      await this.save(next);
      this.data = next;
      return structuredClone(result);
    });
    this.pending = current.catch(() => {});
    return current;
  }
}
