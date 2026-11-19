# 开发培训任务

本仓库提供工单管理系统的起始工程和任务书。按 [任务目录](course/总览.md) 完成各项工作。Q05、Q10、Q15、Q20 安排现场验收。

## 开始前

1. 完成培训系统中的公司 GitHub Team 加入任务，等待审核通过。
2. 在本仓库点击 **Fork**，将项目复制到自己的 GitHub 账号。克隆自己的 Fork，在本地完成开发。
3. 按任务书新建分支，独立完成核心函数并单独提交。完成工程改动与验证后，将分支推送到自己的 Fork。
4. 向本仓库的 `main` 提交 PR。将 **PR 链接、最终提交 SHA、完成说明、PR 截图和任务要求的验证附件** 交到培训系统。后续任务从自己上一项的通过版本继续。

仓库、分支和截图位置见 [提交指南](course/引导/02_GitHub交付.md)。任务分配、截止时间和审核结果以培训系统为准。

## 启动工程

使用 Node.js 24.14 或更新的 24.x，在克隆后的工程目录执行以下命令。

```sh
npm ci
npm run check:base
npm test
npm run typecheck
npm run build
npm run dev
```

开发服务启动后，打开 [工单工作台](http://127.0.0.1:4780/vue.html)。起始版本提供 25 条模拟工单、v1 API 和 Vue 入口。

首次执行浏览器检查前运行 `npx playwright install chromium`。运行浏览器检查时请先停止开发服务。

## 参考资料

- [训练与验收要求](course/规范/训练方式.md)
- [接口与数据规范](course/契约/接口与数据.md)
- [核心函数规范](course/核心编码契约.md)
- [交付记录模板](course/模板/交付模板.md)
- [界面示例](course/reference/示例截图.md)与 [UI 验收标准](course/规范/UI与交互.md)
