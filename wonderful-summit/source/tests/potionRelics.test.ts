import {test} from 'node:test';
import assert from 'node:assert/strict';
import {newRun,potionCapacity,potionCount,potionSlots,finishBattle,claimPotion,buy,enterNode,battleForRun,RELICS,type Run,type RelicId} from '../src/run.ts';
import {newBattle,drinkPotion} from '../src/battle.ts';

test('Twilly Scarf guarantees one potion reward after every victory, never on defeat',()=>{
 for(const node of [0,1,3,5])for(const roll of [0,.349,.35,.7,.999]){
  const run:Run={...newRun(),node,screen:'battle',relics:['twillyScarf']};
  const reward=finishBattle(run,{...newBattle('active'),phase:'victory'},()=>roll).reward!;
  assert.ok(reward.potion);assert.equal(reward.potionStatus,'pending');
  assert.equal(finishBattle(run,{...newBattle('active'),phase:'defeat'},()=>roll).reward,null);
 }
 assert.equal(finishBattle({...newRun(),screen:'battle'},{...newBattle('active'),phase:'victory'},()=>.99).reward?.potion,null);
});
test('duplicate bottles each occupy a slot and each use consumes just one bottle',()=>{
 const run:Run={...newRun(),potions:{heal:2,freeze:1,ink:0}};
 assert.equal(potionCount(run),3);assert.deepEqual(potionSlots(run.potions,potionCapacity(run)),['heal','heal','freeze']);
 const b=drinkPotion(battleForRun(run),'heal');assert.deepEqual(potionSlots(b.potions,3),['heal','freeze',null]);assert.equal(b.potionFlights.length,1);
 assert.deepEqual(potionSlots({heal:1,freeze:0,ink:0},3),['heal',null,null]);
});
test('Birkin-stock immediately adds two slots and allows duplicate purchases up to five',()=>{
 const run:Run={...newRun(),screen:'shop',gold:100,potions:{heal:3,freeze:0,ink:0},stock:[{id:'bag',kind:'relic',item:'birkinStock',price:45,sold:false},{id:'heal-a',kind:'potion',item:'heal',price:16,sold:false},{id:'heal-b',kind:'potion',item:'heal',price:16,sold:false},{id:'heal-c',kind:'potion',item:'heal',price:16,sold:false}]};
 assert.equal(potionCapacity(run),3);assert.equal(buy(run,'heal-a'),run);
 const expanded=buy(run,'bag');assert.equal(potionCapacity(expanded),5);assert.deepEqual(potionSlots(expanded.potions,5),['heal','heal','heal',null,null]);
 const full=buy(buy(expanded,'heal-a'),'heal-b');assert.equal(potionCount(full),5);assert.equal(buy(full,'heal-c'),full);
 assert.equal(battleForRun(full).potions.heal,5);
});
test('victory pickups and full-purse replacement honor all five slots',()=>{
 const run:Run={...newRun(),screen:'battle',relics:['birkinStock','twillyScarf'],potions:{heal:3,freeze:0,ink:0}};
 const victory={...newBattle('active'),phase:'victory' as const,potions:{...run.potions}};
 const reward=finishBattle(run,victory,()=>0),four=claimPotion(reward);assert.equal(potionCount(four),4);
 const full={...reward,potions:{heal:5,freeze:0,ink:0}};assert.equal(claimPotion(full),full);
 const replaced=claimPotion(full,'heal');assert.equal(potionCount(replaced),5);assert.equal(replaced.reward?.potionStatus,'collected');
});
test('both potion relics enter merchant and elite reward pools',()=>{
 for(const id of ['twillyScarf','birkinStock'] as RelicId[]){const relics=(Object.keys(RELICS) as RelicId[]).filter(x=>x!==id);
  const shop=enterNode({...newRun(),screen:'map',node:2,relics},()=>0);assert.ok(shop.stock.some(x=>x.item===id));
  assert.equal(finishBattle({...newRun(),screen:'battle',node:3,relics},{...newBattle('active'),phase:'victory'},()=>0).reward?.relic,id);
 }
});
