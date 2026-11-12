import test from 'node:test';
import assert from 'node:assert/strict';
import {GOBLIN_KING_SCALE,kingHasCrown,kingCrownFrame} from '../src/goblinKing.ts';
import {newBattle,hitWithSpell,stepBattle,launchSpell,spellDamage,firestormTickDamage,bogTickDamage,resistedSlow,type Battle} from '../src/battle.ts';
function field(hp=1000){const b=newBattle('active','goblinKing',()=>0);b.approachAt=1000;b.enemies[0].x=350;b.enemies[0].hp=hp;return b;}
function advance(b:Battle,seconds:number){for(let i=0;i<Math.round(seconds*100);i++)b=stepBattle(b,.01);return b;}
test('King is 15 percent larger and changes phase at exactly half health, permanently',()=>{
 assert.ok(Math.abs(GOBLIN_KING_SCALE/1.35-1.15)<1e-9);
 assert.ok(kingHasCrown(field(501).enemies[0]));assert.equal(kingHasCrown(field(500).enemies[0]),false);
 let b=hitWithSpell(field(516.5),60,'water');assert.equal(b.enemies[0].hp,500);assert.equal(b.enemies[0].kingEnragedAt,0);
 assert.equal(kingHasCrown(b.enemies[0]),false);
 b.enemies[0].hp=1000;b=stepBattle(b,.01);assert.equal(kingHasCrown(b.enemies[0]),false);assert.equal(b.enemies[0].kingEnragedAt,0);
});
test('uncrowned King takes Faint damage and full knockback and loses flat slow resistance',()=>{
 let b=stepBattle(field(500),.01);const e=b.enemies[0];
 for(const q of [48,59,60,100]){
  assert.equal(spellDamage(e,q,'water'),spellDamage({element:'Neutral'},q,'water'));
  assert.equal(firestormTickDamage(e,q),firestormTickDamage({element:'Neutral'},q));
  assert.equal(bogTickDamage(e,q),bogTickDamage({element:'Neutral'},q));
 }
 assert.equal(resistedSlow(e,.5),.5);
 const kingHit=hitWithSpell(b,59,'water');const normal=field(500);normal.enemies[0].goblinKing=false;
 const normalHit=hitWithSpell(normal,59,'water');assert.equal(kingHit.enemies[0].push!.to,normalHit.enemies[0].push!.to);
 const burn=advance(hitWithSpell(b,59,'bolt'),2);assert.ok(burn.enemies[0].hp<b.enemies[0].hp-spellDamage(e,59,'bolt'));
});
test('uncrowned movement is fifty percent faster while damage and attack timing remain unchanged',()=>{
 const before=field(501),after=field(500);before.approachAt=after.approachAt=0;before.enemies[0].x=after.enemies[0].x=600;
 const a=advance(before,.5),b=advance(after,.5);
 assert.ok(Math.abs((600-b.enemies[0].x)/(600-a.enemies[0].x)-1.5)<1e-8);
});
test('tick damage triggers the phase and crown falls once in combat time',()=>{
 for(const spell of ['firestorm','bog','thistleBush','bolt'] as const){
  let b=field(501);b.time=10;b=launchSpell(b,100,'#fff',spell);b=advance(b,3);
  const e=b.enemies[0];assert.ok(e.hp<=500,spell);assert.notEqual(e.kingEnragedAt,undefined,spell);
  const start=kingCrownFrame(e,e.kingEnragedAt!);assert.ok(start.visible);assert.equal(start.y,0);
  const middle=kingCrownFrame(e,e.kingEnragedAt!+.4);assert.ok(middle.visible&&middle.y>0&&middle.rotation>0&&middle.opacity<1);
  assert.equal(kingCrownFrame(e,e.kingEnragedAt!+.81).visible,false);
  const at=e.kingEnragedAt;b=advance(b,.5);assert.equal(b.enemies[0].kingEnragedAt,at);
 }
});

test('an existing Faint burn starts damaging the King after he loses his resistance',()=>{
 let b=hitWithSpell(field(501),59,'bolt');b=advance(b,.5);assert.equal(b.enemies[0].hp,501);
 b=hitWithSpell(b,60,'water');const hp=b.enemies[0].hp;assert.ok(hp<500);b=advance(b,.6);assert.ok(b.enemies[0].hp<hp);
});
