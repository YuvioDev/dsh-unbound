# 适用范围

DSH Unbound 1.0.0 面向 DeepSeek-V4.1-Flash 1017 与 DeepSeek Harness 0.2.1-rc.2。

## 运行边界

当前验证环境为 Windows 与 Node.js 24，包含 Web 页面加载、提示词与终端调用、补丁备份、重复应用和还原。演练的外部工具需单独配置，其任务成功与否取决于工具、权限及目标环境。

Electron 桌面的完整安装升级与自动重启、Linux 环境及全部外部演练工具不在已完成验证范围内。不要将补丁状态等同于模型回答保证或所有环境的兼容承诺。

## 开发检查

源码提供回归用例及构建检查：

```sh
npm run build
npm test
npm run check:release
```

诊断导出不验证备份完整性，也不调用模型。
