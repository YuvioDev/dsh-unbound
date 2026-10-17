function unboundDiagnosticReport(state,checkedAt=new Date().toISOString()) {
  if(!state || state.ok!==true || state.ready===false)throw Error("状态读取失败，请重试");
  const allowed=new Set(["applied","pending","unmatched","failed","pattern_not_found","read_error","missing_file","skipped","off","na"]);
  const patches=(Array.isArray(state.patches)?state.patches:[]).map(p=>({id:Number.isSafeInteger(Number(p.id))?Number(p.id):null,status:allowed.has(p.status)?p.status:"unknown"}));
  const unexpected=patches.filter(p=>!["applied","skipped","off","na"].includes(p.status));
  const version=typeof state.host_version==="string" && /^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$/.test(state.host_version)?state.host_version:null;
  const pluginVersion=typeof state.plugin_version==="string" && /^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$/.test(state.plugin_version)?state.plugin_version:null;
  const checks=[
    {id:"host",label:"宿主版本",status:version==="0.2.1-rc.2"?"pass":version?"fail":"unknown",detail:version||"未识别"},
    {id:"conflict",label:"插件冲突",status:state.plugin_conflict===false?"pass":state.plugin_conflict===true?"fail":"unknown",detail:state.plugin_conflict===true?"存在重复注册":state.plugin_conflict===false?"正常":"未检查"},
    {id:"patches",label:"补丁状态",status:state.patches_lost||unexpected.length||Number(state.patches_pending)>0?"fail":patches.length?"pass":"unknown",detail:state.patches_lost?"需重新应用":unexpected.length?unexpected.length+" 项待处理或异常":patches.length?"无待处理或异常":"无可用数据"},
    {id:"backup",label:"备份记录",status:state.has_backup===true?"present":state.has_backup===false?"missing":"unknown",detail:state.has_backup===true?"已检测到，未验证完整性":state.has_backup===false?"未检测到":"未检查"},
    {id:"model",label:"模型效果",status:"not_tested",detail:"本次未调用模型"}
  ];
  return {schema:"dsh-unbound.diagnostics.v1",checkedAt,pluginVersion,hostVersion:version,surface:["web","desktop","gui","tui"].includes(state.surface)?state.surface:"unknown",checks,patches};
}
function UnboundDiagnostics({onChecked}) {
 const [report,setReport]=useState(null),[busy,setBusy]=useState(""),[error,setError]=useState("");
 const run=async(exportFile=false)=>{if(busy)return;setBusy(exportFile?"export":"check");setError("");setReport(null);try{
  const fresh=unboundDiagnosticReport(await apiJson("/dsh-purge/status"));setReport(fresh);onChecked?.();
  if(exportFile){const blob=new Blob([JSON.stringify(fresh,null,2)+"\n"],{type:"application/json"});const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="dsh-unbound-diagnostics.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
 }catch(e){setError("检查失败，请重试")}finally{setBusy("")}};
 const issues=report?.checks.filter(c=>["fail","unknown","missing"].includes(c.status))||[];
 return h("div",null,h("div",{className:"dshp-row unbound-diagnostic-actions"},h(Btn,{disabled:!!busy,onClick:()=>run(false)},busy==="check"?"刷新中…":"刷新"),h(Btn,{disabled:!!busy,title:"下载版本与补丁状态，供排错使用",onClick:()=>run(true)},busy==="export"?"导出中…":"导出报告")),error?h("p",{role:"alert"},error):null,issues.length?h("dl",{className:"unbound-meta"},issues.map(c=>h("div",{key:c.id},h("dt",null,c.label),h("dd",null,c.detail)))):null);
}
