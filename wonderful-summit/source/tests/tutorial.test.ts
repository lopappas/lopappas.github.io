import {test} from 'node:test';
import assert from 'node:assert/strict';
import {newRun,finishOpening,selectMode,returnToMenu,startRun,battleForRun} from '../src/run.ts';
import {newTutorial,tutorialJourney,beginTutorial,pauseTutorial,resumeTutorial,retryTutorial,restoreTutorialCheckpoint,checkpointTutorial,stepTutorialBattle} from '../src/tutorial.ts';
import {drinkPotion,hitWithSpell,launchSpell,nearestEnemy,type Battle} from '../src/battle.ts';

function advance(battle:Battle,seconds:number,paused=false){for(let i=0;i<Math.round(seconds*100);i++)battle=stepTutorialBattle(battle,.01,paused);return battle;}

test('checkmark leads to menu, and both mode choices are guarded and start fresh',()=>{
 const opening=newRun(),menu=finishOpening(opening);
 assert.equal(menu.screen,'menu');assert.deepEqual(selectMode(opening,'tutorial'),opening);assert.deepEqual(finishOpening(menu),menu);
 const normal=startRun(selectMode(menu,'new'),'moss');assert.equal(normal.screen,'map');assert.equal(normal.health,100);assert.deepEqual(normal.relics,['moss']);assert.deepEqual(normal.potions,{heal:1,freeze:0,ink:0});assert.equal(battleForRun(normal,()=>.2).enemies.length,1);
 assert.equal(selectMode(menu,'tutorial').screen,'tutorial');assert.deepEqual(selectMode(normal,'tutorial'),normal);
 const dirty={...menu,gold:999,health:1,potions:{heal:0,freeze:0,ink:3}};const fresh=selectMode(dirty,'new');assert.equal(fresh.gold,0);assert.equal(fresh.health,100);assert.deepEqual(fresh.spells,['water','fire','nature']);
});

test('tutorial begins paused with exactly one random elemental slime and the agreed supplies',()=>{
 const elements=new Set<string>();
 for(const roll of [0,.4,.8]){
  const s=newTutorial(()=>roll),b=s.checkpoint.battle;elements.add(b.enemies[0].element);
  assert.equal(s.phase,'briefing');assert.equal(s.checkpoint.ink,100);assert.equal(b.enemies.length,1);assert.equal(b.enemies[0].kind,'slime');assert.equal(b.enemies[0].hp,100);assert.equal(b.enemies[0].spawnAt,0);
  assert.equal(b.playerHP,70);assert.deepEqual(b.potions,{heal:1,freeze:0,ink:0});assert.equal(b.approachAt,5);assert.equal(b.damageBonus,1);assert.equal(b.firstHitPush,0);
 }
 assert.deepEqual(elements,new Set(['Fire','Water','Nature']));const r=tutorialJourney();assert.deepEqual(r.spells,['water','fire','nature']);assert.deepEqual(r.relics,[]);assert.equal(r.gold,0);
});

test('entry and pause stop simulation without consuming the five-second opening',()=>{
 let s=newTutorial(()=>.4),b=restoreTutorialCheckpoint(s.checkpoint).battle;
 assert.strictEqual(advance(b,20,s.phase!=='active'),b);assert.equal(b.time,0);
 s=beginTutorial(s);b=advance(b,4.99);assert.equal(b.enemies[0].x,580);b=advance(b,.1);assert.ok(b.enemies[0].x<580);
 s=pauseTutorial(s);const stopped=b;assert.strictEqual(advance(b,20,s.phase!=='active'),stopped);
 assert.deepEqual(pauseTutorial(s),s);assert.deepEqual(beginTutorial(s),s);
 s=resumeTutorial(s);b=advance(b,.5,s.phase!=='active');assert.ok(b.time>stopped.time);assert.ok(b.enemies[0].x<stopped.enemies[0].x);
});

