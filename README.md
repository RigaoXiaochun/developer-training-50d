# 开发能力进阶训练

这套练习从一个工单台原型开始，最后交出能启动、能验证的版本。20 项预计共 88 小时，各题可用时间合计 50 个自然日，包含休息日。上一项通过审核后，系统分配下一项并开始计时。

## 第一次启动

先完成公司要求的 GitHub Team 加入任务。通过培训系统审核后，从本仓库克隆起始工程，在独立训练目录运行。

```sh
npm ci
npm run check:base
npm test
npm run typecheck
npm run build
npm run dev
```

使用 Node 24.14 或更新的 24.x。打开 [工作台](http://127.0.0.1:4780/vue.html)。起始版本有 25 条虚构工单和 v1 接口，Vue 页面只有骨架。按 [50 天安排](course/总览.md) 从 Q01 做起，后面每题接着上一题的版本改。

## 怎么做和怎么交

先看本题的核心函数契约，关掉生成补全，自己实现和测试，留一次单独的核心提交。工程部分可以请工具协助。提交前看一遍改动，亲手复现关键路径，把遇到的问题写进 `learning/Qxx/`。

每题在培训系统填写完整 Git 提交 SHA 和完成说明，上传本题源码和必要的截图、日志。GitHub 流程用官方示例练习，训练代码留在本地和培训系统。

Q05、Q10、Q15、Q20 要现场验收。准备打开自己的代码，按带教给的变体现场调整，并用日语解释两分钟。成绩以培训系统的审核记录为准。

## 在哪里找细节

- [接口和示例数据](course/契约/接口与数据.md)
- [独立编码契约](course/核心编码契约.md)
- [界面参考](course/reference/index.html) 和 [UI 检查项](course/规范/UI与交互.md)
- [交付记录模板](course/模板/交付模板.md)

浏览器检查需要先停止开发服务。首次可运行 `npx playwright install chromium`。核心函数骨架和后续功能是留给学员的题目，启动时先跑上面的基线检查。

训练使用虚构数据和本地服务。本公开仓库供学员拉取。提交包只放本题需要审阅的源码和验证材料，排除环境配置、运行库、依赖目录和真实资料。

GitHub 练习可参考 [GitHub Skills](https://github.com/skills/introduction-to-github) 和 [PR 审查练习](https://github.com/skills/review-pull-requests)，接口测试可参考 [Full Stack Open](https://fullstackopen.com/en/part4/testing_the_backend/)。
