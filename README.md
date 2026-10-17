# DSH Unbound

面向 DeepSeek-V4.1-Flash 1017 的提示词注入与本地运行限制调整插件。支持自定义系统提示词、部分审批与工具限制调整、补丁应用及还原，并提供规则、技能与授权演练管理。

![补丁管理 · 深色](screenshots/dark.png)

## 功能

- **提示词注入**：编辑、保存或恢复系统提示词，管理自定义内容与宿主提示的组合。
- **运行限制调整**：通过本地补丁调整部分审批、沙箱及工具执行限制，配置 Hooks 结果处理与网络范围。
- **补丁维护**：按提示词、代码和工具查看数量及逐项状态，应用或还原当前宿主的补丁。
- **规则与技能**：管理工作区规则、技能导入及调用。
- **授权演练**：组织任务、资产和工具；外部工具需单独配置，并确认目标授权。
- **故障诊断**：导出插件与宿主版本、补丁编号和状态，辅助排查安装、注册冲突与匹配异常。

补丁状态表示本地修改的识别结果，不保证模型对任何请求都作出预期回答，也不代表绕过服务端策略。运行限制调整会改变执行控制，应结合实际权限和环境使用。

## 版本

- 插件：1.0.0
- 宿主：DSH 0.2.1-rc.2
- 目标模型：DeepSeek-V4.1-Flash 1017

外观自动跟随 DSH。维护操作仅针对当前宿主。

![工具补丁明细](screenshots/patch-details.png)

## 安装

从 [v1.0.0 发布页](https://github.com/baihangyu486-blip/dsh-unbound/releases/tag/v1.0.0) 下载安装包并核对 SHA256。

1. 在插件管理中停用已有的 dsh-purge，完全退出 DSH。
2. 安装：

```powershell
dsh plugin --profile desktop add "C:\path\to\dsh-unbound-1.0.0.tgz"
```

Web 使用 `--profile web`。

3. 启动 DSH，启用 DSH Unbound。若未登记插件，在源码目录执行：

```powershell
node scripts/activate-profile.mjs --profile desktop
```

4. 打开 **Unbound → 设置**，核对宿主路径后应用补丁，完全退出并重新打开 DSH。

首次应用前保留同版宿主备份。提示词保存在 `$DSH_HOME/prompt-inject.md`，安装不覆盖已有内容。使用本地安装包更新。

## 开发

Node.js 18+。

```sh
npm run build
npm test
npm run check:release
npm run pack:release
```

适用范围见 [SUPPORT.md](SUPPORT.md)。基于 [YuJunZhiXue/dsh-purge](https://github.com/YuJunZhiXue/dsh-purge)（作者：小杨）衍生开发。许可及来源记录见 [LICENSE](LICENSE)、[NOTICE.md](NOTICE.md)。

## 诊断与使用规范

在 **设置 → 补丁管理** 中刷新状态或导出报告，检查版本、插件冲突、补丁状态和备份记录。报告用于提交问题时辅助排错，不包含提示词、账户凭据和原始路径；不会自动上传。自检不调用模型，不验证备份完整性。

[使用与演练规范](USAGE.md) · [数据处理](DATA.md) · [安全问题报告](SECURITY.md)

## 使用要求

安装或启用前，请阅读[使用与演练规范](USAGE.md)，重点核对允许用途、禁止行为、数据处理、风险责任及维护政策。演练入口须主动确认；任何确认都不代替目标授权，也不排除依法不得免除的责任。
