import {test} from 'node:test';
import assert from 'node:assert/strict';
import {newRun,discardPotion,buy,claimPotion,potionCount,type Run,type RunScreen} from '../src/run.ts';

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
 const shop:Run={...newRun(),screen:'shop',gold:24,potions:{heal:3,freeze:0,ink:0},stock:[{id:'freeze',kind:'potion',item:'freeze',price:12,sold:false}]};
 assert.equal(buy(shop,'freeze'),shop);
 const bought=buy(discardPotion(shop,'heal'),'freeze');assert.equal(bought.potions.freeze,1);assert.equal(potionCount(bought),3);assert.equal(bought.gold,12);
 const reward:Run={...shop,screen:'rewards',reward:{gold:25,potion:'freeze',offers:[],relic:null,goldClaimed:false,potionStatus:'pending',relicClaimed:true,learned:null}};
 const claimed=claimPotion(discardPotion(reward,'heal'));assert.equal(claimed.reward?.potionStatus,'collected');assert.equal(potionCount(claimed),3);
});
