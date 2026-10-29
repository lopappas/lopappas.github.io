import {test} from 'node:test';
import assert from 'node:assert/strict';
import {newRun,ROUTE,unlockDeveloperTrail,selectTrailNode,leaveNode,camp,finishBattle,battleForRun,claimGold,claimRelic} from '../src/run.ts';
import {parseDeveloperCommand,applyDeveloperCommand} from '../src/developerCommands.ts';
import {PLAYER_SPELLS} from '../src/magic.ts';
test('opening developer navigation on the trail unlocks every node for this run only',()=>{
 const run={...newRun(),screen:'map' as const};assert.equal(selectTrailNode(run,3),run);const unlocked=unlockDeveloperTrail(run);assert.equal(unlocked.developerTrailUnlocked,true);assert.equal(unlockDeveloperTrail(unlocked),unlocked);assert.equal(newRun().developerTrailUnlocked,false);
 for(const screen of ['battle','shop','sister','menu'] as const){const other={...run,screen};assert.equal(unlockDeveloperTrail(other),other);assert.equal(selectTrailNode(other,3),other);}
 for(const node of [-1,ROUTE.length,.5,NaN]){assert.equal(parseDeveloperCommand({type:'travel',node}),null);assert.equal(selectTrailNode(unlocked,node),unlocked);}
});
test('developer jumps visit every type of node while preserving current run resources and progress',()=>{
 const run=unlockDeveloperTrail({...newRun(),screen:'map',node:6,health:43,gold:100,combats:5,spells:[...PLAYER_SPELLS.map(s=>s.id),'ender'],relics:['moss','impossibleShale'],shaleContacts:2,upgrades:{fire:1},potions:{heal:2,freeze:1,ink:0,spellBottle:1},bottledSpells:[{spellId:'fire',quality:81}],furyReady:true});
 for(let node=0;node<ROUTE.length;node++){
  assert.deepEqual(parseDeveloperCommand({type:'travel',node}),{type:'travel',node});const next=applyDeveloperCommand(run,{type:'travel',node});assert.equal(next.node,node);assert.equal(next.screen,ROUTE[node].kind==='battle'?'battle':ROUTE[node].kind==='event'?'event':ROUTE[node].kind);
  for(const key of ['health','gold','combats','spells','relics','shaleContacts','upgrades','potions','bottledSpells','furyReady'] as const)assert.deepEqual(next[key],run[key]);
  let finished=next;if(next.screen==='battle')finished=claimRelic(claimGold(finishBattle(next,{...battleForRun(next),phase:'victory'},()=>.99)));else if(next.screen==='camp')finished=camp(next,'nature');
  const continued=leaveNode(finished);assert.equal(continued.node,node+1);assert.equal(continued.screen,node===ROUTE.length-1?'complete':'map');
 }
 const pending={...run,pendingBottle:true};assert.equal(selectTrailNode(pending,3),pending);
});