test('pause freezes potion flights, freeze duration, burn and projectiles together',()=>{
 let b=restoreTutorialCheckpoint(newTutorial(()=>.4).checkpoint).battle;
 b=drinkPotion({...b,playerHP:40},'heal');b=launchSpell(b,60,'#abc');b.enemies[0]={...b.enemies[0],burn:{damage:2,nextTick:1,ticks:3}};
 assert.strictEqual(advance(b,20,true),b);assert.equal(b.playerHP,40);assert.equal(b.potionFlights[0].applied,false);assert.equal(b.enemies[0].hp,100);
 b=advance(b,.7);assert.equal(b.playerHP,70);assert.ok(b.enemies[0].hp<100);b={...b,freezeUntil:b.time+3};const remaining=b.freezeUntil-b.time;assert.equal(advance(b,20,true).freezeUntil-b.time,remaining);
});

test('defeat and manual restart restore the same checkpoint without rerolling or aliasing it',()=>{
 let rolls=0;let s=newTutorial(()=>{rolls++;return .8;});let b=restoreTutorialCheckpoint(s.checkpoint).battle;
 b=advance(b,120);assert.equal(b.phase,'defeat');s=retryTutorial(s);assert.equal(s.phase,'active');assert.equal(s.attempt,1);assert.equal(rolls,1);
 const restored=restoreTutorialCheckpoint(s.checkpoint);assert.deepEqual(restored,s.checkpoint);assert.equal(restored.battle.playerHP,70);assert.equal(restored.battle.time,0);assert.equal(restored.battle.enemies[0].element,'Nature');assert.equal(restored.ink,100);
 restored.battle.enemies[0].hp=2;restored.battle.potions.heal=0;assert.equal(s.checkpoint.battle.enemies[0].hp,100);assert.equal(s.checkpoint.battle.potions.heal,1);
 const paused=pauseTutorial(s);assert.equal(retryTutorial(paused).attempt,2);assert.deepEqual(restoreTutorialCheckpoint(retryTutorial(paused).checkpoint),s.checkpoint);
});

test('lesson checkpoints capture current battle and ink and pause before resuming',()=>{
 let s=beginTutorial(newTutorial(()=>.2));let b=advance(restoreTutorialCheckpoint(s.checkpoint).battle,6);
 b=drinkPotion(b,'heal');b=advance(b,.7);b=hitWithSpell(b,60,'fire');const saved=checkpointTutorial(s,b,42);
 assert.equal(saved.phase,'briefing');assert.ok(saved.attempt>s.attempt);assert.equal(saved.checkpoint.ink,42);assert.deepEqual(saved.checkpoint.battle,b);
 b.enemies[0].hp=1;assert.notEqual(saved.checkpoint.battle.enemies[0].hp,1);
 assert.deepEqual(restoreTutorialCheckpoint(retryTutorial(saved).checkpoint),saved.checkpoint);assert.equal(beginTutorial(saved).phase,'active');
 assert.strictEqual(checkpointTutorial(saved,{...b,phase:'defeat'},0),saved);
});

test('every random tutorial opponent is winnable using Steady counter spells and exit grants no run power',()=>{
 for(const roll of [0,.4,.8]){
  let b=restoreTutorialCheckpoint(newTutorial(()=>roll).checkpoint).battle;
  for(let i=0;i<8&&b.phase==='active';i++){
   const target=nearestEnemy(b)!;const spell=target.element==='Fire'?'water':target.element==='Water'?'nature':'fire';
   b=launchSpell(b,60,'#abc',spell);b=advance(b,2);
  }
  assert.equal(b.phase,'victory');assert.equal(b.enemies.length,1);assert.ok(b.playerHP>0);
  const menu=returnToMenu(),normal=startRun(selectMode(menu,'new'),'amber');assert.equal(menu.screen,'menu');assert.equal(normal.health,100);assert.equal(normal.gold,0);assert.deepEqual(normal.potions,{heal:1,freeze:0,ink:0});assert.deepEqual(normal.upgrades,{});
 }
});
