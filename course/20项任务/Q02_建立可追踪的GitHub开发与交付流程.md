# Q02 让一次改动有据可查

第 3–4 天，留 2 天。预计用时 4 小时。

在本地训练仓库建分支、提交并审查 diff。按 GitHub 官方练习体验 Issue 和 PR 流程，练习里使用公开示例代码。为训练项目保留本地检查命令，记录一次真实失败及修复。

先在 `exercises/Q02.ts` 独立完成 `parseBranch`。看[Q02 核心函数](../核心编码契约.md#q02-parsebranch)，补三个自己设计的反例，先做一次核心提交，再请工具协助后面的工程改动。

从 [本题引导](../引导/02_GitHub交付.md) 开始。接口以 [接口与数据](../契约/接口与数据.md) 为准。分支用 `feat/q02-github-delivery`。

## 改动范围

- `README.md`
- `.github/workflows/`
- `learning/Q02/`

## 具体要求

- 从上题提交建分支，调整启动说明，审查差异后提交。
- 在 GitHub 官方示例仓库动手做一次 Issue 和 PR 练习。
- 在本地跑类型检查、构建和基线测试，记录一次真实失败和修复。

## 交什么

交本地提交 SHA、分支记录、检查结果和官方练习中可公开的 PR 证据。

在 `learning/Q02/` 留 [交付记录](../模板/交付模板.md)，把实际失败和没有做过的检查写清楚。

- 本地分支、完整 SHA 和检查结果一一对应。
- 能解释 GitHub 练习里的 Issue、PR 和合并流程。
- 课程源码仅随系统附件提交。

## 验收命令

```text
npm run test:core -- Q02
npm test
npm run test:learner
npm run typecheck
npm run build
npm run check:task -- Q02
```

留一个能用自己的代码回答的问题。PR在上一次提交检查通过后又改了文件，为什么还要重新检查？

日语练习：コミット、プッシュ、マージの違いを説明してください。

<details>
<summary>卡住时再看</summary>

1. 先运行git status和git remote -v，确认根目录与origin。
2. 拿一个实际提交解释工作区、暂存区、远端三种位置。
3. CI从固定命令起步，不添加需要云权限的发布步骤。

</details>
