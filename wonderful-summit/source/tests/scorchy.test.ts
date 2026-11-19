import test from 'node:test';
import assert from 'node:assert/strict';
import {CONTACT_X,hitWithSpell,launchSpell,newBattle,spellCooldownRemaining,spellKnockback,stepBattle,type Battle} from '../src/battle.ts';
import {PLAYER_SPELLS,recognize} from '../src/magic.ts';
import {practiceLesson} from '../src/practiceLessons.ts';
import {spellUpgradePreview} from '../src/spellbook.ts';
import {SHIELD_BURN_SECONDS,woodenShield} from '../src/shields.ts';

function advance(battle:Battle,seconds:number){
 for(let i=0;i<Math.round(seconds*100);i++)battle=stepBattle(battle,.01);
 return battle;
}

function summon(battle:Battle,quality=80){
 return launchSpell(battle,quality,'#f0a068','scorchy');
}

test('the S1 lesson keeps the eye corners aligned to the grin and recognizes Scorchy',()=>{
 const spell=PLAYER_SPELLS.find(spell=>spell.id==='scorchy')!;
 const lesson=practiceLesson('scorchy')!;
 const [circle,leftEye,rightEye,mouth]=lesson.paths;
 assert.equal(spell.rarity,'Legendary');
 assert.equal(spell.element,'Fire');
 assert.equal(lesson.paths.length,4);
 assert.equal(Math.min(...leftEye.map(point=>point.x)),mouth[0].x);
 assert.equal(Math.max(...rightEye.map(point=>point.x)),mouth[1].x);
 assert.ok(Math.abs(circle[0].y-circle.at(-1)!.y)<1e-8);
 const drawing=lesson.paths.map((stroke,index)=>stroke.map(point=>({
  x:2*point.x+17+(index%2?.5:0),y:2*point.y+4,
 })));
 const result=recognize(drawing);
 assert.equal(result.spell?.id,'scorchy');
 assert.ok(result.quality>=80);
});

test('Scorchy fires at 40 units every 1.5 seconds with stronger Fire damage and a small push',()=>{
 for(const [element,damage] of [['Nature',31.68],['Fire',10.56],['Water',15.84]] as const){
  const field=newBattle('active');
  field.enemies[0].element=element;
  field.enemies[0].x=CONTACT_X+40;
  let battle=summon(field);
  assert.equal(spellCooldownRemaining(battle,'scorchy'),30);
  assert.equal(battle.scorchy?.hp,100);
  assert.equal(battle.scorchy?.shot,null);
  battle=advance(battle,.01);
  assert.equal(battle.scorchy?.shot?.targetId,field.enemies[0].id);
  assert.equal(battle.scorchy?.x,CONTACT_X);
  battle=advance(battle,.28);
  assert.equal(battle.enemies[0].hp,100-damage);
  const push=battle.enemies[0].push!;
  assert.ok(Math.abs(push.to-push.from-spellKnockback(80,'scorchy',1,element))<1e-8);
  battle=advance(battle,1.21);
  assert.equal(battle.scorchy?.shot,null);
  assert.ok(advance(battle,.01).scorchy?.shot);
 }
});

test('Scorchy knockback scales with cast quality and Scorchy+ attacks 15% more often',()=>{
 const knockback=(quality:number,upgrade=0)=>spellKnockback(quality,'scorchy',1,'Neutral',false,null,0,upgrade);
 assert.equal(knockback(44),0);
 assert.equal(knockback(45),3);
 assert.equal(knockback(100),5);
 assert.equal(knockback(45,1),4);
 assert.equal(knockback(100,1),8);
 assert.ok(knockback(80)>knockback(60));
 assert.ok(knockback(80,1)>knockback(60,1));
 const expectedInterval=1.5/1.15;
 const preview=spellUpgradePreview('scorchy');
 assert.deepEqual(preview?.guardianKnockback,{current:'3–5',next:'4–8'});
 assert.deepEqual(preview?.shotInterval,{current:1.5,next:expectedInterval});

 const field=newBattle('active');
 field.upgrades.scorchy=1;
 Object.assign(field.enemies[0],{element:'Neutral',x:CONTACT_X+20});
 const first=advance(summon(field),.01);
 assert.ok(Math.abs(first.scorchy!.nextShotAt-first.time-expectedInterval)<1e-9);
 const hit=advance(first,.28);
 assert.equal(hit.enemies[0].hp,100-23.232);
 const push=hit.enemies[0].push!;
 assert.ok(Math.abs(push.to-push.from-knockback(80,1))<1e-8);
 const before=advance(hit,1.02);
 assert.equal(before.scorchy?.shot,null);
 assert.ok(advance(before,.01).scorchy?.shot);
});

