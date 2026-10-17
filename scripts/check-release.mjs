import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {openSlot} from '../lib/table-read.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const problems=[];let files=0,syntax=0;
const forbidden=/^(?:\.env(?:\..*)?|\.credentials.*|prompt-inject\.md|.*\.(?:log|bak|copytmp|tgz|zip)|.*\.dshpurge\.bak.*)$/i;
const checkText=(text,name)=>{
  if(/(?:[A-Za-z]:[\\/]+Users[\\/]+|\/Users\/|\/home\/)[^\s"'<>]+/.test(text))problems.push(name+': user-specific absolute path');
  if(/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|(?:ghp_|github_pat_)[a-zA-Z0-9_]{25,}|sk-[A-Za-z0-9]{32,}/.test(text))problems.push(name+': possible credential');
};
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(['.git','node_modules','.test-work','.npm-cache'].includes(e.name))continue;const f=path.join(dir,e.name),rel=path.relative(root,f);if(e.isSymbolicLink()){problems.push(rel+': symlink');continue}if(e.isDirectory()){if(['work','.dsh','profiles','sessions'].includes(e.name))problems.push(rel+': local data directory');else walk(f);continue}files++;if(forbidden.test(e.name))problems.push(rel+': local/generated file');const s=fs.readFileSync(f,'utf8');checkText(s,rel);if(/\.(?:mjs|js)$/.test(e.name)&&!['ui'].includes(path.relative(root,dir).split(path.sep)[0])){try{execFileSync(process.execPath,['--check',f],{stdio:'pipe',windowsHide:true});syntax++}catch{problems.push(rel+': syntax error')}}}}
walk(root);const prompt=openSlot();if(!prompt)problems.push('Default prompt cannot be decoded');checkText(prompt,'decoded default');
if(/Little Code Sauce|\*\*YG\*\*/.test(prompt))problems.push('Default prompt contains a fixed upstream persona');
const before=fs.readFileSync(path.join(root,'client.js'));
execFileSync(process.execPath,[path.join(root,'scripts/build-client.mjs')],{stdio:'pipe',windowsHide:true});
if(!before.equals(fs.readFileSync(path.join(root,'client.js'))))problems.push('client.js was stale; rebuilt it, re-run checks');
if(problems.length){console.error(problems.join('\n'));process.exit(1)}
console.log(JSON.stringify({ok:true,files,syntaxChecked:syntax,defaultDecoded:true,clientReproducible:true}));
