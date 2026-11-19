# 从 Fork 到提交审核

## 第一次领取任务

1. 打开 [培训仓库](https://github.com/nekoraa/developer-training-50d)，点击 **Fork**，选择自己的 GitHub 账号。
2. 将下面的 `YOUR-GITHUB-NAME` 替换为自己的 GitHub 用户名，再执行命令。确认 `git remote -v` 显示的 `origin` 对应自己的账号。

```sh
git clone https://github.com/YOUR-GITHUB-NAME/developer-training-50d.git
cd developer-training-50d
git remote -v
git switch -c feat/q01-requirements-baseline
```

其他任务的分支名以对应任务书为准。上一项通过后，切到上一项通过的版本，从该版本建立本项训练分支。例如从 Q01 的分支开始 Q02。

```sh
git switch feat/q01-requirements-baseline
git switch -c feat/q02-github-delivery
```

## 完成代码并提交 PR

1. 独立完成核心函数和自拟反例，先做一次单独提交。完成工程改动后，核对 `git diff` 和 `git diff --cached`，提交核对过的文件。
2. 执行 `git push -u origin HEAD`，把当前任务分支推到自己的 Fork。执行 `git rev-parse HEAD` 获取最终 SHA。
3. 回到培训仓库，打开 **Pull requests → New pull request → compare across forks**。按下表选择仓库和分支。

| GitHub 选项 | 选择 |
|---|---|
| base repository | `nekoraa/developer-training-50d` |
| base | `main` |
| head repository | 自己的 Fork |
| compare | 本次任务分支，例如 `feat/q01-requirements-baseline` |

PR 标题使用 `开发培训任务 Q01` 这样的格式。说明本项实际改动和验证结果。从 Q02 起，同时填写上一项的最终 SHA，便于审核人核对本项新增差异。PR 检查会核对源分支名。有疑问时查看 PR 的 **Checks** 页。培训 PR 用于审阅和留档，由审核人在培训系统给出结论。

## 在培训系统交付

打开对应任务，填写 PR 链接、最终 SHA 和完成说明。上传 PR 页面截图，截图应能看到任务编号、源分支和提交信息，并附任务书要求的验证材料。如需补交，继续在同一分支提交，更新同一 PR，并在培训系统补交最新 SHA 和证据。

首次贡献时，若 PR 显示等待批准，请在培训系统完成说明中注明。维护者批准运行后，可在同一 PR 的 **Checks** 查看结果。

培训仓库及其 PR 为公开内容。公开提交只使用课程提供的模拟数据，账号资料、公司代码及其他内部信息请留在公开仓库之外。

[GitHub 官方 Fork 提交流程](https://docs.github.com/en/pull-requests/how-tos/create-pull-requests/creating-a-pull-request-from-a-fork)
