import test from 'node:test';
import assert from 'node:assert/strict';
import {CONTACT_X,launchSpell,newBattle,shroomyTickDamage,spellCooldownRemaining,spellDamage,spellKnockback,stepBattle,type Battle} from '../src/battle.ts';
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

test('the mushroom lesson scores against the full catalog and Shroomy scales from 10 to 40 HP',()=>{
 const lesson=practiceLesson('shroomy')!;
 assert.equal(lesson.spell.element,'Nature');
 assert.equal(lesson.spell.rarity,'Legendary');
 assert.equal(lesson.paths.length,4);
 const drawing=lesson.paths.map(path=>path.map(p=>({x:p.x*1.8+30,y:p.y*1.8-12})));
 const match=recognize(drawing);
 assert.equal(match.spell?.id,'shroomy');
 assert.ok(match.quality>=98);
 for(const [quality,hp,tick] of [[45,10,2],[60,19,3],[80,30,5],[100,40,7]]){
  assert.equal(guardianStats('shroomy',quality).hp,hp);
  assert.equal(shroomyTickDamage({element:'Neutral'},quality),tick);
 }
 assert.equal(spellUpgradePreview('shroomy')?.nextDamage,3.3);
});

test('at 160 units a spore lands without damage or knockback and ticks exactly ten times',()=>{
 const fresh=cast(field(CONTACT_X+160));
 assert.equal(fresh.shroomy?.hp,30);
 assert.equal(spellCooldownRemaining(fresh,'shroomy'),30);
 const launched=at(fresh,.05);
 assert.equal(launched.shroomy?.shot?.targetId,1);
 assert.equal(launched.shroomy!.nextShotAt,2.55);
 const planted=at(launched,.33);
 const [enemy]=planted.enemies;
 assert.equal(enemy.hp,200);
 assert.equal(enemy.push,null);
 assert.equal(spellDamage(enemy,80,'shroomy'),0);
 assert.equal(spellKnockback(80,'shroomy'),0);
 assert.equal(enemy.spores?.length,1);
 const alone={...planted,shroomy:null};
 assert.equal(at(alone,1.329).enemies[0].hp,200);
 assert.equal(at(alone,1.33).enemies[0].hp,195);
 const finished=at(alone,10.33);
 assert.equal(finished.enemies[0].hp,150);
 assert.deepEqual(finished.enemies[0].spores,[]);
 assert.equal(at(finished,13).enemies[0].hp,150);
 assert.equal(planted.enemies[0].spores?.[0].ticks,10);
});

test('Shroomy prefers the nearest unspored enemy and waits at the two-stack cap',()=>{
 let battle=cast(field(CONTACT_X+40,CONTACT_X+110));
 const targets:number[]=[];
 for(const time of [.05,2.55,5.05,7.55]){
  battle=at(battle,time);
  targets.push(battle.shroomy!.shot!.targetId);
 }
 assert.deepEqual(targets,[1,2,1,2]);
 battle=at(battle,9);
 assert.equal(battle.shroomy?.shot,null);
 assert.deepEqual(battle.enemies.map(enemy=>enemy.spores?.length),[2,2]);
 const secondStack={...battle.enemies[0].spores![1]};
 battle=at(battle,10.33);
 assert.equal(battle.shroomy?.shot?.targetId,1);
 assert.deepEqual(battle.enemies[0].spores,[{...secondStack,nextTick:secondStack.nextTick+2,ticks:secondStack.ticks-2}]);
 assert.equal(at(battle,10.63).enemies[0].spores?.length,2);
});

test('Shroomy marches at Scorchy speed, holds at range, and can coexist with both guardians',()=>{
 const state=cast(field(CONTACT_X+250));
 const trio=launchSpell(launchSpell(state,80,'#fff','scorchy'),80,'#fff','snowman');
 const walking=at(trio,1);
 for(const id of ['shroomy','scorchy','snowman'] as const){
  assert.ok(Math.abs(walking[id]!.x-CONTACT_X-GUARDIAN_SPEED)<1e-9);
 }
 const waiting=at(walking,6.25);
 assert.equal(waiting.shroomy?.x,CONTACT_X+90);
 assert.ok(waiting.enemies[0].spores?.length);
 const alreadyInContact=cast({...field(CONTACT_X+5),approachAt:0},45);
 assert.equal(at(alreadyInContact,.05).shroomy,null);
});

test('spores use Nature matchup and snapshot half the player damage boost',()=>{
 const fresh={...field(CONTACT_X+140),damageBonus:2.2};
 fresh.enemies[0].element='Water';
 const battle=at(cast(fresh),1.33);
 assert.equal(battle.shroomy?.damageBonus,1.6);
 assert.equal(battle.enemies[0].hp,188);
 assert.equal(shroomyTickDamage({element:'Water'},80),7.5);
 assert.equal(shroomyTickDamage({element:'Nature'},80),2.5);
 assert.equal(shroomyTickDamage({element:'Fire'},80),3.75);
 assert.equal(shroomyTickDamage({element:'Neutral'},80,1,1),5.5);
});
