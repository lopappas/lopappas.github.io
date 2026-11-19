import test from 'node:test';
import assert from 'node:assert/strict';
import {CONTACT_X,drinkPotion,hitWithSpell,launchSpell,newBattle,spellCastBlockReason,spellDamage,spellKnockback,stepBattle,type Battle} from '../src/battle.ts';
import {constellationBonus} from '../src/constellation.ts';
import {PLAYER_SPELLS,recognize} from '../src/magic.ts';
import {practiceLesson} from '../src/practiceLessons.ts';
import {spellUpgradePreview} from '../src/spellbook.ts';

function advance(battle:Battle,seconds:number){
 for(let i=0;i<Math.round(seconds*100);i++)battle=stepBattle(battle,.01);
 return battle;
}

function summon(battle:Battle,quality=80){
 return launchSpell(battle,quality,'#ad8bda','constellation');
}

test('Constellation is a Legendary Ancient spell whose one-stroke lesson is recognized',()=>{
 const spell=PLAYER_SPELLS.find(spell=>spell.id==='constellation')!;
 const lesson=practiceLesson(spell.id)!;
 assert.equal(spell.element,'Ancient');
 assert.equal(spell.rarity,'Legendary');
 assert.equal(lesson.paths.length,1);
 const drawing=lesson.paths.map(path=>path.map(({x,y})=>({x:2*x+17,y:2*y-9})));
 assert.equal(recognize(drawing).spell?.id,'constellation');
 assert.ok(recognize(drawing).quality>=80);
});

test('Constellation scales between the selected anchors and the upgrade adds fixed points',()=>{
 for(const [quality,armor,damage,knockback] of [[45,5,8,5],[59,5,8,5],[60,12,14,10],[70,21,22,15],[80,30,30,20],[90,35,35,23],[100,40,40,25]]){
  assert.deepEqual(constellationBonus(quality),{armor,damage,knockback});
  assert.deepEqual(constellationBonus(quality,1),{armor:armor+5,damage:damage+5,knockback:knockback+3});
 }
 assert.deepEqual(constellationBonus(44,1),{armor:0,damage:0,knockback:0});
 assert.deepEqual(spellUpgradePreview('constellation')?.constellation,{
  current:{armor:12,damage:14,knockback:10},next:{armor:17,damage:19,knockback:13},
 });
});

test('drawn Constellation applies additive buffs once even when no enemy is present',()=>{
 const field=newBattle('active');field.enemies[0].spawnAt=10;
 field.damageBonus=1.2;field.pushBonus=1.15;field.playerHP=72;
 field.lotus=true;field.lotusReady=true;
 assert.equal(summon(field,44).constellation,null);
 const cast=summon(field);
 assert.equal(cast.playerHP,72);
 assert.equal(cast.constellation?.armor,30);
 assert.equal(cast.damageBonus,1.5);
 assert.ok(Math.abs(cast.pushBonus-1.35)<1e-9);
 assert.equal(cast.lotusReady,true);
 assert.equal(cast.casts,1);
 assert.equal(cast.projectile,null);
 assert.match(spellCastBlockReason(cast,'constellation')!,/already been used/);
 assert.strictEqual(summon(cast,100),cast);
 const ongoing=advance(cast,15);
 assert.equal(ongoing.constellation?.armor,30);
 assert.equal(ongoing.damageBonus,1.5);
});

test('armor absorbs contact first, damage spills into health, and buffs survive empty armor',()=>{
 const field=newBattle('active');field.approachAt=0;field.playerHP=70;
 const cast=summon(field,45);
 Object.assign(cast.enemies[0],{x:CONTACT_X,attackAt:0,clock:1});
 const hit=stepBattle(cast,.01);
 assert.equal(hit.playerHP,63);
 assert.equal(hit.constellation?.armor,0);
 assert.equal(hit.damageBonus,1.08);
 assert.strictEqual(summon(hit),hit);
 const guard=summon(field);
 Object.assign(guard.enemies[0],{x:CONTACT_X,attackAt:0,clock:1});
 const shielded=stepBattle(guard,.01);
 assert.equal(shielded.playerHP,70);
 assert.equal(shielded.constellation?.armor,18);
 const baseEnemy={element:'Neutral' as const};
 assert.equal(spellDamage(baseEnemy,80,'constellation'),0);
 assert.equal(spellKnockback(80,'constellation'),0);
 Object.assign(shielded.enemies[0],{element:'Neutral'});
 const spell=hitWithSpell(shielded,80,'water');
 assert.equal(shielded.enemies[0].hp-spell.enemies[0].hp,spellDamage(baseEnemy,80,'water',1.3,.0,shielded.time));
});

test('a Constellation bottle reserves the cast and a spent cast blocks subsequent bottles',()=>{
 const field=newBattle('active');field.upgrades.constellation=1;
 field.potions.spellBottle=2;
 field.bottledSpells=[{spellId:'constellation',quality:80},{spellId:'constellation',quality:100}];
 const flight=drinkPotion(field,'spellBottle');
 assert.equal(flight.constellation,null);
 assert.match(spellCastBlockReason(flight,'constellation')!,/already being cast/);
 assert.strictEqual(summon(flight),flight);
 assert.strictEqual(drinkPotion(flight,'spellBottle'),flight);
 const cast=advance(flight,.66);
 assert.equal(cast.casts,1);
 assert.equal(cast.constellation?.armor,35);
 assert.equal(cast.damageBonus,1.35);
 assert.equal(cast.pushBonus,1.23);
 assert.strictEqual(drinkPotion(cast,'spellBottle'),cast);
 assert.equal(cast.potions.spellBottle,1);
 assert.equal(newBattle('active').constellation,null);
});
