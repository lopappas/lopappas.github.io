import test from 'node:test';
import assert from 'node:assert/strict';
import {rollKeepsakeOffers,STARTER_RELICS,returnToMenu,selectMode,startRun} from '../src/run.ts';

test('all three-keepsake offers are distinct and every keepsake has equal inclusion odds',()=>{
 const counts=new Map(STARTER_RELICS.map(id=>[id,0])),sets=new Map<string,number>(),original=[...STARTER_RELICS];
 // Enumerate every equally likely path through a 5×4×3 draw without replacement.
 for(let a=0;a<5;a++)for(let b=0;b<4;b++)for(let c=0;c<3;c++){
  const rolls=[(a+.5)/5,(b+.5)/4,(c+.5)/3];const offers=rollKeepsakeOffers(()=>rolls.shift()!);
  assert.equal(offers.length,3);assert.equal(new Set(offers).size,3);
  for(const id of offers)counts.set(id,counts.get(id)!+1);
  const key=[...offers].sort().join(',');sets.set(key,(sets.get(key)??0)+1);
 }
 assert.deepEqual([...counts.values()],[36,36,36,36,36]);
 assert.equal(sets.size,10);assert.ok([...sets.values()].every(count=>count===6));assert.deepEqual(STARTER_RELICS,original);
});

test('a run stores its offers once, rejects unoffered choices, and rerolls only for another new run',()=>{
 const run=selectMode(returnToMenu(),'new',()=>0);assert.deepEqual(run.keepsakeOffers,['amber','moss','feather']);
 assert.equal(selectMode(run,'new',()=>{throw Error('No rerolls during selection');}),run);
 assert.equal(startRun(run,'coinpurse'),run);assert.equal(startRun(run,'untouchedBox'),run);
 const started=startRun(run,'moss');assert.equal(started.screen,'map');assert.ok(started.relics.includes('moss'));assert.deepEqual(started.keepsakeOffers,run.keepsakeOffers);
 const next=selectMode(returnToMenu(),'new',()=>.999);assert.deepEqual(next.keepsakeOffers,['untouchedBox','coinpurse','feather']);
 assert.deepEqual(selectMode(returnToMenu(),'tutorial',()=>{throw Error('Tutorial needs no keepsakes');}).keepsakeOffers,[]);
});
