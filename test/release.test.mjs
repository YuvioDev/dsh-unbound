import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import vm from 'node:vm';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const temp=fs.mkdtempSync(path.join(process.env.UNBOUND_TEST_TMP || os.tmpdir(),'unbound-test-'));
process.env.DSH_HOME=path.join(temp,'home');
process.env.DSH_BASE=path.join(temp,'host');
process.env.DSH_SURFACE='web';
const core=await import('../lib/core.js');
const identity=await import('../lib/identity.js');
const updater=await import('../lib/update.js');
const uninstall=await import('../lib/uninstall.js');
const {hostFs}=await import('../lib/extract-asar.js');
test('Exercise updates cannot query or install from an inherited release channel',async()=>{
  const {exerciseUpdateResponse}=await import('../lib/release-channel.js');
  for(const op of ['version','updateCheck','updateApply']){
    const r=exerciseUpdateResponse(op,{name:'dsh-unbound',version:'1.0.0'});
    assert.equal(r.disabled,true);assert.equal(r.updateAvailable,false);
    assert.equal(r.ok,op==='version');
  }
  assert.equal(exerciseUpdateResponse('listAssets',{}),undefined);
});
test('Exercise preset resolves this package and migrates both older tool references',async()=>{
  const {renderToolsPackage}=await import('../lib/redteam/index.js');
  for(const old of ['dsh-purge/redteam/tools','dsh-redteam-mode/tools']){
    const r=renderToolsPackage('name: '+old+'\n# user settings');
    assert.equal(r.text,'name: dsh-unbound/redteam/tools\n# user settings');
    assert.equal(renderToolsPackage(r.text).changed,false);
  }
  assert(fs.readFileSync(path.join(root,'presets/redteam/agent.cordis.yml'),'utf8').includes('name: dsh-unbound/redteam/tools'));
});
const ui=vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(root,'ui/state.js'),'utf8'),ui);
vm.runInContext(fs.readFileSync(path.join(root,'ui/diagnostics.js'),'utf8'),ui);
test('Diagnostic export uses an allowlist and does not claim backup or model validation',()=>{
  const privateValue='PRIVATE_TEST_SENTINEL';
  const state={ok:true,ready:true,host_version:'0.2.1-rc.2',plugin_version:'1.0.0',surface:'web',plugin_conflict:false,has_backup:true,patches_pending:0,patches:[{id:40,status:'applied',name:privateValue,path:privateValue}],ai_base:privateValue,override:privateValue,credentials:privateValue,session:privateValue};
  const report=ui.unboundDiagnosticReport(state,'2026-10-17T00:00:00.000Z');
  assert(!JSON.stringify(report).includes(privateValue));
  assert.equal(report.checks.find(c=>c.id==='backup').status,'present');
  assert.equal(report.checks.find(c=>c.id==='model').status,'not_tested');
  assert.equal(ui.unboundDiagnosticReport({...state,patches:[{id:40,status:'unmatched'}]}).checks.find(c=>c.id==='patches').status,'fail');
  assert.equal(ui.unboundDiagnosticReport({...state,patches:[]}).checks.find(c=>c.id==='patches').status,'unknown');
  assert.throws(()=>ui.unboundDiagnosticReport({ok:false}));
});
test('Exercise acknowledgement is edition-specific and bound to the declaration version',async()=>{
  const grant=await import('../lib/drill-grant.js');
  const home=path.join(temp,'acknowledgement'),dir=path.join(home,'dsh-purge');fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,'drill-grant.json'),JSON.stringify({granted:true}));
  assert.equal(grant.readDrillGrant(home).granted,false);
  assert.equal(grant.writeDrillGrant(home).granted,true);
  fs.writeFileSync(grant.drillGrantPath(home),JSON.stringify({granted:true,usageVersion:'older'}));
  assert.equal(grant.readDrillGrant(home).granted,false);
  assert.equal(grant.clearDrillGrant(home),true);
  assert(fs.existsSync(path.join(dir,'drill-grant.json')));
  const client=fs.readFileSync(path.join(root,'client.js'),'utf8');
  assert(client.includes('DSH Unbound 使用与演练规范'));
  assert(!client.includes('违约即终止授权'));
});
test('Overview never reports ready for an unmatched or lost patch',()=>{
  const state={patches_total:64,patches_pending:0,patches:[{status:'unmatched'}]};
  assert.equal(ui.unboundStatus(state,true),'存在异常补丁');
  assert.equal(ui.unboundStatus({...state,patches:[],patches_lost:true},true),'补丁需重新应用');
  assert.equal(ui.unboundStatus({...state,patches:[],plugin_conflict:true},true),'存在重复插件注册');
  assert.equal(ui.unboundStatus({...state,patches:[],host_supported:false},true),'宿主版本不支持');
  assert.equal(ui.unboundStatus({...state,patches:[]},true),'补丁已就绪');
});
test('Resizing preserves conversation space for mouse, keyboard and viewport changes',()=>{
  assert.equal(ui.unboundClampWidth(760,800),480);
  assert.equal(ui.unboundClampWidth(760,1200),760);
  assert.equal(ui.unboundClampWidth(100,1200),360);
});
test('Host version and active legacy bundle are checked; inactive dependencies do not conflict',()=>{
  const base=path.join(temp,'compatibility');fs.mkdirSync(path.join(base,'dsh'),{recursive:true});
  const manifest=path.join(base,'dsh/package.json');
  fs.writeFileSync(manifest,JSON.stringify({version:'0.2.1-rc.2'}));
  const profile=path.join(process.env.DSH_HOME,'profiles/web');fs.mkdirSync(profile,{recursive:true});
  fs.writeFileSync(path.join(profile,'package.json'),JSON.stringify({dependencies:{'dsh-purge':'1'},dsh:{profile:{bundles:['dsh-unbound']}}}));
  assert.equal(core.currentHostCompatibility(base).host_supported,true);
  assert.equal(core.currentHostCompatibility(base).plugin_conflict,false);
  fs.writeFileSync(path.join(profile,'package.json'),JSON.stringify({dsh:{profile:{bundles:['dsh-purge','dsh-unbound']}}}));
  assert.equal(core.currentHostCompatibility(base).plugin_conflict,true);
  fs.writeFileSync(manifest,JSON.stringify({version:'0.2.0'}));
  assert.equal(core.currentHostCompatibility(base).host_supported,false);
  fs.writeFileSync(path.join(profile,'package.json'),'{}');
});
test('Maintenance excludes unrelated hosts and launchers',()=>{
  const host=process.env.DSH_BASE;fs.mkdirSync(path.join(host,'dsh-agent-instructions/lib'),{recursive:true});
  assert.deepEqual(core.enumeratePatchAiBases({discover:true}),[host]);
  const launchers=path.join(temp,'launchers');fs.mkdirSync(launchers);
  fs.writeFileSync(path.join(launchers,'dsh.cmd'),'node "C:/unrelated/dsh/lib/bin.js"');
  assert.equal(core.shimTargetsCurrentHost(launchers,host),false);
  fs.writeFileSync(path.join(launchers,'dsh.cmd'),'node "'+path.join(host,'dsh/lib/bin.js')+'"');
  assert.equal(core.shimTargetsCurrentHost(launchers,host),true);
});
test.after(()=>fs.rmSync(temp,{recursive:true,force:true}));

