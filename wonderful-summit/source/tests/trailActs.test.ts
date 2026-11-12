import test from 'node:test';
import assert from 'node:assert/strict';
import {ACT_ONE_BOSS,TRAIL_ACTS,trailAct,actEncounters} from '../src/trailActs.ts';
import {newRun,ROUTE,battleForRun,finishBattle,claimGold,claimRelic,leaveNode,selectTrailNode,unlockDeveloperTrail} from '../src/run.ts';
test('acts partition the existing route exactly at the first boss with original global indices',()=>{
 assert.equal(ACT_ONE_BOSS,11);assert.equal(ROUTE[ACT_ONE_BOSS].kind,'battle');
 const first=actEncounters(0),second=actEncounters(ACT_ONE_BOSS+1);
 assert.deepEqual([...first,...second].map(x=>x.encounter),ROUTE);
 assert.deepEqual([...first,...second].map(x=>x.index),ROUTE.map((_,i)=>i));
 assert.equal(first.at(-1)!.index,ACT_ONE_BOSS);assert.equal(second[0].index,ACT_ONE_BOSS+1);
 assert.equal(second[0].encounter.name,'Rock and web');
});
test('each trail view receives only the current act, including boss and final screens',()=>{
 for(let i=0;i<ROUTE.length;i++){
  const act=trailAct(i),nodes=actEncounters(i);
  assert.ok(nodes.some(x=>x.index===i));assert.ok(nodes.every(x=>x.index>=act.start&&x.index<=act.end));
  assert.equal(act.number,i<=ACT_ONE_BOSS?1:2);
 }
 assert.equal(TRAIL_ACTS[0].title,'The Summit Skirt');assert.equal(TRAIL_ACTS[1].title,'The Summit Saddle');
 assert.equal(trailAct(ROUTE.length).number,2);
});
test('both first-boss variants stay in Act 1 through rewards and Continue enters Act 2 without resetting resources',()=>{
 for(const bossEncounter of ['mother','goblinKing'] as const){
  const run={...newRun(),screen:'battle' as const,node:ACT_ONE_BOSS,combats:6,bossEncounter,gold:87,health:73};
  const rewards=claimRelic(claimGold(finishBattle(run,{...battleForRun(run),phase:'victory',playerHP:61},()=>.99)));
  assert.equal(trailAct(rewards.node).number,1);
  const next=leaveNode(rewards);assert.equal(next.screen,'map');assert.equal(next.node,12);assert.equal(trailAct(next.node).number,2);
  assert.equal(next.health,61);assert.equal(next.gold,141);assert.deepEqual(next.spells,rewards.spells);assert.deepEqual(next.relics,rewards.relics);
  assert.equal(battleForRun(selectTrailNode(next,next.node)).encounter,'rockSpider');
 }
});
test('developer travel retains global route numbering when crossing acts',()=>{
 const first=unlockDeveloperTrail({...newRun(),screen:'map' as const,node:0});
 const second=selectTrailNode(first,12);assert.equal(second.node,12);assert.equal(trailAct(second.node).number,2);
 const back=selectTrailNode({...second,screen:'map'},3);assert.equal(back.node,3);assert.equal(trailAct(back.node).number,1);
});
