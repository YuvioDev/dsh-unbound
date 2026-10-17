---
name: kimi-webbridge
description: 用月之暗面 Kimi 浏览器扩展（WebBridge）驱动用户真实 Chrome/Chromium：导航、读取页面、点击、填表、执行 JS、截图
whenToUse: 需要复用浏览器登录态访问后台/需要 JS 渲染的页面/需要真实浏览器指纹时
role: recon
enabled: true
---

# Kimi WebBridge（浏览器扩展 + 本地守护进程）

本插件不安装或启动 kimi-webbridge。以下示例以守护进程 v2.0.8、systemd 服务 `kimi-webbridge`、监听地址 `127.0.0.1:10086` 和程序路径 `~/.kimi-webbridge/bin/kimi-webbridge` 为参考；使用前核对实际版本、配置和运行状态。

## 环境核验

本技能不保证服务已启用、浏览器已安装扩展或连接已建立。请根据实际安装方式核对服务、扩展权限和连接状态；不要将断连直接归因于浏览器未启动。下列路径与启动器均须以本机配置为准。

## 先决条件
1. 守护进程已运行：`~/.kimi-webbridge/bin/kimi-webbridge status` 应显示 `"running": true`（是否开机自启取决于本机配置）。
2. **必须有一个浏览器在运行**（扩展只在浏览器进程存活时维持连接）。启动器 `~/.local/bin/kimi-chrome`：
   - 默认启动 Chrome **默认 profile**（带真实登录态，桥接的价值就在这）；
   - `KIMI_BROWSER=chromium kimi-chrome` 改用 Chromium；`KIMI_PROFILE=/path kimi-chrome` 指定独立 profile（无登录态）。
3. 检查连接：
```bash
curl -s http://127.0.0.1:10086/status | python3 -m json.tool
# 必须看到 "extension_connected": true，否则后续命令会失败
```

## 调用方式
```bash
WB=http://127.0.0.1:10086/command
call() { printf '%s' "$2" > /tmp/wb.json; curl -s -X POST $WB -H 'Content-Type: application/json' --data-binary @/tmp/wb.json; }
```
> 含中文的 JSON 一律走临时文件 + `--data-binary`，不要用 echo/heredoc 内联。

### 常用动作
```bash
# 打开页面（新标签）
call navigate '{"action":"navigate","args":{"url":"https://target.example.com/login","newTab":true,"group_title":"recon"},"session":"recon1"}'

# 读取页面纯文本（最常用）
call evaluate '{"action":"evaluate","args":{"code":"(() => document.body.innerText.slice(0,6000))()"},"session":"recon1"}'

# 取无障碍树（带 @e 元素引用，便于后续 click/fill）
call snapshot '{"action":"snapshot","args":{},"session":"recon1"}'

# 执行任意 JS：抓前端接口清单（信息收集/接口发现神器）
call evaluate '{"action":"evaluate","args":{"code":"(() => {const s=new Set();for(const e of performance.getEntriesByType(\"resource\"))s.add(e.name);const m=document.documentElement.innerHTML.match(/[\\\"\\x27]\\/(api|v[0-9])\\/[a-zA-Z0-9_\\-\\/{}]+/g)||[];m.forEach(x=>s.add(x));return [...s].slice(0,200).join(\"\\n\")})()"},"session":"recon1"}'

# 点击 / 填表
call click '{"action":"click","args":{"ref":"@e12"},"session":"recon1"}'
call fill  '{"action":"fill","args":{"ref":"@e15","value":"admin"},"session":"recon1"}'

# 截图（返回文件路径，不是 base64）
call screenshot '{"action":"screenshot","args":{"path":"$DSH_HOME/redteam/engagements/<靶标>/runs/shot.png"},"session":"recon1"}'

# 抓网络请求（找接口）
call network '{"action":"network","args":{},"session":"recon1"}'

# 列出/关闭标签
call list_tabs '{"action":"list_tabs","args":{},"session":"recon1"}'
call close_session '{"action":"close_session","args":{},"session":"recon1"}'
```
原始 CDP 透传（高级）：`{"action":"cdp","args":{"method":"Network.getAllCookies"}}`。

## 在红队流程里的用法
- **接口发现**：打开站点 → `evaluate` 抓 resource timing + 页面内 JS 里的接口路径 → 把接口清单交给漏洞检测角色做越权/未授权测试。
- **登录态页面**：用户在浏览器里已登录的后台，可直接 `navigate` + `evaluate` 读取内容，无需重新登录。
- **JS 渲染站点**：比 curl 更真实，能拿到 SPA 渲染后的 DOM。
- 发现的 URL/标题照常写回 `redteam_asset_add`（`tool="kimi-webbridge"`）。

## 限制（务必知道）
- **无 headless**：必须有图形会话（本机 `DISPLAY=:10.0` 可用）。
- 只支持 Chrome/Edge；跨域 iframe 不支持；`click`/`fill` 是合成事件，验证码/银行控件无效。
- 扩展与守护进程版本强耦合：`status` 里 `update_available` 不为空就按上面的 systemd 停机 → `upgrade` → 启机流程升级守护进程；扩展由策略自动更新到最新版。
- Linux 不在官方支持矩阵（能用但不保证）。

## 无扩展时的兜底
见技能 `browser-automation`（headless chromium 零依赖方案）。
