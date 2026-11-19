import test from 'node:test';
import assert from 'node:assert/strict';
import {CONTACT_X,drinkPotion,enemyY,fizzleSpell,hitWithSpell,launchSpell,newBattle,spellDamage,stepBattle,type Battle} from '../src/battle.ts';
import {recognize} from '../src/magic.ts';
import {practiceLesson} from '../src/practiceLessons.ts';
import {snowmanStats} from '../src/snowman.ts';
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
  [{x:35,y:46},{x:21,y:32}],
  [{x:65,y:46},{x:79,y:32}],
 ]);
 assert.equal(match.spell?.id,'snowman');
 assert.ok(match.quality>=80);
});

test('Snowman walks slowly, stops 250 units ahead and lasts indefinitely at Steady or better',()=>{
 for(const [quality,hp] of [[60,75],[70,85],[80,100],[100,120]]){
  const field=newBattle('active');field.enemies[0].spawnAt=100;
  let battle=summon(field,quality);
  assert.equal(battle.snowman?.hp,hp);
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
 assert.equal(replacement.snowman?.hp,75);
 assert.equal(replacement.snowman?.x,CONTACT_X);
 assert.equal(replacement.casts,2);
});

test('Snowman throws at 30 units, deals 8 neutral damage at 80% and waits one second between throws',()=>{
 const field=newBattle('active');
 field.approachAt=100;
 const enemy=field.enemies[0];
 enemy.element='Neutral';
 enemy.x=CONTACT_X+281;
 let battle=advance(summon(field),20);
 assert.equal(battle.snowman?.snowball,null);
 battle.enemies[0].x--;

 battle=advance(battle,.01);
 assert.equal(battle.snowman?.snowball?.targetId,enemy.id);
 assert.equal(battle.enemies[0].hp,100);
 battle=advance(battle,.28);
 assert.equal(battle.enemies[0].hp,92);
 assert.equal(battle.enemies[0].push,null);
 assert.equal(battle.enemies[0].x,CONTACT_X+280);
 battle=advance(battle,.71);
 assert.equal(battle.snowman?.snowball,null);
 battle=advance(battle,.01);
 assert.equal(battle.snowman?.snowball?.targetId,enemy.id);
 assert.equal(advance(battle,.28).enemies[0].hp,84);
});

test('Snowman stops at the range boundary and stays there between throws',()=>{
 const field=newBattle('active');
 field.approachAt=100;
 field.enemies[0].x=CONTACT_X+35;
 let battle=advance(summon(field),.5);
 assert.equal(battle.snowman?.x,CONTACT_X+5);
 battle=advance(battle,1.2);
 assert.equal(battle.snowman?.x,CONTACT_X+5);
 battle.enemies[0].x=CONTACT_X+40;
 battle=advance(battle,.5);
 assert.ok(battle.snowman!.x>CONTACT_X+5);
});

function atContact(state:Battle=newBattle('active')){
 state.approachAt=0;
 state.enemies=state.enemies.map(e=>({...e,x:CONTACT_X+68,element:'Neutral',hp:1000,maxHP:1000}));
 const cast=summon(state);
 cast.snowman!.x=CONTACT_X+60;
 return advance(cast,.01);
}

test('enemies wind up for one second and recover for one second in place without shoving Snowman',()=>{
 let battle=atContact();
 const guardianX=battle.snowman!.x,enemyX=battle.enemies[0].x;
 assert.equal(battle.enemies[0].snowmanAttackAt,1.01);
 battle=advance(battle,.99);
 assert.equal(battle.snowman?.hp,100);
 assert.equal(battle.enemies[0].x,enemyX);
 battle=advance(battle,.01);
 assert.equal(battle.snowman?.hp,82);
 assert.equal(battle.snowman?.x,guardianX);
 assert.equal(battle.enemies[0].snowmanAttackAt,undefined);
 battle=advance(battle,.99);
 assert.equal(battle.enemies[0].snowmanAttackAt,undefined);
 battle=advance(battle,.01);
 assert.ok(Math.abs(battle.enemies[0].snowmanAttackAt!-3.01)<1e-8);
 battle=advance(battle,1);
 assert.equal(battle.snowman?.hp,64);
 assert.equal(battle.snowman?.x,guardianX);
});

test('enemies can attack Snowman from separate lanes and resume marching when it falls',()=>{
 let battle=atContact(newBattle('active','pack',()=>.5));
 const guardianX=battle.snowman!.x;
 battle=advance(battle,1);
 assert.equal(battle.snowman?.hp,64);
 assert.equal(battle.snowman?.x,guardianX);
 battle=advance(battle,4);
 assert.equal(battle.snowman,null);
 assert.equal(battle.playerHits,0);
 assert.ok(advance(battle,5.8).playerHits>0);
});

test('wind-up blocks spell, relic and potion knockback while recovery permits it',()=>{
 const strike=atContact();
 const enemy=strike.enemies[0],attackX=enemy.x;
 const flash={...strike,blackFlash:{enabled:true,chain:false}};
 const spell=hitWithSpell(flash,80,'water',enemy.id,()=>0);
 assert.ok(spell.enemies[0].hp<enemy.hp);
 assert.ok(spell.blackFlashBurst);
 assert.equal(spell.enemies[0].push,null);
 assert.equal(spell.enemies[0].snowmanAttackAt,enemy.snowmanAttackAt);

 const fizzle=fizzleSpell({...strike,castingRelics:{...strike.castingRelics,sphere:true}});
 assert.ok(fizzle.enemies[0].hp<enemy.hp);
 assert.equal(fizzle.enemies[0].push,null);

 const vial=advance(drinkPotion({...strike,hazardousVials:true},'heal'),.66);
 assert.equal(vial.enemies[0].x,attackX);
 assert.equal(vial.enemies[0].push,null);

 const rain=launchSpell(strike,80,'#69c2d6','torrent');
 rain.torrent!.orbs=[{x:attackX,y:enemyY(enemy.id),landsAt:.2,applied:false}];
 const splash=advance(rain,.25);
 assert.ok(splash.enemies[0].hp<enemy.hp);
 assert.equal(splash.enemies[0].x,attackX);
 assert.equal(splash.enemies[0].push,null);

 const recovery=advance(strike,1);
 const knockback=hitWithSpell(recovery,80,'water',enemy.id);
 assert.ok(knockback.enemies[0].push!.to>attackX);
 assert.ok(advance(knockback,.05).enemies[0].x>attackX);
 assert.equal(advance(knockback,.9).enemies[0].snowmanAttackAt,undefined);
});

test('freeze pauses the Snowman wind-up and recasting clears the old attack',()=>{
 const strike=atContact();
 const stopped=advance({...strike,freezeUntil:2},1.5);
 assert.equal(stopped.snowman?.hp,100);
 assert.equal(stopped.enemies[0].clock,strike.enemies[0].clock);
 const resumed=advance(stopped,1.51);
 assert.equal(resumed.snowman?.hp,82);

 const replaced=summon({...strike,cooldownsDisabled:true});
 assert.equal(replaced.enemies[0].snowmanAttackAt,undefined);
 assert.equal(advance(replaced,1).snowman?.hp,100);
});

test('snowballs apply Water matchups and rocky defenses without knockback',()=>{
 const examples=[
  {quality:80,element:'Fire',rocky:false,damage:12},
  {quality:80,element:'Water',rocky:false,damage:4},
  {quality:80,element:'Nature',rocky:false,damage:6},
  {quality:48,element:'Neutral',rocky:true,damage:2.25},
  {quality:60,element:'Neutral',rocky:true,damage:4.5},
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

test('Snowman rounds health up and halves the previous rounded damage before applying upgrades',()=>{
 const samples=[
  [44.99,0,0],[45,55,9],[49.99,60,9],[50,60,10],[50.01,65,10],
  [59,75,11],[60,75,12],[69,85,13],[70,85,14],[75,90,15],
  [79,95,15],[80,100,16],[100,120,20],
 ];
 for(const [quality,hp,previousDamage] of samples){
  const baseDamage=previousDamage/2;
  assert.deepEqual(snowmanStats(quality),{hp,baseDamage});
  assert.equal(snowmanStats(quality,1).hp,hp*6/5);
  assert.equal(spellDamage({element:'Neutral'},quality,'snowman',1,1),baseDamage*11/10);
 }
 assert.deepEqual(spellUpgradePreview('snowman')?.snowmanHealth,{current:75,next:90});
});

test('Snowman inherits half the combined cast-time damage bonus, including Fury and relics',()=>{
 for(const {stale,upgrade,damage} of [{stale:0,upgrade:0,damage:12.8},{stale:0,upgrade:1,damage:14.08},{stale:3,upgrade:0,damage:9.6}]){
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
  assert.equal(cast.snowman?.hp,upgrade?120:100);
  const hit=advance(cast,.29);
  assert.ok(Math.abs(100-hit.enemies[0].hp-damage)<1e-8);
 }
});
