return h("section", { className: "dshp-panel unbound-main", "aria-label": "Unbound" },
  noticeNode(notice),
  s && (!s.ok || unboundStatus(s,located)!=="补丁已就绪") ? h("p",{role:"alert"},!s.ok?"状态读取失败":unboundStatus(s,located)):null,
  /* UNINSTALL_DIALOG */
  /* RESTART_DIALOG */
  h("div", { className:"unbound-editor-view", hidden: view !== "prompt" },
    h("label", { className: "unbound-sr-only", htmlFor: "unbound-prompt" }, "自定义提示词"),
    h("textarea", { id: "unbound-prompt", className: "dshp-area unbound-prompt", ref: promptAreaRef, value: override, onChange: e => { overrideRef.current = e.target.value; setOverride(e.target.value); }, spellCheck: false, placeholder: "输入提示词" }),
    h("div", { className: "dshp-row unbound-editor-actions" }, h(Btn, { disabled: patchBusy || !overrideLoaded || !defaultOverride, onClick: restoreOverride }, "恢复默认"), h(Btn, { kind: "primary", disabled: patchBusy || !overrideLoaded, onClick: saveOverride }, patchBusy ? "保存中…" : "保存")),
    promptBoxEmpty(override) ? h("p", { role: "alert" }, t("need.prompt")) : null
  ),
  h("div", { className:"unbound-settings-view", hidden: view !== "maintenance" },
    h("details",{className:"unbound-details unbound-module unbound-patch-actions"},h("summary",null,"补丁管理"),
h("div", {className:"unbound-health", role:"status"},
    h("span",null,!s ? "正在读取…" : !s.ok ? "读取失败" : unboundStatus(s,located))
  ),
    h("div", { className: "dshp-row" }, h(Btn, { kind: "primary", disabled: patchBusy || uninstallBusy || !overrideLoaded, onClick: () => doAction("apply", "action.apply") }, patchBusy ? "处理中…" : "应用补丁"), h(Btn, { disabled: patchBusy || uninstallBusy, onClick: () => doAction("revert", "action.revert") }, "还原补丁")),
    h("p",{className:"unbound-patch-total"},s ? (s.patches_applied||0) + " / " + (s.patches_total||0) + " 已应用" + (s.patches_skipped ? " · 跳过 " + s.patches_skipped : "") : "读取中…"),
    h(PatchGroups,{state:s}),
    h(UnboundDiagnostics,{onChecked:loadAll}),
    ),
    h("details", { className:"unbound-details unbound-module" }, h("summary", null, "运行设置"), h(HooksDenySection, { onSaved: loadAll }),
    h("details", { className: "unbound-details" }, h("summary", null, "网络范围"),
      h("textarea", { className: "dshp-area", "aria-label": "服务器范围", value: ownServers, onChange: e => setOwnServers(e.target.value), spellCheck: false, rows: 4, style: { minHeight: 100 } }),
      h(Btn, { disabled: !ownLoaded, onClick: () => apiJson("/dsh-purge/own-servers", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ content: ownServers }) }).then(d => { if (!d || !d.ok) throw Error(d?.error || "保存失败"); if (typeof d.content === "string") setOwnServers(d.content); setNotice({ kind: d.dropped ? "error" : "ok", text: d.dropped ? "已保存有效项，忽略 " + d.dropped + " 项无效输入" : "已保存" }); }).catch(e => setNotice({ kind: "error", text: e.message })) }, "保存范围")
    ),
    ),
    h("details", {className:"unbound-details unbound-module"}, h("summary",null,"资源管理"),
    h("details", {className:"unbound-details"}, h("summary",null,"工作区规则"), h(RulesSection,null)),
    h("details", {className:"unbound-details"}, h("summary",null,"技能"), h(SkillsSection,null)),
    ),
    h("details", {className:"unbound-details unbound-module"}, h("summary",null,"关于"),
    h("p",{className:"unbound-muted"},"DSH Unbound · " + (localVer||"—")),
    h("details", {className:"unbound-details"}, h("summary",null,"使用规范"),h("div",{className:"unbound-usage",dangerouslySetInnerHTML:{__html:AUTH_LEGAL_HTML}})),
    h("div", { className: "unbound-danger-zone" }, h(Btn, { kind: "danger", disabled: patchBusy || uninstallBusy, onClick: () => setAskUninstall(true) }, uninstallBusy ? "正在卸载…" : "卸载插件"))
    )
  )
);
}
