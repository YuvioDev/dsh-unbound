# 开发与贡献

开发环境：Node.js 18+。下载并解压源码，在项目根目录执行：

```sh
npm run build          # 生成客户端
npm test               # 运行回归检查
npm run check:release  # 检查语法、构建一致性与敏感文件
npm run pack:release   # 检查并生成安装包
```

界面源文件位于 `ui/`，运行逻辑位于 `lib/`，构建与发布脚本位于 `scripts/`。修改界面后应重新构建，不要仅修改生成的 `client.js`。安装包生成在项目目录的上一层。

提交改动请说明用途、适用版本和验证结果，保留许可信息，清除凭据、私人提示词及真实目标数据。实际宿主验证与自动检查的区别见 [SUPPORT.md](SUPPORT.md)，敏感漏洞按 [SECURITY.md](SECURITY.md) 私密提交。

