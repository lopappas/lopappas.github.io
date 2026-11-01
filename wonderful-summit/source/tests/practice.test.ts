import test from 'node:test';
import assert from 'node:assert/strict';
import {SPELLS,isUpgradableSpell} from '../src/magic.ts';
import {launchSpell} from '../src/battle.ts';
import {newPracticeBattle,practiceJourney,restoreScarecrow,stepPracticeBattle,practiceDamage,practiceEffects,SCARECROW_HEALTH} from '../src/practice.ts';

test('practice grants every spell and toggles only valid upgrades without altering the journey',()=>{
 const base=practiceJourney(),upgraded=practiceJourney(true);
 assert.deepEqual(base.spells,SPELLS.map(s=>s.id));
 assert.deepEqual(base.upgrades,{});
 for(const spell of SPELLS)assert.equal(upgraded.upgrades[spell.id],isUpgradableSpell(spell.id)?1:undefined);
 assert.deepEqual(base.relics,[]);
 assert.deepEqual(newPracticeBattle(base).potions,{heal:0,freeze:0,ink:0});
 assert.deepEqual(practiceJourney().upgrades,{});
});
test('every spell can hit the stationary neutral scarecrow repeatedly without ending practice',()=>{
 for(const spell of SPELLS){
  let battle=newPracticeBattle(practiceJourney());let total=0;
  for(let casts=0;casts<3;casts++){
   battle=restoreScarecrow(launchSpell(battle,100,spell.color,spell.id,20),false);
   for(let frame=0;frame<200;frame++){
    const next=stepPracticeBattle(battle,.1,false,-1).battle;
    total+=practiceDamage(next);battle=restoreScarecrow(next,false);
    assert.equal(battle.phase,'active');assert.equal(battle.playerHP,100);assert.equal(battle.enemies[0].hp,SCARECROW_HEALTH);assert.equal(battle.enemies[0].x,560);assert.equal(battle.enemies[0].element,'Neutral');
   }
  }
  assert.ok(spell.id==='chronos'||total>0,spell.name+' deals damage');
 }
});
test('mobile scarecrow patrols both directions without attacking and time-stop freezes it',()=>{
 let battle=newPracticeBattle(practiceJourney()),direction:1|-1=-1,min=560,max=560;
 const initial=JSON.stringify(battle);
 stepPracticeBattle(battle,.1,true,direction);assert.equal(JSON.stringify(battle),initial);
 for(let i=0;i<3000;i++){
  const result=stepPracticeBattle(battle,.1,true,direction);direction=result.direction;battle=restoreScarecrow(result.battle,true);min=Math.min(min,battle.enemies[0].x);max=Math.max(max,battle.enemies[0].x);
  assert.ok(battle.enemies[0].x>=420&&battle.enemies[0].x<=640);assert.equal(battle.playerHits,0);
 }
 assert.ok(min<=421&&max>=639);
 battle={...battle,enemies:battle.enemies.map(e=>({...e,stunUntil:battle.time+3}))};
 const x=battle.enemies[0].x;
 assert.equal(stepPracticeBattle(battle,.1,true,direction).battle.enemies[0].x,x);
 assert.ok(practiceEffects(battle).some(s=>s.startsWith('Time stopped')));
});
test('slow effects reduce mobile patrol travel; damage metrics include damage over time',()=>{
 const battle=newPracticeBattle(practiceJourney());
 const slow={...battle,enemies:battle.enemies.map(e=>({...e,leafSlows:[{until:10,amount:.5}],slowUntil:10,burn:{damage:5,nextTick:.1,ticks:3}}))};
 const normal=stepPracticeBattle(battle,.1,true,-1).battle;
 const next=stepPracticeBattle(slow,.1,true,-1).battle;
 assert.ok(battle.enemies[0].x-next.enemies[0].x < battle.enemies[0].x-normal.enemies[0].x);
 assert.equal(practiceDamage(next),5);
 assert.ok(practiceEffects(next).includes('Slowed 50%'));
 assert.ok(practiceEffects(next).some(s=>s.startsWith('Burning')));
 const restored=restoreScarecrow(next,false);assert.equal(practiceDamage(restored),0);assert.ok(restored.enemies[0].burn);
});
