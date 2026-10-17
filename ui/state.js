function unboundClampWidth(width, viewport) { return Math.max(360,Math.min(760,Math.max(360,viewport-320),width)); }
function unboundStatus(s,located) {
 if(!located)return "未定位宿主";
 if(s.plugin_conflict)return "存在重复插件注册";
 if(s.host_supported===false)return "宿主版本不支持";
 if(s.patches_lost)return "补丁需重新应用";
 const statuses=(s.patches||[]).map(p=>p.status);
 if(statuses.some(x=>["unmatched","failed","pattern_not_found","read_error","missing_file"].includes(x)))return "存在异常补丁";
 if(Number(s.patches_pending||0)>0)return "有待应用补丁";
 if(!Number(s.patches_total||0))return "未检测到补丁";
 return "补丁已就绪";
}

function unboundPanelWidth(width,viewport,drill,full){return Math.min(viewport,full?viewport:drill?Math.max(980,width):width);}
