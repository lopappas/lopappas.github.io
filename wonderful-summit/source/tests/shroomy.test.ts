import test from 'node:test';
import assert from 'node:assert/strict';
import {CONTACT_X,launchSpell,newBattle,shroomyTickDamage,spellCooldownRemaining,spellDamage,spellKnockback,spellSlow,stepBattle,type Battle} from '../src/battle.ts';
import {GUARDIAN_SPEED,guardianStats} from '../src/guardian.ts';
import {recognize} from '../src/magic.ts';
import {practiceLesson} from '../src/practiceLessons.ts';
import {spellUpgradePreview} from '../src/spellbook.ts';

function field(...positions:number[]){
 const battle=newBattle('active',positions.length===1?'slime':'pack',()=>0);
 return {...battle,approachAt:Infinity,enemies:battle.enemies.map((enemy,index)=>({
  ...enemy,element:'Neutral' as const,x:positions[index],hp:200,maxHP:200,
 }))};
}
function at(battle:Battle,time:number){
 while(battle.time<time-1e-9)battle=stepBattle(battle,Math.min(.05,time-battle.time));
 return battle;
}
function cast(battle:Battle,quality=80){
 return launchSpell(battle,quality,'#9bbe72','shroomy');
}

test('the mushroom lesson scores against the full catalog and Shroomy has 15 HP at every successful quality',()=>{
 const lesson=practiceLesson('shroomy')!;
 assert.equal(lesson.spell.element,'Nature');
 assert.equal(lesson.spell.rarity,'Legendary');
 assert.equal(lesson.paths.length,2);
 const drawing=lesson.paths.map(path=>path.map(p=>({x:p.x*1.8+30,y:p.y*1.8-12})));
 const match=recognize(drawing);
 assert.equal(match.spell?.id,'shroomy');
 assert.ok(match.quality>=98);
 for(const [quality,tick] of [[45,1.0368],[60,1.5552],[80,2.592],[100,3.6288]]){
  assert.equal(guardianStats('shroomy',quality).hp,15);
  assert.equal(guardianStats('shroomy',quality,1).hp,15);
  assert.equal(shroomyTickDamage({element:'Neutral'},quality),tick);
  assert.ok(Math.abs(shroomyTickDamage({element:'Neutral'},quality,1,1)-tick*1.1)<1e-9);
 }
 assert.equal(spellUpgradePreview('shroomy')?.nextDamage,1.71072);
 assert.deepEqual(spellUpgradePreview('shroomy')?.guardianRange,{current:220,next:250});
});

test('at 220 units a spore lands without damage or knockback and ticks exactly ten times',()=>{
 const fresh=cast(field(CONTACT_X+220));
 assert.equal(fresh.shroomy?.hp,15);
 assert.equal(spellCooldownRemaining(fresh,'shroomy'),30);
 const launched=at(fresh,.05);
 assert.equal(launched.shroomy?.shot?.targetId,1);
 assert.equal(launched.shroomy!.nextShotAt,2.75);
 const planted=at(launched,.33);
 const [enemy]=planted.enemies;
 assert.equal(enemy.hp,200);
 assert.equal(enemy.push,null);
 assert.equal(spellDamage(enemy,80,'shroomy'),0);
 assert.equal(spellKnockback(80,'shroomy'),0);
 assert.equal(enemy.spores?.length,1);
 const alone={...planted,shroomy:null};
 assert.equal(at(alone,1.329).enemies[0].hp,200);
 assert.equal(at(alone,1.33).enemies[0].hp,197.408);
 const finished=at(alone,10.33);
 assert.ok(Math.abs(finished.enemies[0].hp-174.08)<1e-9);
 assert.deepEqual(finished.enemies[0].spores,[]);
 assert.equal(at(finished,13).enemies[0].hp,finished.enemies[0].hp);
 assert.equal(planted.enemies[0].spores?.[0].ticks,10);
});

