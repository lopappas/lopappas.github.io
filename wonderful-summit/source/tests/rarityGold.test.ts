import {test} from 'node:test';
import assert from 'node:assert/strict';
import {encounterGold,ROUTE,newRun,battleForRun,finishBattle,claimGold,leaveNode,enterNode,RELICS,STARTER_RELICS} from '../src/run.ts';
import {SPELLS,PLAYER_SPELLS} from '../src/magic.ts';

test('every normal and elite encounter has six equally selectable, inclusive integer gold amounts; the boss always pays sixty',()=>{
 for(let node=0;node<ROUTE.length;node++){
  const encounter=ROUTE[node];
  if(encounter.kind!=='battle'){assert.equal(encounterGold(node,()=>{throw Error('noncombat should not roll gold');}),0);continue;}
  if(encounter.encounter==='mother'){assert.equal(encounterGold(node,()=>{throw Error('boss gold is fixed');}),60);continue;}
  const min='elite' in encounter&&encounter.elite?37:27,counts=new Map<number,number>();
  for(let i=0;i<600;i++){const value=encounterGold(node,()=>(i+.5)/600);assert.ok(Number.isInteger(value));counts.set(value,(counts.get(value)??0)+1);}
  assert.deepEqual([...counts.keys()],[min,min+1,min+2,min+3,min+4,min+5]);assert.ok([...counts.values()].every(n=>n===100));
  assert.equal(encounterGold(node,()=>0),min);assert.equal(encounterGold(node,()=>.999999),min+5);assert.equal(encounterGold(node,()=>1),min+5);
 }
 assert.equal(ROUTE.reduce((sum,_,i)=>sum+encounterGold(i,()=>0),0),242);
 assert.equal(ROUTE.reduce((sum,_,i)=>sum+encounterGold(i,()=>.999999),0),272);
});
test('gold rolls anew per encounter, is stored once in its reward, and cannot be rerolled or collected twice',()=>{
 const run={...newRun(),screen:'battle' as const};
 let reward=finishBattle(run,{...battleForRun(run),phase:'victory'},()=>0);
 assert.equal(reward.reward?.gold,27);assert.equal(reward.gold,0);
 assert.equal(finishBattle(reward,{...battleForRun(run),phase:'victory'},()=>{throw Error('a reward cannot be rerolled');}),reward);
 reward=claimGold(reward);assert.equal(reward.gold,27);assert.equal(claimGold(reward),reward);
 const next=enterNode(leaveNode(reward)),second=finishBattle(next,{...battleForRun(next),phase:'victory'},()=>.999999);
 assert.equal(second.reward?.gold,32);assert.equal(second.gold,27);assert.equal(claimGold(second).gold,59);
 const dead=finishBattle(run,{...battleForRun(run),phase:'defeat',playerHP:0},()=>{throw Error('defeat should not roll rewards');});assert.equal(dead.gold,0);assert.equal(dead.reward,null);
});
test('relic rarities exactly match the approved labeling and keepsakes stay exclusive to Theodora',()=>{
 assert.deepEqual(Object.fromEntries(Object.entries(RELICS).map(([id,r])=>[id,r.rarity])),{
  lotus:'Uncommon',colorfulRock:'Uncommon',impossibleShale:'Uncommon',midnightStone:'Rare',amber:'Keepsake',moss:'Keepsake',feather:'Keepsake',bell:'Common',moon:'Common',sunAmulet:'Rare',moonAmulet:'Rare',twilightAmulet:'Rare',twillyScarf:'Rare',birkinStock:'Uncommon'
 });
 assert.deepEqual(Object.entries(RELICS).filter(([,r])=>r.rarity==='Keepsake').map(([id])=>id).sort(),[...STARTER_RELICS].sort());
});
test('spell rarities exactly match the approved labeling, including the developer-only Rare Ender',()=>{
 assert.deepEqual(Object.fromEntries(SPELLS.map(s=>[s.id,s.rarity])),{water:'Common',fire:'Common',nature:'Common',wave:'Uncommon',bolt:'Uncommon',leaf:'Uncommon',chronos:'Rare',ender:'Rare',firestorm:'Uncommon',tidalcrest:'Uncommon'});
 assert.equal(SPELLS.find(s=>s.id==='ender')?.developerOnly,true);assert.ok(!PLAYER_SPELLS.some(s=>s.id==='ender'));
 assert.deepEqual(PLAYER_SPELLS.filter(s=>s.rarity==='Rare').map(s=>s.id),['chronos']);
});