test('Windows backup handles close before atomic replacement',async()=>{
  const source=path.join(temp,'source.txt'),dest=path.join(temp,'source.bak');
  fs.writeFileSync(source,'original\r\nbytes');
  const fd=hostFs.openSync(dest,'wx');hostFs.closeSync(fd);
  await core.atomicCopyFile(source,dest);
  assert.deepEqual(fs.readFileSync(dest),fs.readFileSync(source));
});

test('Repeated marker-free patches do not overwrite original backups',()=>{
  const dir=path.join(temp,'host');fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,'package.json'),JSON.stringify({version:'1.0.0'}));
  const f=path.join(dir,'entry.js'),bak=f+'.dshpurge.bak';
  fs.writeFileSync(f,'original');fs.copyFileSync(f,bak);core.rememberPatchedFile(f);
  fs.writeFileSync(f,'modified without a plugin marker');core.rememberPatchedFile(f);
  assert.deepEqual(core.refreshStaleBaksForUpgrade(dir),[]);
  assert.equal(fs.readFileSync(bak,'utf8'),'original');
  fs.writeFileSync(f,'unrelated edit on same version');
  assert.deepEqual(core.refreshStaleBaksForUpgrade(dir),[]);
  assert.equal(fs.readFileSync(bak,'utf8'),'original');
  fs.writeFileSync(path.join(dir,'package.json'),JSON.stringify({version:'2.0.0'}));
  fs.writeFileSync(f,'official version two');
  assert.deepEqual(core.refreshStaleBaksForUpgrade(dir),[f]);
  assert.equal(fs.readFileSync(bak,'utf8'),'official version two');
});

