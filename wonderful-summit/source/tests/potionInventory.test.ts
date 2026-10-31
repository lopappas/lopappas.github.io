import {test} from 'node:test';
import assert from 'node:assert/strict';
import {newRun,discardPotion,drinkTrailHealing,buy,claimPotion,potionCount,type Run,type RunScreen} from '../src/run.ts';

test('dropping one potion works throughout the journey without changing other inventory or rewards',()=>{
 for(const screen of ['sister','map','rewards','shop','camp','complete','defeat'] as RunScreen[]){
  const run:Run={...newRun(),screen,gold:50,potions:{heal:2,freeze:1,ink:0}};
  const next=discardPotion(run,'heal');
  assert.deepEqual(next.potions,{heal:1,freeze:1,ink:0});assert.equal(next.gold,50);assert.equal(next.reward,run.reward);
  assert.equal(run.potions.heal,2);assert.equal(discardPotion(next,'ink'),next);
 }
 for(const screen of ['opening','menu','tutorial','battle'] as RunScreen[]){const run={...newRun(),screen};assert.equal(discardPotion(run,'heal'),run);}
 const pending={...newRun(),screen:'shop' as const,pendingBottle:true};assert.equal(discardPotion(pending,'heal'),pending);
});

test('dropping a selected spell bottle removes only its stored spell',()=>{
 const run:Run={...newRun(),screen:'map',potions:{heal:1,freeze:0,ink:0,spellBottle:2},bottledSpells:[{spellId:'water',quality:80},{spellId:'fire',quality:95}]};
 const next=discardPotion(run,'spellBottle',1);
 assert.equal(next.potions.spellBottle,1);assert.deepEqual(next.bottledSpells,[{spellId:'water',quality:80}]);assert.equal(run.bottledSpells.length,2);
 for(const index of [-1,2,.5])assert.equal(discardPotion(run,'spellBottle',index),run);
});

test('dropping from full inventory immediately allows shop purchases and reward pickups',()=>{
 const shop:Run={...newRun(),screen:'shop',gold:24,potions:{heal:3,freeze:0,ink:0},stock:[{id:'freeze',kind:'potion',item:'freeze',price:16,sold:false}]};
 assert.equal(buy(shop,'freeze'),shop);
 const bought=buy(discardPotion(shop,'heal'),'freeze');assert.equal(bought.potions.freeze,1);assert.equal(potionCount(bought),3);assert.equal(bought.gold,8);
 const reward:Run={...shop,screen:'rewards',reward:{gold:25,potion:'freeze',offers:[],relic:null,goldClaimed:false,potionStatus:'pending',relicClaimed:true,learned:null}};
 const claimed=claimPotion(discardPotion(reward,'heal'));assert.equal(claimed.reward?.potionStatus,'collected');assert.equal(potionCount(claimed),3);
});


test('trail healing restores 30 HP up to the cap and consumes exactly one carried potion',()=>{
 for(const health of [1,45,80,99]){const run:Run={...newRun(),screen:'map',health,gold:43,potions:{heal:2,freeze:1,ink:0,spellBottle:1},bottledSpells:[{spellId:'fire',quality:87}]};const healed=drinkTrailHealing(run);assert.equal(healed.health,Math.min(100,health+30));assert.equal(healed.potions.heal,1);assert.equal(healed.potions.freeze,1);assert.deepEqual(healed.bottledSpells,run.bottledSpells);assert.equal(healed.gold,43);assert.equal(healed.screen,'map');assert.equal(healed.node,run.node);assert.equal(run.potions.heal,2);}
});
test('trail healing cannot waste a potion at full health, revive a lost run, or be used on other screens',()=>{
 const run:Run={...newRun(),screen:'map',health:50,potions:{heal:1,freeze:0,ink:0}};
 for(const blocked of [{...run,health:100},{...run,health:0},{...run,pendingBottle:true},{...run,potions:{heal:0,freeze:1,ink:1}}])assert.equal(drinkTrailHealing(blocked),blocked);
 for(const screen of ['opening','menu','battle','defeat'] as RunScreen[]){const blocked={...run,screen};assert.equal(drinkTrailHealing(blocked),blocked);}
});

test('both healing potions work on every started non-combat screen and remain separate',()=>{
 for(const screen of ['sister','map','rewards','shop','camp','event','complete'] as RunScreen[])for(const id of ['heal','theodoraHeal'] as const){const r:Run={...newRun(),screen,health:40,potions:{heal:1,theodoraHeal:1,freeze:0,ink:0}};const healed=drinkTrailHealing(r,id);assert.equal(healed.health,id==='heal'?70:75);assert.equal(healed.potions[id],0);assert.equal(healed.potions[id==='heal'?'theodoraHeal':'heal'],1);assert.equal(drinkTrailHealing(healed,id),healed);}
});
