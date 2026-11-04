import test from 'node:test';
import assert from 'node:assert/strict';
import {newBattle,stepBattle,presentEnemies,enemyY,type Battle} from '../src/battle.ts';
import {newRun,ROUTE,battleForRun,finishBattle,isEliteNode,enterNode,buy} from '../src/run.ts';
import {PLAYER_SPELLS} from '../src/magic.ts';
function advance(b:Battle,seconds:number){for(let i=0;i<Math.round(seconds*100);i++)b=stepBattle(b,.01);return b;}
test('Webbed ambush arrives in three waves at zero, five and ten seconds',()=>{
 let b=newBattle('active','spiderGoblinElite');assert.deepEqual(b.enemies.map(e=>[e.kind,e.spawnAt,e.hp]),[['spider',0,100],['spider',0,100],['goblin',5,200],['goblin',5,200],['spider',10,100]]);
 assert.equal(new Set(b.enemies.map(e=>e.id)).size,5);assert.ok(b.enemies.every(e=>e.element==='Neutral'&&enemyY(e.id,b.encounter)+26<=510));
 assert.equal(presentEnemies(b).length,2);b=advance(b,4.99);assert.equal(presentEnemies(b).length,2);const paused={...b,phase:'ready' as const};assert.equal(stepBattle(paused,10),paused);
 b=advance(b,.01);assert.equal(presentEnemies(b).length,4);assert.equal(b.enemies[2].clock,0);
 b=advance(b,4.99);assert.equal(presentEnemies(b).length,4);assert.equal(b.enemies[4].clock,0);b=advance(b,.01);assert.equal(presentEnemies(b).length,5);
});
test('clearing earlier waves waits for reinforcements and victory requires all five enemies',()=>{
 let b=newBattle('active','spiderGoblinElite');b.enemies=b.enemies.map(e=>e.spawnAt===0?{...e,hp:0}:e);b=advance(b,5);assert.equal(b.phase,'active');assert.equal(presentEnemies(b).length,2);
 b.enemies=b.enemies.map(e=>e.spawnAt===5?{...e,hp:0}:e);b=advance(b,4.99);assert.equal(presentEnemies(b).length,0);assert.equal(b.phase,'active');b=advance(b,.01);assert.equal(presentEnemies(b).length,1);
 b.enemies[4].hp=0;b=advance(b,.01);assert.equal(b.phase,'victory');
});
test('new final encounter is elite and awards elite gold plus an unowned relic',()=>{
 const node=ROUTE.length-1;assert.equal(ROUTE[node-1].name,'Rockweb nest');assert.equal(isEliteNode(node),true);
 const run={...newRun(),screen:'battle' as const,node};assert.equal(battleForRun(run).encounter,'spiderGoblinElite');
 for(const roll of [0,.99999]){const reward=finishBattle(run,{...battleForRun(run),phase:'victory'},()=>roll).reward!;assert.equal(reward.gold,roll?38:33);assert.ok(reward.relic&&!run.relics.includes(reward.relic));}
});
test('merchants charge 100 for uncommon spells, including former special prices, and 150 for legendary spells',()=>{
 for(const [id,price] of [['bolt',100],['firestorm',100],['bog',100],['tidalcrest',100],['chronos',150]] as const){
  const shop=enterNode({...newRun(),screen:'map',node:2,gold:price,spells:PLAYER_SPELLS.filter(s=>s.id!==id).map(s=>s.id)},()=>0),offer=shop.stock.find(s=>s.kind==='randomSpell')!;
  assert.equal(offer.price,100);const poor={...shop,gold:99};assert.equal(buy(poor,offer.id),poor);const paid=buy(shop,offer.id);assert.equal(paid.gold,price-100);assert.deepEqual(paid.pendingSpellOffers,[id]);
 }
});
