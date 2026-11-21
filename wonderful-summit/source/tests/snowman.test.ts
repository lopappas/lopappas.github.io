import test from 'node:test';
import assert from 'node:assert/strict';
import {CONTACT_X,drinkPotion,enemyY,fizzleSpell,hitWithSpell,launchSpell,newBattle,spellDamage,spellKnockback,stepBattle,ENEMY_BACK_X,type Battle} from '../src/battle.ts';
import {recognize,SPELL_VARIATIONS} from '../src/magic.ts';
import {practiceLesson} from '../src/practiceLessons.ts';
import {guardianStats} from '../src/guardian.ts';
import {spellUpgradePreview} from '../src/spellbook.ts';

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
 assert.equal(lesson.paths.length,4);
 assert.deepEqual(lesson.paths.slice(2),[
  [{x:35,y:46},{x:16.8,y:27.8}],
  [{x:65,y:46},{x:83.2,y:27.8}],
 ]);
 assert.equal(match.spell?.id,'snowman');
 assert.equal(match.quality,100);
 assert.equal(SPELL_VARIATIONS.snowman,undefined);
 const shortArms=[...lesson.paths.slice(0,2),[{x:35,y:46},{x:21,y:32}],[{x:65,y:46},{x:79,y:32}]];
 assert.ok(recognize(shortArms).quality<100);
});

test('Snowman advances at 15.5 units per second and stops 250 units ahead',()=>{
 for(const [quality,hp] of [[60,117.5],[70,132.5],[80,155],[100,185]]){
  const field=newBattle('active');field.enemies[0].spawnAt=100;
  let battle=summon(field,quality);
  assert.equal(battle.snowman?.hp,hp);
  assert.ok(Math.abs(advance(battle,1).snowman!.x-CONTACT_X-15.5)<1e-8);
  battle=advance(battle,65);
  assert.equal(battle.snowman?.x,CONTACT_X+250);
  assert.equal(battle.snowman?.shot,null);
 }
});

test('Faint Snowman stays indefinitely and a recast replaces the existing summon',()=>{
 const field=newBattle('active');field.enemies[0].spawnAt=100;
 const faint=summon(field,59);
 const first=advance(faint,30);
 assert.equal(first.snowman?.hp,117.5);

 const replacement=summon(first,60);
 assert.notEqual(replacement.snowman,first.snowman);
 assert.equal(replacement.snowman?.hp,117.5);
 assert.equal(replacement.snowman?.x,CONTACT_X);
 assert.equal(replacement.casts,2);
});

test('Snowman throws at 50 units, deals 16 neutral damage at 80% and waits two seconds between throws',()=>{
 const field=newBattle('active');
 field.approachAt=100;
 const enemy=field.enemies[0];
 enemy.element='Neutral';
 enemy.x=CONTACT_X+301;
 let battle=advance(summon(field),20);
 assert.equal(battle.snowman?.shot,null);
 battle.enemies[0].x--;

 battle=advance(battle,.01);
 assert.equal(battle.snowman?.shot?.targetId,enemy.id);
 assert.equal(battle.enemies[0].hp,100);
 battle=advance(battle,.28);
 assert.equal(battle.enemies[0].hp,84);
 const push=battle.enemies[0].push!;
 assert.equal(push.from,CONTACT_X+300);
 assert.equal(push.to,Math.min(ENEMY_BACK_X,push.from+spellKnockback(80,'snowman')));
 battle=advance(battle,1.7);
 assert.equal(battle.snowman?.shot,null);
 battle.enemies[0].x=CONTACT_X+295;
 battle=advance(battle,.01);
 assert.equal(battle.snowman?.shot,null);
 battle=advance(battle,.01);
 assert.equal(battle.snowman?.shot?.targetId,enemy.id);
 assert.equal(advance(battle,.28).enemies[0].hp,68);
});

test('Snowman stops at the range boundary and advances when its target is pushed out of range',()=>{
 const field=newBattle('active');
 field.approachAt=100;
 Object.assign(field.enemies[0],{element:'Neutral',x:CONTACT_X+55});
 let battle=advance(summon(field),.5);
 assert.equal(battle.snowman?.x,CONTACT_X+5);
 battle=advance(battle,1.83);
 const position=battle.snowman!.x;
 assert.ok(position>CONTACT_X+5);
 assert.ok(Math.abs(battle.enemies[0].x-position-50)<1e-8);
 assert.equal(advance(battle,.02).snowman?.x,position);
});

