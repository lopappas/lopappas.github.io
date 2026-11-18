import test from 'node:test';
import assert from 'node:assert/strict';
import {CONTACT_X,launchSpell,newBattle,stepBattle,type Battle} from '../src/battle.ts';
import {recognize} from '../src/magic.ts';
import {practiceLesson} from '../src/practiceLessons.ts';

function advance(state:Battle,seconds:number){
 for(let i=0;i<Math.round(seconds*100);i++)state=stepBattle(state,.01);
 return state;
}

function summon(state:Battle,quality=80){
 return launchSpell(state,quality,'#69c2d6','snowman');
}

test('the Snowman lesson casts the new spell against the full recognition roster',()=>{
 const lesson=practiceLesson('snowman')!;
 const match=recognize(lesson.paths);
 assert.equal(lesson.paths.length,2);
 assert.equal(match.spell?.id,'snowman');
 assert.ok(match.quality>=80);
});

test('Snowman walks slowly, stops 250 units ahead and lasts indefinitely at Steady or better',()=>{
 for(const quality of [60,70,80,100]){
  const field=newBattle('active');field.enemies[0].spawnAt=100;
  let battle=summon(field,quality);
  assert.equal(battle.snowman?.hp,quality);
  assert.equal(battle.snowman?.expiresAt,null);
  assert.ok(Math.abs(advance(battle,1).snowman!.x-CONTACT_X-14)<1e-8);
  battle=advance(battle,65);
  assert.equal(battle.snowman?.x,CONTACT_X+250);
  assert.equal(battle.snowman?.snowball,null);
 }
});

test('Faint Snowman expires at 20 active seconds and a recast replaces the existing summon',()=>{
 const field=newBattle('active');field.enemies[0].spawnAt=100;
 const faint=summon(field,59);
 assert.equal(faint.snowman?.expiresAt,20);
 const nearlyMelted=advance(faint,19.99);
 assert.ok(nearlyMelted.snowman);
 assert.equal(advance(nearlyMelted,.01).snowman,null);

 const first=advance(summon(field),30);
 const replacement=summon(first,60);
 assert.equal(replacement.snowman?.hp,60);
 assert.equal(replacement.snowman?.x,CONTACT_X);
 assert.equal(replacement.casts,2);
});

test('Snowman throws at 10 units, deals 20 neutral damage at 80% and waits two seconds between throws',()=>{
 const field=newBattle('active');
 field.approachAt=100;
 const enemy=field.enemies[0];
 enemy.element='Neutral';
 enemy.x=CONTACT_X+261;
 let battle=advance(summon(field),20);
 assert.equal(battle.snowman?.snowball,null);
 battle.enemies[0].x--;

 battle=advance(battle,.01);
 assert.equal(battle.snowman?.snowball?.targetId,enemy.id);
 assert.equal(battle.enemies[0].hp,100);
 battle=advance(battle,.28);
 assert.equal(battle.enemies[0].hp,80);
 assert.equal(battle.enemies[0].push,null);
 assert.equal(battle.enemies[0].x,CONTACT_X+260);
 battle=advance(battle,1.71);
 assert.equal(battle.snowman?.snowball,null);
 battle=advance(battle,.01);
 assert.equal(battle.snowman?.snowball?.targetId,enemy.id);
 assert.equal(advance(battle,.28).enemies[0].hp,60);
});

test('multiple enemies hit Snowman for 1.5 times their normal damage and resume attacking the player after it falls',()=>{
 const field=newBattle('active','pack',()=>.5);
 field.approachAt=0;
 field.enemies=field.enemies.map(e=>({...e,x:CONTACT_X+8,element:'Neutral'}));
 let battle=advance(summon(field),.46);
 assert.equal(battle.snowman?.hp,44);
 assert.equal(battle.playerHP,100);
 assert.equal(battle.playerHits,0);
 assert.deepEqual(battle.enemies.map(e=>e.hp),[80,100]);

 battle=advance(battle,4);
 assert.equal(battle.snowman,null);
 assert.equal(battle.playerHits,0);
 assert.ok(advance(battle,3).playerHits>0);
});

test('snowballs apply Water matchups and rocky defenses without knockback',()=>{
 const examples=[
  {quality:80,element:'Fire',rocky:false,damage:30},
  {quality:80,element:'Water',rocky:false,damage:10},
  {quality:80,element:'Nature',rocky:false,damage:15},
  {quality:48,element:'Neutral',rocky:true,damage:6},
  {quality:60,element:'Neutral',rocky:true,damage:11.25},
 ] as const;
 for(const {quality,element,rocky,damage} of examples){
  const field=newBattle('active');
  const enemy=field.enemies[0];
  Object.assign(enemy,{element,rocky,x:CONTACT_X+8});
  const hit=advance(summon(field,quality),.29).enemies[0];
  assert.equal(enemy.hp-hit.hp,damage);
  assert.equal(hit.push,null);
 }
});
