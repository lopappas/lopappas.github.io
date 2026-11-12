import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {formatGameVersion,nextGameVersion} from '../src/gameVersion.ts';
import {VERSION_HISTORY} from '../src/versionHistory.ts';

test('release labels always show two release digits, including earlier versions',()=>{
 assert.equal(formatGameVersion('0.1.0'),'0.1.00');
 assert.equal(formatGameVersion('0.2.0'),'0.2.00');
 assert.equal(formatGameVersion('0.1.3'),'0.1.03');
 assert.equal(formatGameVersion('0.1.40'),'0.1.40');
});
test('small releases increment by one; features move to the next ten without changing the middle number',()=>{
 assert.equal(nextGameVersion('0.1.40','small'),'0.1.41');
 assert.equal(nextGameVersion('0.2.0','small'),'0.2.1');
 assert.equal(nextGameVersion('0.1.40','feature'),'0.1.50');
 assert.equal(nextGameVersion('0.1.44','feature'),'0.1.50');
 assert.equal(nextGameVersion('0.1.49','small'),'0.1.50');
 assert.throws(()=>nextGameVersion('0.1.99','small'),/ask the user/);
 assert.throws(()=>nextGameVersion('0.1.90','feature'),/ask the user/);
});
test('release history matches the current package and stays unique, chronological and populated',()=>{
 const pkg=JSON.parse(readFileSync(new URL('../package.json',import.meta.url),'utf8'));
 const lock=JSON.parse(readFileSync(new URL('../package-lock.json',import.meta.url),'utf8'));
 assert.equal(VERSION_HISTORY[0].version,pkg.version);
 assert.equal(lock.version,pkg.version);assert.equal(lock.packages[''].version,pkg.version);
 const numbers=VERSION_HISTORY.map(release=>release.version.split('.').map(Number));
 assert.equal(new Set(VERSION_HISTORY.map(r=>r.version)).size,VERSION_HISTORY.length);
 VERSION_HISTORY.forEach((release,i)=>{
  assert.ok(release.changes.length>0&&release.changes.every(c=>c.trim().length>0));
  if(i){const a=numbers[i-1],b=numbers[i];const first=a.findIndex((n,j)=>n!==b[j]);assert.ok(first>=0&&a[first]>b[first]);}
 });
});

test('release commands update package and lock together and reject invalid requests without writing',()=>{
 const dir=mkdtempSync(join(process.cwd(),'.version-test-'));
 const script=fileURLToPath(new URL('../scripts/bump-version.mjs',import.meta.url));
 const read=(path:string)=>JSON.parse(readFileSync(join(dir,path),'utf8'));
 try{
  writeFileSync(join(dir,'package.json'),JSON.stringify({version:'0.1.40'}));
  writeFileSync(join(dir,'package-lock.json'),JSON.stringify({version:'0.1.40',packages:{'':{version:'0.1.40'}}}));
  for(const [kind,expected] of [['small','0.1.41'],['feature','0.1.50']]){
   execFileSync(process.execPath,['--experimental-strip-types',script,kind],{cwd:dir,stdio:'pipe'});
   assert.equal(read('package.json').version,expected);
   assert.equal(read('package-lock.json').version,expected);
   assert.equal(read('package-lock.json').packages[''].version,expected);
  }
  assert.throws(()=>execFileSync(process.execPath,['--experimental-strip-types',script,'minor'],{cwd:dir,stdio:'pipe'}));
  assert.equal(read('package.json').version,'0.1.50');
 }finally{rmSync(dir,{recursive:true,force:true});}
});