test('Legacy backups without provenance are retained',()=>{
  const dir=path.join(temp,'legacy');fs.mkdirSync(dir);
  fs.writeFileSync(path.join(dir,'entry.js'),'modified');
  fs.writeFileSync(path.join(dir,'entry.js.dshpurge.bak'),'original');
  assert.deepEqual(core.refreshStaleBaksForUpgrade(dir),[]);
  assert.equal(fs.readFileSync(path.join(dir,'entry.js.dshpurge.bak'),'utf8'),'original');
});

test('Uninstall removes only this edition from nested profile manifests',()=>{
  const pkg={dependencies:{'dsh-unbound':'file:local','dsh-purge':'1.1.71',other:'1'},dsh:{profile:{bundles:['@deepseek-ai/dsh-base','dsh-purge','dsh-unbound'],plugins:[{name:'dsh-unbound'},{name:'other'}]}}};
  assert.equal(uninstall.stripPluginFromPackage(pkg),true);
  assert.deepEqual(pkg.dependencies,{'dsh-purge':'1.1.71',other:'1'});
  assert.deepEqual(pkg.dsh.profile.bundles,['@deepseek-ai/dsh-base','dsh-purge']);
  assert.deepEqual(pkg.dsh.profile.plugins,[{name:'other'}]);
  assert.equal(uninstall.stripPluginFromPackage(pkg),false);
});

test('Unconfigured updater cannot fetch or replace this edition',async()=>{
  const original=globalThis.fetch;globalThis.fetch=()=>{throw Error('Unexpected network call')};
  try {
    assert.equal((await updater.checkUpdate()).disabled,true);
    for(const op of [{op:'apply'},{op:'apply',ref:'v99.0.0'},{op:'channel',channel:'beta',apply:false},{op:'rollback',version:'v1.0.0'}])await assert.rejects(()=>updater.handleUpdateOp(op),/尚未配置/);
    assert.equal((await updater.autoUpdateIfNeeded()).skipped,'manual-only');
  } finally {globalThis.fetch=original}
});

test('Persona suffix migration no longer inserts an unsupported cwd variable',()=>{
  for(const text of ['', 'Your working directory is {{cwd}}.','Keep this custom instruction.']){
    const out=identity.overlayOfficialIdentity([{name:'deployment:persona-suffix',text}]);
    assert(!out.some(s=>s.text?.includes('{{cwd}}')));
    if(text.startsWith('Keep'))assert(out.some(s=>s.text.includes(text)));
  }
  assert(!identity.CWD_ONLY_SUFFIX.includes('{{'));
});

test('New host assembly retains required contexts in every complete/suppression combination',async()=>{
  const patch=core.ALL_PATCHES.find(p=>p.id===40);
  const replacement=patch.replacements.find(r=>typeof r.pattern==='string'&&r.pattern.includes('const requiredContexts = new Set'));
  assert(replacement,'0.2.1-rc.2 assembly variant');
  const applied=core.applyReplacementsToText(replacement.pattern,patch,'index.js');
  assert(applied.changed);
  assert.equal(core.applyReplacementsToText(applied.text,patch,'index.js').changed,false);
  const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
  const run=new AsyncFunction('scopeTarget','scope','assembly','context','completeSection','runtimeContextSuppressed','contextByName',applied.text);
  for(const complete of [false,true])for(const suppressed of [false,true]){
    const transformed={sections:[{name:'normal',text:'normal'},{name:'dsh-purge:test',text:'Test marker'}],contexts:[{name:'required',text:'required'},{name:'optional',text:'optional'}],tools:[],variables:{}};
    const result=await run.call({ctx:{waterfall:async()=>transformed}},()=>null,null,{}, {},complete?{name:'complete',text:'complete'}:undefined,suppressed,new Map([['required',{name:'required',required:true}],['optional',{name:'optional'}]]));
    assert(result.sections.some(s=>s.name==='dsh-purge:test'));
    assert(result.contexts.some(s=>s.name==='required'));
    assert.equal(result.contexts.some(s=>s.name==='optional'),!suppressed);
    assert.equal(result.sections.some(s=>s.name==='complete'),complete);
  }
});

test('Every retained patch ID and target matches the recorded upstream manifest',()=>{
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'test/patch-manifest.json'),'utf8'));
  assert.deepEqual(core.ALL_PATCHES.map(({id,name,file})=>({id,name,file})),manifest);
});