function atContact(state:Battle=newBattle('active')){
 state.approachAt=0;
 state.enemies=state.enemies.map(e=>({...e,x:CONTACT_X+68,element:'Neutral',hp:1000,maxHP:1000}));
 const cast=summon(state);
 cast.snowman!.x=CONTACT_X+60;
 return advance(cast,.01);
}

test('enemies hit Snowman immediately on contact and every 1.5 seconds without shoving it',()=>{
 let battle=atContact();
 // Keep the enemy at contact to measure its cooldown independently of snowball push.
 battle.snowman={...battle.snowman!,shot:null,nextShotAt:Infinity};
 const guardianX=battle.snowman!.x,enemyX=battle.enemies[0].x;
 assert.equal(battle.snowman?.hp,137);
 assert.equal(battle.enemies[0].guardianHitAt,.01);
 battle=advance(battle,1.49);
 assert.equal(battle.snowman?.hp,137);
 assert.equal(battle.enemies[0].x,enemyX);
 battle=advance(battle,.01);
 assert.equal(battle.snowman?.hp,119);
 assert.equal(battle.snowman?.x,guardianX);
 battle=advance(battle,1.5);
 assert.equal(battle.snowman?.hp,101);
 assert.equal(battle.snowman?.x,guardianX);
});

test('enemies can attack Snowman from separate lanes and resume marching when it falls',()=>{
 let battle=atContact(newBattle('active','pack',()=>.5));
 const guardianX=battle.snowman!.x;
 assert.equal(battle.snowman?.hp,119);
 assert.equal(battle.snowman?.x,guardianX);
 battle=advance(battle,8.3);
 assert.equal(battle.snowman,null);
 assert.equal(battle.playerHits,0);
 assert.ok(advance(battle,5.8).playerHits>0);
});

test('spell, relic and potion knockback can move enemies right after they hit Snowman',()=>{
 const strike=atContact();
 const enemy=strike.enemies[0],attackX=enemy.x;
 const flash={...strike,blackFlash:{enabled:true,chain:false}};
 const spell=hitWithSpell(flash,80,'water',enemy.id,()=>0);
 assert.ok(spell.enemies[0].hp<enemy.hp);
 assert.ok(spell.blackFlashBurst);
 assert.ok(spell.enemies[0].push!.to>attackX);
 assert.ok(advance(spell,.05).enemies[0].x>attackX);

 const vine=hitWithSpell(strike,80,'sneakyVine',enemy.id);
 assert.equal(vine.vineGrab?.targetId,enemy.id);

 const fizzle=fizzleSpell({...strike,castingRelics:{...strike.castingRelics,sphere:true}});
 assert.ok(fizzle.enemies[0].hp<enemy.hp);
 assert.ok(fizzle.enemies[0].push!.to>attackX);

 const vial=advance(drinkPotion({...strike,hazardousVials:true},'heal'),.66);
 assert.ok(vial.enemies[0].x>attackX);

 const rain=launchSpell(strike,80,'#69c2d6','torrent');
 rain.torrent!.orbs=[{x:attackX,y:enemyY(enemy.id),landsAt:.2,applied:false}];
 const splash=advance(rain,.25);
 assert.ok(splash.enemies[0].hp<enemy.hp);
 assert.ok(splash.enemies[0].x>attackX);
});

test('knockback breaks contact and an enemy cannot hit again until it reaches Snowman',()=>{
 const strike=atContact();
 const enemy=strike.enemies[0];
 // Isolate the player's push so later snowballs cannot interrupt the return.
 const boosted={...strike,pushBonus:3,snowman:{...strike.snowman!,shot:null,nextShotAt:Infinity}};
 const pushed=hitWithSpell(boosted,80,'water',enemy.id);
 const waiting=advance({...pushed,pushBonus:strike.pushBonus},1.5);
 assert.ok(waiting.enemies[0].x>waiting.snowman!.x+8);
 assert.equal(waiting.snowman?.hp,137);
 const resumed=advance(waiting,10);
 assert.ok((resumed.snowman?.hp??0)<137);
});

test('freeze pauses the enemy cooldown and a recast starts with full health',()=>{
 const strike=atContact();
 strike.snowman={...strike.snowman!,shot:null,nextShotAt:Infinity};
 const stopped=advance({...strike,freezeUntil:2},1.5);
 assert.equal(stopped.snowman?.hp,137);
 assert.equal(stopped.enemies[0].clock,strike.enemies[0].clock);
 assert.equal(advance(stopped,1.98).snowman?.hp,137);
 assert.equal(advance(stopped,1.99).snowman?.hp,119);

 const replaced=summon({...strike,cooldownsDisabled:true});
 assert.equal(replaced.snowman?.hp,155);
 assert.equal(advance(replaced,1).snowman?.hp,155);
});

