import test from 'node:test';
import assert from 'node:assert/strict';
import {CONTACT_X,hitWithSpell,launchSpell,newBattle,spellCooldownRemaining,spellKnockback,stepBattle,type Battle} from '../src/battle.ts';
import {PLAYER_SPELLS,recognize} from '../src/magic.ts';
import {practiceLesson} from '../src/practiceLessons.ts';
import {spellUpgradePreview} from '../src/spellbook.ts';

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

test('Scorchy fires at 40 units, waits two seconds, and deals Fire damage without knockback',()=>{
 for(const [element,damage] of [['Nature',24],['Fire',8],['Water',12]] as const){
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
  assert.equal(battle.enemies[0].push,null);
  assert.equal(spellKnockback(80,'scorchy'),0);
  battle=advance(battle,1.71);
  assert.equal(battle.scorchy?.shot,null);
  assert.ok(advance(battle,.01).scorchy?.shot);
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
 assert.equal(struck.snowman?.hp,100);
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
 assert.equal(battle.enemies[0].hp,100-18.92);
 assert.deepEqual(spellUpgradePreview('scorchy')?.guardianHealth,{current:75,next:90});
});