test('Profile registration backs up and replaces only the active bundle, then is idempotent',()=>{
  const home=path.join(temp,'activation'),profile=path.join(home,'profiles/web');
  fs.mkdirSync(path.join(profile,'node_modules/dsh-unbound'),{recursive:true});
  fs.writeFileSync(path.join(profile,'node_modules/dsh-unbound/package.json'),JSON.stringify({name:'dsh-unbound',version:'1.0.0'}));
  const file=path.join(profile,'package.json');
  fs.writeFileSync(file,JSON.stringify({dependencies:{'dsh-unbound':'file:test','dsh-purge':'1.1.71'},dsh:{profile:{bundles:['base','dsh-purge']}}}));
  const run=()=>execFileSync(process.execPath,[path.join(root,'scripts/activate-profile.mjs'),'--home',home,'--profile','web'],{windowsHide:true,stdio:'pipe'});
  run();const saved=fs.readFileSync(file,'utf8'),pkg=JSON.parse(saved);
  assert.deepEqual(pkg.dsh.profile.bundles,['base','dsh-unbound']);
  assert.equal(pkg.dependencies['dsh-purge'],'1.1.71');
  assert.equal(fs.readdirSync(profile).filter(n=>n.endsWith('.bak')).length,1);
  run();assert.equal(fs.readFileSync(file,'utf8'),saved);
  assert.equal(fs.readdirSync(profile).filter(n=>n.endsWith('.bak')).length,1);
});

test('Skills remain available with Unbound versions and reject an unsupported host',()=>{
 const client=fs.readFileSync(path.join(root,'client.js'),'utf8');
 const source=client.slice(client.indexOf('function skillUiAllowed(d) {'),client.indexOf('function splitListedVersion'));
 const scope={};vm.runInNewContext(source,scope);
 assert.equal(scope.skillUiAllowed({ok:true,plugin_version:'1.0.0',host_supported:true}),true);
 assert.equal(scope.skillUiAllowed({ok:true,host_supported:false}),false);
 assert.equal(scope.skillUiAllowed(null),false);
});

test('Report export works directly and failure never downloads a stale report',async()=>{
 let downloads=0,requests=0,fail=false;const messages=[];
 const scope={Date,Set,Number,JSON,Blob,Error,setTimeout:f=>f(),URL:{createObjectURL:()=> 'blob:local-test',revokeObjectURL:()=>{}},document:{createElement:()=>({click:()=>downloads++})},useState:v=>[v,x=>messages.push(x)],Btn:'button',h:(tag,props,...children)=>({tag,props,children}),apiJson:async()=>{requests++;if(fail)throw Error('unavailable');return {ok:true,host_version:'0.2.1-rc.2',plugin_conflict:false,has_backup:true,patches:[{id:40,status:'applied'}]}}};
 vm.runInNewContext(fs.readFileSync(path.join(root,'ui/diagnostics.js'),'utf8'),scope);
 const tree=scope.UnboundDiagnostics({});const exportButton=tree.children[0].children[1];
 await exportButton.props.onClick();assert.equal(downloads,1);assert.equal(requests,1);
 fail=true;await exportButton.props.onClick();assert.equal(downloads,1);assert(messages.includes('检查失败，请重试'));
});

test('Drill width gives content room without exceeding the viewport',()=>{
 const ui={};vm.runInNewContext(fs.readFileSync(path.join(root,'ui/state.js'),'utf8'),ui);
 assert.equal(ui.unboundPanelWidth(420,1440,true,false),980);
 assert.equal(ui.unboundPanelWidth(420,514,true,false),514);
 assert.equal(ui.unboundPanelWidth(420,320,false,false),320);
 assert.equal(ui.unboundPanelWidth(420,1440,false,false),420);
 assert.equal(ui.unboundPanelWidth(420,1440,true,true),1440);
});

test('Published declaration and runtime acknowledgement use the same edition',async()=>{
 const {USAGE_VERSION}=await import('../lib/drill-grant.js');
 const read=f=>fs.readFileSync(path.join(root,f),'utf8');
 assert(read('USAGE.md').includes('版本：'+USAGE_VERSION));
 assert(read('client.js').includes('dsh-unbound-drill-ack-'+USAGE_VERSION));
 assert(read('ui/copy.js').includes(USAGE_VERSION));
 assert(!read('client.js').includes('dsh-unbound-drill-ack-2026-10-17.1'));
});

test('Every retained patch has a Chinese display name',()=>{
 const code=fs.readFileSync(path.join(root,'client.js'),'utf8');
 const start=code.indexOf('const zh = {');
 const end=code.indexOf('const en = {',start);
 assert(start>=0 && end>start);
 const context={zh:{},en:{}};
 vm.runInNewContext(code.slice(start,end).replace('const zh =','zh ='),context);
 vm.runInNewContext(fs.readFileSync(path.join(root,'ui/copy.js'),'utf8'),context);
 for(const {id} of core.ALL_PATCHES)assert(context.zh['patch.'+id], 'Missing patch display name: '+id);
});