test('guardian upgrades extend the exact firing boundary by ten units',()=>{
 for(const [id,baseRange] of [['snowman',50],['scorchy',40]] as const){
  for(const upgrade of [0,1]){
   const field=newBattle('active');
   const edge=CONTACT_X+250+baseRange+10*upgrade;
   field.approachAt=100;
   field.upgrades[id]=upgrade;
   field.enemies[0].x=edge+.01;
   const cast=launchSpell(field,80,'#f0a068',id);
   cast[id]!.x=CONTACT_X+250;
   const outside=advance(cast,.01);
   assert.equal(outside[id]?.shot,null,id);
   outside.enemies[0].x=edge;
   assert.ok(advance(outside,.01)[id]?.shot,id);
  }
  assert.deepEqual(spellUpgradePreview(id)?.guardianRange,{current:baseRange,next:baseRange+10});
 }
});

test('Snowman and Scorchy can coexist and the leading guardian takes the contact hit',()=>{
 const field=newBattle('active');
 field.approachAt=0;
 field.enemies[0].element='Neutral';
 field.enemies[0].x=CONTACT_X+68;
 const summoned=summon(launchSpell(field,80,'#69c2d6','snowman'));
 summoned.snowman!.x=CONTACT_X+40;
 summoned.scorchy!.x=CONTACT_X+60;
 const struck=advance(summoned,.01);
 assert.equal(struck.scorchy?.hp,82);
 assert.equal(struck.scorchy?.x,CONTACT_X+60);
 assert.equal(struck.snowman?.hp,150);
 assert.ok(struck.scorchy?.shot&&struck.snowman?.shot);
 const push=hitWithSpell(struck,80,'water');
 assert.ok(push.enemies[0].push);
 assert.equal(push.scorchy?.hp,82);
 const recast=summon({...struck,cooldownsDisabled:true});
 assert.equal(recast.snowman,struck.snowman);
 assert.equal(recast.scorchy?.hp,100);
});

test('Scorchy inherits half of the Fire-specific amulet bonus and upgrades like Snowman',()=>{
 const field=newBattle('active');
 field.enemies[0].element='Neutral';
 field.enemies[0].x=CONTACT_X+40;
 field.amulets.sun=true;
 field.upgrades.scorchy=1;
 const battle=advance(summon(field),.29);
 assert.equal(battle.scorchy?.hp,120);
 assert.equal(battle.enemies[0].hp,100-24.9744);
 assert.deepEqual(spellUpgradePreview('scorchy')?.guardianHealth,{current:75,next:90});
});


test('Scorchy fireballs ignite wooden shields on impact and leave armor active until it breaks',()=>{
 const field=newBattle('active');
 field.approachAt=0;
 Object.assign(field.enemies[0],{element:'Fire',x:CONTACT_X+8,shield:woodenShield()});
 const flying=advance(summon(field),.28);
 assert.equal(flying.enemies[0].shield?.burnUntil,null);

 const impact=advance(flying,.01);
 const burning=impact.enemies[0];
 assert.equal(burning.hp,100-5.28);
 assert.equal(burning.shield?.burnUntil,impact.time+SHIELD_BURN_SECONDS);
 assert.equal(burning.burn,null);
 const push=burning.push!;
 assert.ok(Math.abs(push.to-push.from-spellKnockback(80,'scorchy',1,'Fire',false,burning.shield,impact.time))<1e-8);

 const next=advance(impact,1.5);
 assert.equal(next.enemies[0].shield?.burnUntil,burning.shield?.burnUntil);
 assert.ok(Math.abs(next.enemies[0].hp-(100-10.56))<1e-8);
 assert.equal(next.enemies[0].clock,burning.clock);
 assert.equal(advance(next,.5).enemies[0].shield,null);

 const unarmored=advance(next,1.5);
 assert.equal(unarmored.enemies[0].shield,null);
 assert.ok(Math.abs(unarmored.enemies[0].hp-(100-21.12))<1e-8);
});
