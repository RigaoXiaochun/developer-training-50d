console.error(
  '新版训练不提供自动清库。迁移或样本问题请保留数据并定位；测试使用独立临时库。',
);
process.exitCode = 1;
