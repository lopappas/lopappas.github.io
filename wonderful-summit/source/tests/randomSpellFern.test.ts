import test from 'node:test';
import assert from 'node:assert/strict';
import {newRun,enterNode,buy,chooseShopSpell,skipShopSpell,leaveNode,finishBattle,claimGold,skipRewardSpell,learnReward,rewardsComplete,fernBonus,battleForRun,RELICS,acquireRelic,rollSpellOffers} from '../src/run.ts';
import {PLAYER_SPELLS} from '../src/magic.ts';
import {releaseMultiplier} from '../src/battle.ts';
function shop(gold=100){return enterNode({...newRun(),screen:'map',node:2,gold},()=>0);}
test('each shop offers one sealed 100-gold spell purchase and rolls only when bought',()=>{
 const r=shop();assert.equal(r.stock.length,5);assert.equal(r.stock.filter(s=>s.kind==='randomSpell').length,1);assert.equal(r.stock.filter(s=>s.kind==='spell').length,0);
 const poor=shop(99);assert.equal(buy(poor,'random-spell'),poor);
 let rolls=0;const bought=buy(r,'random-spell',()=>{rolls++;return 0;});assert.equal(bought.gold,0);assert.equal(rolls,2);assert.equal(bought.pendingSpellOffers!.length,2);assert.equal(new Set(bought.pendingSpellOffers).size,2);assert.deepEqual(bought.spells,r.spells);
 assert.equal(leaveNode(bought),bought);assert.equal(buy(bought,'random-spell'),bought);assert.equal(buy(bought,r.stock[0].id),bought);
});
test('shop selection learns exactly once; skipping keeps the charge and cannot reroll',()=>{
 const paid=buy(shop(),'random-spell',()=>0),id=paid.pendingSpellOffers![0];const learned=chooseShopSpell(paid,id);assert.ok(learned.spells.includes(id));assert.equal(learned.gold,0);assert.deepEqual(learned.pendingSpellOffers,[]);assert.equal(chooseShopSpell(learned,id),learned);assert.equal(buy(learned,'random-spell'),learned);assert.equal(leaveNode(learned).screen,'map');
 const skipped=skipShopSpell(paid);assert.equal(skipped.gold,0);assert.deepEqual(skipped.spells,newRun().spells);assert.deepEqual(skipped.pendingSpellOffers,[]);assert.equal(buy(skipped,'random-spell'),skipped);assert.equal(skipShopSpell(skipped),skipped);
});
test('shop offers only unknown spells, handles one or zero remaining, and rolls the same rarity weights',()=>{
 const known=PLAYER_SPELLS.filter(s=>s.id!=='chronos').map(s=>s.id);const r=enterNode({...newRun(),screen:'map',node:2,gold:100,spells:known},()=>0);const bought=buy(r,'random-spell',()=>0);assert.deepEqual(bought.pendingSpellOffers,['chronos']);
 const full={...r,spells:PLAYER_SPELLS.map(s=>s.id)};assert.equal(buy(full,'random-spell'),full);
 let legendary=0;for(let i=0;i<1000;i++){let n=0;const offers=rollSpellOffers(newRun(),()=>n++?0:(i+.5)/1000);if(PLAYER_SPELLS.find(s=>s.id===offers[0])!.rarity==='Legendary')legendary++;assert.equal(new Set(offers).size,2);}assert.equal(legendary,100);
});
test('victory spells can be skipped once without learning, and rewards then allow continuing',()=>{
 const run={...newRun(),screen:'battle' as const,combats:3},r=claimGold(finishBattle(run,{...battleForRun(run),phase:'victory'},()=>0));assert.equal(rewardsComplete(r.reward!),false);
 const skipped=skipRewardSpell(r);assert.equal(rewardsComplete(skipped.reward!),true);assert.deepEqual(skipped.spells,r.spells);assert.equal(learnReward(skipped,r.reward!.offers[0]),skipped);assert.equal(skipRewardSpell(skipped),skipped);assert.equal(leaveNode(skipped).screen,'map');
 const learned=learnReward(r,r.reward!.offers[0]);assert.equal(skipRewardSpell(learned),learned);
});
test('Ordinary Fern is common and falls from 20 to zero by five points per nonstarter spell',()=>{
 assert.equal(RELICS.ordinaryFern.rarity,'Common');const base=acquireRelic(newRun(),'ordinaryFern');const extra=PLAYER_SPELLS.filter(s=>!base.spells.includes(s.id));
 for(let count=0;count<=extra.length;count++){const r={...base,spells:[...base.spells,...extra.slice(0,count).map(s=>s.id)]};assert.equal(fernBonus(r),Math.max(0,20-count*5));assert.equal(battleForRun(r).damageBonus,1+Math.max(0,20-count*5)/100);}
 assert.equal(fernBonus(newRun()),0);assert.equal(fernBonus({...base,spells:[...base.spells,base.spells[0]]}),20);
});
test('a shop spell weakens Fern immediately and skipping preserves its bonus; Lotus is now 25 percent',()=>{
 const r=acquireRelic(shop(),'ordinaryFern'),paid=buy(r,'random-spell',()=>0);assert.equal(fernBonus(skipShopSpell(paid)),20);assert.equal(fernBonus(chooseShopSpell(paid,paid.pendingSpellOffers![0])),15);
 const b=battleForRun({...newRun(),relics:['lotus']});assert.equal(releaseMultiplier(b,'water'),1.25);
});
