import test from 'node:test';
import assert from 'node:assert/strict';
import {createSpider,newBattle,stepBattle,presentEnemies,hitWithSpell,CONTACT_X,SLIME_SPEED,spellDamage,type Battle} from '../src/battle.ts';
import {ROUTE,newRun,battleForRun,finishBattle,claimGold,leaveNode,enterNode} from '../src/run.ts';
function advance(b:Battle,seconds:number){for(let i=0;i<Math.round(seconds*100);i++)b=stepBattle(b,.01);return b;}
test('Spider has 100 HP and is neutral by default, with explicit elemental support',()=>{
 assert.equal(createSpider().element,'Neutral');
 for(const element of ['Neutral','Water','Fire','Nature'] as const){const e=createSpider(7,500,element);assert.equal(e.hp,100);assert.equal(e.maxHP,100);assert.equal(e.kind,'spider');assert.equal(e.element,element);assert.equal(e.initialElement,element);assert.equal(e.rocky,false);assert.equal(e.id,7);}
});
test('Spider moves twice as fast as a slime under the same encounter modifiers',()=>{
 for(const difficulty of [1,1.2]){
  const b=newBattle('active');b.approachAt=0;b.difficulty=difficulty;b.enemies=[{...b.enemies[0],x:500},createSpider(2,500)];
  const n=advance(b,1);assert.ok(Math.abs(500-n.enemies[0].x-SLIME_SPEED*.8*difficulty)<1e-8);assert.ok(Math.abs(500-n.enemies[1].x-2*(500-n.enemies[0].x))<1e-8);
 }
});
test('Spider contact deals 10 damage, respects rejection, and retains normal contact knockback',()=>{
 for(const rejection of [false,true]){const b=newBattle('active');b.difficulty=1.2;b.approachAt=0;b.enemies=[{...createSpider(1,CONTACT_X),attackAt:0}];b.rejectionUntil=rejection?10:0;const n=stepBattle(b,.01);assert.equal(n.playerHP,rejection?95:90);assert.ok(n.enemies[0].push);assert.equal(n.playerHits,1);}
});
test('rock slime opens the encounter and Spider arrives at six seconds, even if the slime lives',()=>{
 let b=newBattle('active','rockSpider');assert.equal(b.enemies[0].rocky,true);assert.equal(b.enemies[0].hp,150);assert.equal(b.enemies[1].kind,'spider');assert.equal(b.enemies[1].spawnAt,6);assert.equal(presentEnemies(b).length,1);
 b=advance(b,5.99);assert.equal(presentEnemies(b).length,1);assert.equal(b.enemies[1].clock,0);
 const paused={...b,phase:'ready' as const};assert.equal(stepBattle(paused,10),paused);
 b=advance(b,.01);assert.equal(presentEnemies(b).length,2);assert.ok(b.enemies[0].hp>0);
});
test('killing the rock slime early waits for Spider, and killing Spider wins',()=>{
 let b=newBattle('active','rockSpider');b.enemies[0].hp=1;b=hitWithSpell(b,100,'water');assert.equal(b.phase,'active');b=advance(b,5.99);assert.equal(presentEnemies(b).length,0);assert.equal(b.phase,'active');b=advance(b,.01);assert.equal(presentEnemies(b)[0].kind,'spider');b.enemies[1].hp=1;b=hitWithSpell(b,100,'fire');assert.equal(b.phase,'victory');
});
test('elemental spiders use normal resistances and Chronos freezes them',()=>{
 const b=newBattle('active');b.enemies=[createSpider(1,400,'Water')];const hit=hitWithSpell(b,60,'water');assert.equal(hit.enemies[0].hp,100-spellDamage({element:'Water'},60,'water'));const frozen=hitWithSpell(b,60,'chronos');assert.ok(frozen.enemies[0].stunUntil>0);assert.equal(advance(frozen,1).enemies[0].x,400);
});
test('post-boss route leads to Rock and web and completes only after its rewards',()=>{
 const boss=ROUTE.findIndex(n=>n.kind==='battle'&&n.encounter==='mother');assert.equal(ROUTE[boss+1].name,'Rock and web');
 let run={...newRun(),screen:'battle' as const,node:boss};let rewards=finishBattle(run,{...battleForRun(run),phase:'victory'},()=>.99);rewards=claimGold(rewards);let next=leaveNode(rewards);assert.equal(next.screen,'map');next=enterNode(next);assert.equal(next.screen,'battle');assert.equal(battleForRun(next).encounter,'rockSpider');
 rewards=claimGold(finishBattle(next,{...battleForRun(next),phase:'victory'},()=>.99));assert.equal(leaveNode(rewards).screen,'complete');
});
