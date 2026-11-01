import {test} from 'node:test';
import assert from 'node:assert/strict';
import {SPELLS,recognize,power} from '../src/magic.ts';
import {brambleEffect,newBattle,hitWithSpell,spellDamage,spellKnockback,stepBattle,chronosEffect} from '../src/battle.ts';
function advance(b:ReturnType<typeof newBattle>,seconds:number){for(let i=0;i<Math.round(seconds*100);i++)b=stepBattle(b,.01);return b;}
test('Bramble interpolates duration and slowdown at all eight endpoints',()=>{
 for(const [q,duration,amount] of [[48,3,.4],[59,4,.5],[60,4.1,.51],[69,5,.6],[70,5.1,.61],[79,6,.66],[80,6.1,.67],[100,8,.8]])assert.deepEqual(brambleEffect(q),{duration,amount});
 assert.deepEqual(brambleEffect(47),{duration:0,amount:0});
 for(let q=49;q<=100;q++){assert.ok(brambleEffect(q).duration>=brambleEffect(q-1).duration);assert.ok(brambleEffect(q).amount>=brambleEffect(q-1).amount);}
 assert.ok(!SPELLS.find(s=>s.id==='leaf')!.description.includes('seconds'));
});
test('Bramble strength actually changes movement and coexists with Chronos without weakening a stronger slow',()=>{
 for(const q of [48,59,60,69,70,79,80,100]){
  let b=newBattle('active','elite');b.approachAt=0;b.enemies[0].hp=10000;b=hitWithSpell(b,q,'leaf');b.enemies[0].push=null;const x=b.enemies[0].x;b=stepBattle(b,.1);
  assert.ok(Math.abs(x-b.enemies[0].x-22*(1-brambleEffect(q).amount)*.1)<1e-8);
 }
 let b=newBattle('active','elite');b.approachAt=0;b.enemies[0].hp=10000;b=hitWithSpell(b,100,'leaf');b=hitWithSpell(b,48,'leaf');b=hitWithSpell(b,69,'chronos');b.enemies[0].push=null;b=advance(b,5.1);const x=b.enemies[0].x;b=stepBattle(b,.1);assert.ok(Math.abs(x-b.enemies[0].x-22*.2*.1)<1e-8);
 b=advance(b,5);const end=b.enemies[0].x;b=stepBattle(b,.1);assert.ok(Math.abs(end-b.enemies[0].x-22*.1)<1e-8);
});
test('Aquaspout uses its approved droplet-and-caret at all sizes, preserving damage and Faint push endpoints',()=>{
 const fin=SPELLS.find(s=>s.id==='wave')!;assert.equal(fin.name,'Aquaspout');
 for(const scale of [.15,1,5]){const strokes=fin.strokes.map(st=>[...st].reverse().map(p=>({x:p.x*scale+23,y:p.y*scale-42})));assert.equal(recognize(strokes).spell?.id,'wave');assert.ok(recognize(strokes).quality>=98);}
 assert.equal(spellKnockback(48,'wave'),40);assert.equal(spellKnockback(59,'wave'),54);assert.equal(spellKnockback(60,'wave'),58*1.7);
 for(const q of [48,59,60,100]){assert.equal(spellDamage({element:'Neutral'},q,'wave'),Math.round(power(q)*.9));assert.equal(spellDamage({element:'Neutral'},q,'bolt'),Math.round(power(q)*1.3));}
 assert.equal(spellKnockback(59,'wave',1,'Water'),54*.7);assert.equal(spellKnockback(59,'wave',1,'Neutral',true),0);
});
test('Chronos reinforcements receive the remaining freeze duration at every quality, including rocky enemies',()=>{
 for(const q of [48,60,70,100])for(const upgrade of [0,1])for(const rocky of [false,true]){
  let b=newBattle('active','pack');b.approachAt=0;b.upgrades.chronos=upgrade;b.enemies[1].spawnAt=.5;b.enemies[1].rocky=rocky;b=hitWithSpell(b,q,'chronos');const until=chronosEffect(q,upgrade).duration;b=advance(b,.6);
  const e=b.enemies[1];assert.equal(e.stunUntil,until);
  assert.equal(e.x,640);
 }
 let b=newBattle('active','pack');b.enemies[1].spawnAt=2;b=hitWithSpell(b,48,'chronos');b=advance(b,2.1);assert.equal(b.enemies[1].chronosSlowUntil,0);
 b=newBattle('active','pack');b.enemies[1].spawnAt=2;b=hitWithSpell(b,100,'chronos');b=advance(b,.5);b=hitWithSpell(b,70,'chronos');b=advance(b,1.6);assert.equal(b.enemies[1].stunUntil,18);
});
