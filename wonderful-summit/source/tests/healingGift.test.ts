import {test} from 'node:test';
import assert from 'node:assert/strict';
import {newRun,battleForRun,enterNode,ROUTE} from '../src/run.ts';
import {COMMON_POTIONS,RARE_POTIONS,SHOP_POTIONS,drinkPotion,stepBattle} from '../src/battle.ts';
test('Theodora supplies one distinct starting potion that heals 35 on impact',()=>{
 const run=newRun();assert.equal(run.potions.theodoraHeal,1);assert.equal(run.potions.heal,0);
 let b=battleForRun({...run,health:40},()=>0);b=drinkPotion(b,'theodoraHeal');assert.equal(b.playerHP,40);assert.equal(b.potions.theodoraHeal,0);for(let i=0;i<66;i++)b=stepBattle(b,.01);assert.equal(b.playerHP,75);
});
test('homemade healing never appears in reward or merchant pools including fallback stock',()=>{
 for(const pool of [COMMON_POTIONS,RARE_POTIONS,SHOP_POTIONS])assert.ok(!pool.includes('theodoraHeal'));
 for(const roll of [0,.4,.8,.999])for(const node of ROUTE.flatMap((n,i)=>n.kind==='shop'?[i]:[])){const r=enterNode({...newRun(),screen:'map',node,spells:['water','fire','nature','wave','bolt','leaf','chronos','firestorm','tidalcrest']},()=>roll);assert.ok(r.stock.every(s=>s.item!=='theodoraHeal'));}
});