test('snowballs apply Water matchups and rocky defenses to damage and knockback',()=>{
 const examples=[
  {quality:80,element:'Fire',rocky:false,damage:24},
  {quality:80,element:'Water',rocky:false,damage:8},
  {quality:80,element:'Nature',rocky:false,damage:12},
  {quality:48,element:'Neutral',rocky:true,damage:4.5},
  {quality:60,element:'Neutral',rocky:true,damage:9},
 ] as const;
 for(const {quality,element,rocky,damage} of examples){
  const field=newBattle('active');
  const enemy=field.enemies[0];
  Object.assign(enemy,{element,rocky,x:CONTACT_X+8});
  const hit=advance(summon(field,quality),.29).enemies[0];
  assert.equal(enemy.hp-hit.hp,damage);
  const distance=spellKnockback(quality,'snowman',1,element,rocky);
  assert.ok(Math.abs((hit.push?hit.push.to-hit.push.from:0)-distance)<1e-8);
  assert.equal(hit.push===null,rocky&&quality<60);
 }
});

test('snowball knockback grows mildly with quality and preserves a stronger active push',()=>{
 assert.equal(spellKnockback(44,'snowman'),0);
 assert.equal(spellKnockback(45,'snowman'),13);
 assert.equal(spellKnockback(100,'snowman'),26);
 assert.equal(spellKnockback(45,'snowman',1,'Neutral',false,null,0,1),16);
 assert.equal(spellKnockback(100,'snowman',1,'Neutral',false,null,0,1),28);
 assert.deepEqual(spellUpgradePreview('snowman')?.guardianKnockback,{current:'13–26',next:'16–28'});
 assert.ok(spellKnockback(80,'snowman')>spellKnockback(60,'snowman'));
 const field=newBattle('active');
 Object.assign(field.enemies[0],{element:'Neutral',x:CONTACT_X+25,hp:1000});
 const flight=advance(summon(field),.27);
 const stronger=hitWithSpell(flight,80,'water');
 assert.ok(stronger.enemies[0].push);
 const impact=advance(stronger,.02);
 assert.equal(impact.snowman?.shot,null);
 assert.equal(stronger.enemies[0].hp-impact.enemies[0].hp,16);
 assert.strictEqual(impact.enemies[0].push,stronger.enemies[0].push);
});

test('Snowman and Snowman+ get exactly five extra health at every successful quality',()=>{
 const samples=[
  [44.99,0,0],[45,55,9],[49.99,60,9],[50,60,10],[50.01,65,10],
  [59,75,11],[60,75,12],[69,85,13],[70,85,14],[75,90,15],
  [79,95,15],[80,100,16],[100,120,20],
 ];
 for(const [quality,hp,baseDamage] of samples){
  const flatHealth=hp>0?5:0;
  assert.deepEqual(guardianStats('snowman',quality),{hp:hp*3/2+flatHealth,baseDamage});
  assert.equal(guardianStats('snowman',quality,1).hp,hp*3/2*6/5+flatHealth);
  assert.equal(spellDamage({element:'Neutral'},quality,'snowman',1,1),baseDamage*11/10);
 }
 assert.deepEqual(spellUpgradePreview('snowman')?.guardianHealth,{current:117.5,next:140});
});

test('Snowman inherits half the combined cast-time damage bonus, including Fury and relics',()=>{
 for(const {stale,upgrade,damage} of [{stale:0,upgrade:0,damage:25.6},{stale:0,upgrade:1,damage:28.16},{stale:3,upgrade:0,damage:19.2}]){
  const field=newBattle('active');
  Object.assign(field.enemies[0],{element:'Neutral',x:CONTACT_X+8});
  field.potions.fury=1;
  field.damageBonus=1.1;
  field.upgrades.snowman=upgrade;
  field.stale={spellId:'snowman',count:stale};
  const ready=advance(drinkPotion(field,'fury'),.66);
  assert.equal(ready.furyReady,true);
  const cast=summon(ready);
  assert.equal(cast.furyReady,false);
  assert.equal(cast.snowman?.hp,upgrade?185:155);
  const hit=advance(cast,.29);
  assert.ok(Math.abs(100-hit.enemies[0].hp-damage)<1e-8);
 }
});
