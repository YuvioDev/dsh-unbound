/** The exercise panel must never install a package from an inherited channel. */
export function exerciseUpdateResponse(op, plugin) {
  if (!['version','updateCheck','updateApply'].includes(op)) return undefined;
  return {ok:op==='version',plugin,disabled:true,latest:null,updateAvailable:false,error:op==='version'?undefined:'请使用 DSH Unbound 发布包更新'};
}