test('Shroomy prefers the nearest unspored enemy and waits at the two-stack cap',()=>{
 let battle=cast(field(CONTACT_X+40,CONTACT_X+110));
 const targets:number[]=[];
 for(const time of [.05,2.75,5.45,8.15]){
  battle=at(battle,time);
  targets.push(battle.shroomy!.shot!.targetId);
 }
 assert.deepEqual(targets,[1,2,1,2]);
 battle=at(battle,9);
 assert.equal(battle.shroomy?.shot,null);
 assert.deepEqual(battle.enemies.map(enemy=>enemy.spores?.length),[2,2]);
 const secondStack={...battle.enemies[0].spores![1]};
 battle=at(battle,10.33);
 assert.equal(battle.shroomy?.shot,null);
 assert.deepEqual(battle.enemies[0].spores,[{...secondStack,nextTick:secondStack.nextTick+1,ticks:secondStack.ticks-1}]);
 battle=at(battle,10.85);
 assert.equal(battle.shroomy?.shot?.targetId,1);
 assert.equal(at(battle,11.15).enemies[0].spores?.length,2);
});

test('Shroomy stays planted and coexists with moving guardians, with 250 reach when upgraded',()=>{
 const state=cast(field(CONTACT_X+250));
 const trio=launchSpell(launchSpell(state,80,'#fff','scorchy'),80,'#fff','snowman');
 const walking=at(trio,1);
 for(const id of ['scorchy','snowman'] as const){
  assert.ok(Math.abs(walking[id]!.x-CONTACT_X-GUARDIAN_SPEED)<1e-9);
 }
 const waiting=at(walking,6.25);
 assert.equal(waiting.shroomy?.x,CONTACT_X);
 assert.equal(waiting.shroomy?.shot,null);
 assert.equal(waiting.enemies[0].spores,undefined);
 const upgraded=(distance:number)=>cast({...field(CONTACT_X+distance),upgrades:{shroomy:1}});
 assert.equal(at(upgraded(250),.05).shroomy?.shot?.targetId,1);
 assert.equal(at(upgraded(250.01),.5).shroomy?.shot,null);
 assert.equal(at(cast(field(CONTACT_X+220.01)),.5).shroomy?.shot,null);
 const alreadyInContact=cast({...field(CONTACT_X+5),approachAt:0},45);
 assert.equal(at(alreadyInContact,.05).shroomy,null);
});

test('spore ticks ignore elemental matchups and snapshot half the player damage boost',()=>{
 for(const element of ['Neutral','Fire','Water','Nature'] as const){
  const fresh={...field(CONTACT_X+140),damageBonus:2.2};
  fresh.enemies[0].element=element;
  const battle=at(cast(fresh),1.33);
  assert.equal(battle.shroomy?.damageBonus,1.6);
  assert.equal(battle.enemies[0].hp,195.8528);
  assert.equal(shroomyTickDamage({element},80),2.592);
  assert.equal(shroomyTickDamage({element},80,1,1),2.8512);
 }
});

test('spore slows stack on impact, expire independently and stay independent of Snaily',()=>{
 for(const [upgrade,slow] of [[0,.025],[1,.03]]){
  const fresh=cast({...field(CONTACT_X+140),snaily:true,upgrades:{shroomy:upgrade}});
  const first=at(fresh,.33);
  const both=at(first,3.1);
  assert.equal(spellSlow(first,first.enemies[0],first.time),slow);
  assert.equal(spellSlow(both,both.enemies[0],both.time),2*slow);
  assert.equal(spellSlow({...both,snaily:false},both.enemies[0],both.time),2*slow);
  const brambled={...both.enemies[0],leafSlows:[{until:20,amount:.3}]};
  assert.ok(Math.abs(spellSlow(both,brambled,both.time)-(.35+2*slow))<1e-9);
  const mobile={...both,shroomy:null,approachAt:0};
  const moved=stepBattle(mobile,.05);
  assert.ok(Math.abs(mobile.enemies[0].x-moved.enemies[0].x-18*.05*(1-2*slow))<1e-9);
  const oneLeft=at({...both,shroomy:null},10.33);
  assert.equal(spellSlow(oneLeft,oneLeft.enemies[0],oneLeft.time),slow);
  const lastSpore=oneLeft.enemies[0].spores![0];
  const expired=at(oneLeft,lastSpore.nextTick+lastSpore.ticks-1);
  assert.equal(spellSlow(expired,expired.enemies[0],expired.time),0);
 }
 assert.deepEqual(spellUpgradePreview('shroomy')?.sporeSlow,{current:2.5,next:3});
});
