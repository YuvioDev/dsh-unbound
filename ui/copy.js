// Product copy only. Protocol keys and patch identifiers stay compatible.
Object.assign(zh, {
  "auth.title":"演练使用确认",
  "auth.lead":"DSH Unbound · 使用与演练规范 · 2026-10-17.3",
  "auth.warn":"请重点阅读授权范围、禁止行为、数据风险与责任边界。本确认不授予目标访问权限。",
  "auth.check.read":"我已阅读本版本《使用与演练规范》。",
  "auth.check.scope":"我会在每次任务前确认目标、方法、时间和数据范围的有效授权。",
  "auth.check.ban":"我了解实际操作与数据风险，并会在越界或异常时停止任务。",
  "auth.ok":"确认并继续", "auth.ok.tab":"确认并进入演练", "auth.ok.full":"确认并展开演练", "auth.ok.env":"确认并打开环境设置",
  "dock.toggle": "DSH Unbound", "uninstall.title": "卸载 DSH Unbound",
  "envGate.skipConfirm": "可继续对话。缺少的工具路径可在演练台中补充。",
  "dock.newSession": "Unbound", "dock.inSession": "Unbound", "dock.clean": "概览",
  "apply.hint": "", "own.hint": "", "purge.title": "概览",
  "saved.override": "已保存", "saved.restoreInject": "已恢复默认",
  "metric.bak.no": "未检测到", "metric.bak.hint": "插件备份",
  "hooksDeny.hint": "修改后需应用补丁并重启。"
});
Object.assign(en,{"auth.title":"Exercise use acknowledgement","auth.lead":"DSH Unbound · Usage and exercise rules · 2026-10-17.3","auth.warn":"Acknowledgement does not grant access to any target system.","auth.check.read":"I have read this version of the usage and exercise rules.","auth.check.scope":"I will confirm valid authorization for targets, methods, time and data before each task.","auth.check.ban":"I understand the operational and data risks and will stop on scope violations or unexpected impact.","auth.ok":"Acknowledge and continue","auth.ok.tab":"Acknowledge and open exercises","auth.ok.full":"Acknowledge and expand exercises","auth.ok.env":"Acknowledge and open environment settings"});
Object.assign(en, { "dock.toggle": "DSH Unbound", "uninstall.title": "Uninstall DSH Unbound", "envGate.skipConfirm": "You can continue chatting. Configure missing tool paths in Drill.", "dock.newSession": "Unbound", "dock.inSession": "Unbound", "dock.clean": "Overview", "apply.hint": "", "own.hint": "" });

Object.assign(zh,{"patch.28":"第三方提示词兼容","dock.clean":"维护","welcome.body":"DSH Unbound","welcome.repo":"","action.apply":"应用补丁","action.revert":"还原补丁","action.save":"保存设置"});
Object.assign(en,{"patch.28":"Third-party prompt compatibility","dock.clean":"Maintenance","welcome.body":"DSH Unbound","welcome.repo":""});

Object.assign(zh,{"hooksDeny.title":"Hooks 处理","hooksDeny.bypass":"忽略 Hooks 的 deny / ask 结果"});

Object.assign(zh,{"skills.title":"技能","skills.hint":"输入 /名称 调用已导入的技能。","skills.hint.desktop":"输入 /名称 调用已导入的技能。","skills.empty":"暂无技能","skills.pick":"","rules.pick":"","policy.strict":"不使用工作区规则","policy.fallback":"提示词为空时使用","policy.always":"遵循 DSH 设置","policy.hint":"","cwd.hint":"","cwd.title":"当前工作区","cwd.empty":"未找到 AGENTS.md 或 CLAUDE.md"});

Object.assign(zh,{
 "patch.38":"角色提示前缀兼容",
 "patch.39":"会话插件摘要兼容",
 "patch.42":"设置接口兼容",
 "patch.66":"空系统提示容错",
 "patch.67":"消息列表缺失容错",
 "patch.68":"回退消息内容容错",
 "patch.74":"首次请求加载默认提示词",
 "patch.85":"新消息使用独立轮次",
 "patch.86":"队列消息轮次处理",
 "patch.87":"提示词换行兼容与去重",
 "patch.88":"提示词完整性检查",
 "patch.90":"Web 身份与服务启动限制调整"
});
Object.assign(en,{
 "patch.38":"Persona prefix compatibility",
 "patch.39":"Session plugin summary compatibility",
 "patch.42":"Settings API compatibility",
 "patch.85":"New messages use separate turns",
 "patch.86":"Queued message turn handling",
 "patch.87":"Prompt newline normalization and deduplication",
 "patch.88":"Prompt completeness check",
 "patch.90":"Web identity and server-start restrictions"
});
