import test from 'node:test';
import assert from 'node:assert/strict';
import {newBattle,launchSpell,stepBattle,fizzleSpell,drinkPotion,staleMultiplier,spellCooldownRemaining,hitWithSpell,chronosEffect,type Battle} from '../src/battle.ts';
import {newRun,battleForRun} from '../src/run.ts';
function field():Battle{const b=newBattle('active');return {...b,approachAt:1000,enemies:[{...b.enemies[0],element:'Neutral',x:350,hp:100000,maxHP:100000}]};}
function advance(b:Battle,seconds:number){for(let t=0;t<Math.round(seconds*100);t++)b=stepBattle(b,.01);return b;}
function cast(b:Battle,id:'water'|'fire'|'bolt'|'wave'|'tidalcrest'|'bog'|'firestorm'='water'){return launchSpell(b,60,'#fff',id);}
test('first three casts are full power; fourth and later lose exactly 25 percent damage and knockback',()=>{
 let b=field();const powers:number[]=[],pushes:number[]=[];
 for(let i=0;i<5;i++){
  b={...b,enemies:b.enemies.map(e=>({...e,x:350,push:null}))};const hp=b.enemies[0].hp;
  const launched=cast(b);assert.equal(launched.projectile?.knockbackMultiplier,i<3?1:.75);b=advance(launched,.33);
  powers.push(hp-b.enemies[0].hp);pushes.push(b.enemies[0].push!.to-350);
 }
 assert.deepEqual(powers,[powers[0],powers[0],powers[0],Math.round(powers[0]*.75),Math.round(powers[0]*.75)]);
 assert.equal(pushes[2],pushes[0]);assert.equal(pushes[3],pushes[0]*.75);assert.equal(pushes[4],pushes[0]*.75);
});
test('fizzles keep the stale spell streak; a different successful spell clears only that streak; encounters reset it',()=>{
 let b=field();for(let i=0;i<3;i++)b={...cast(b),projectile:null};
 const fizzled=fizzleSpell(b);assert.deepEqual(fizzled.stale,b.stale);assert.equal(staleMultiplier(fizzled,'water'),.75);assert.equal(staleMultiplier(fizzled,'fire'),1);
 b=cast(fizzled,'fire');assert.deepEqual(b.stale,{spellId:'fire',count:1});assert.equal(staleMultiplier(b,'water'),1);
 assert.deepEqual(battleForRun(newRun()).stale,{spellId:null,count:0});
});
test('stale projectiles snapshot their damage and rejected busy casts leave the streak untouched',()=>{
 let b=field();for(let i=0;i<3;i++)b={...cast(b),projectile:null};b=cast(b);
 assert.equal(b.projectile?.damageMultiplier,.75);
 b=cast(b,'bog');assert.equal(b.stale.spellId,'water'); // busy orb: rejected casts never change the streak
 const hp=b.enemies[0].hp;b=advance(b,.33);assert.ok(b.enemies[0].hp<hp);assert.equal(b.stale.count,4);
});
test('stale ground spells keep per-cast damage multipliers and switching spells never restores old ticks',()=>{
 for(const id of ['bog','firestorm'] as const){
  let b=field();for(let i=0;i<4;i++)b=cast(b,id);
  const portions=id==='bog'?b.bog!.portions:b.firestorm!.portions;
  assert.deepEqual(portions.map(p=>p.multiplier),[1,1,1,.75]);
  b=cast(b,'water');assert.equal(staleMultiplier(b,id),1);
  assert.equal((id==='bog'?b.bog!.portions:b.firestorm!.portions).at(-1)?.multiplier,.75);
 }
});
test('stale Tidalcrest snapshots reduced damage and push without applying that penalty to other spells',()=>{
 let b=field();for(let i=0;i<4;i++)b=cast(b,'tidalcrest');
 assert.deepEqual(b.tidalWaves.map(w=>w.damageMultiplier),[1,1,1,.75]);assert.deepEqual(b.tidalWaves.map(w=>w.bonuses.pushBonus),[1,1,1,.75]);
 b=cast(b,'fire');assert.equal(b.projectile?.damageMultiplier,1);assert.equal(b.projectile?.knockbackMultiplier,1);
});
test('burn ticks are reduced for stale Flare Bolt casts',()=>{
 const base=advance(cast(field(),'bolt'),.33).enemies[0].burn!;
 let b=field();for(let i=0;i<3;i++)b={...cast(b,'bolt'),projectile:null};b=advance(cast(b,'bolt'),.33);
 assert.equal(b.enemies[0].burn!.damage,base.damage*.75);
});
test('Chronos starts a 20 second cooldown on launch; blocked attempts preserve the entire battle, bonuses and streak',()=>{
 let b=field();b=launchSpell(b,60,'#fff','chronos');assert.equal(spellCooldownRemaining(b,'chronos'),20);
 b=advance(b,.33);b={...b,stellarReady:true,furyReady:true};const snapshot=structuredClone(b);
 assert.equal(launchSpell(b,80,'#fff','chronos'),b);assert.deepEqual(b,snapshot);
 assert.equal(spellCooldownRemaining({...b,phase:'ready'},'chronos'),spellCooldownRemaining(stepBattle({...b,phase:'ready'},1),'chronos'));
 assert.equal(spellCooldownRemaining(battleForRun(newRun()),'chronos'),0);
 b=advance(b,19.67);assert.ok(spellCooldownRemaining(b,'chronos')<1e-8);
 b={...b,time:20};assert.notEqual(launchSpell(b,80,'#fff','chronos'),b);
});
test('bottled Chronos bypasses cooldowns, preserves the stale streak and does not start or extend cooldowns',()=>{
 for(const cooling of [false,true]){
  let b=field();for(let i=0;i<3;i++)b={...cast(b),projectile:null};b={...b,cooldowns:cooling?{chronos:20}:{},potions:{heal:0,freeze:0,ink:0,spellBottle:1},bottledSpells:[{spellId:'chronos',quality:60}]};
  const streak={...b.stale},cooldowns={...b.cooldowns};b=advance(drinkPotion(b,'spellBottle'),.7);
  assert.deepEqual(b.stale,streak);assert.deepEqual(b.cooldowns,cooldowns);assert.ok(b.enemies[0].stunUntil>b.time);assert.equal(staleMultiplier(b,'water'),.75);
 }
});
test('bottled damage ignores an already stale matching spell and does not change its streak',()=>{
 let b=field();for(let i=0;i<4;i++)b={...cast(b),projectile:null};
 b={...b,potions:{heal:0,freeze:0,ink:0,spellBottle:1},bottledSpells:[{spellId:'water',quality:60}]};
 const hp=b.enemies[0].hp,expected=hitWithSpell(field(),60,'water');b=advance(drinkPotion(b,'spellBottle'),.7);
 assert.equal(hp-b.enemies[0].hp,100000-expected.enemies[0].hp);assert.equal(b.stale.count,4);
});
test('Faint and Steady Chronos fully freeze rocky enemies for the unchanged duration and resume afterwards',()=>{
 for(const quality of [48,59,60,69]){
  let b=field();b.approachAt=0;b.enemies[0].rocky=true;b=hitWithSpell(b,quality,'chronos');const duration=chronosEffect(quality).duration;
  assert.equal(b.enemies[0].stunUntil,duration);b=advance(b,duration-.01);assert.equal(b.enemies[0].x,350);assert.equal(b.enemies[0].clock,0);b=advance(b,.02);assert.ok(b.enemies[0].x<350);
 }
});
test('Slime Mother keeps lethal knockback, moves the split animation with her, then splits at the pushed position',()=>{
 let b=newBattle('active','mother',()=>0);b.enemies[0]={...b.enemies[0],hp:1,x:350};b=hitWithSpell(b,100,'water');const to=b.enemies[0].push!.to;
 assert.equal(b.motherSplit?.x,350);b=advance(b,.1);assert.ok(b.enemies[0].x>350);assert.equal(b.motherSplit?.x,b.enemies[0].x);
 b=advance(b,.3);assert.equal(b.enemies[0].x,to);assert.equal(b.enemies[0].push,null);b=advance(b,1.6);assert.equal(b.motherSplit?.spawned,true);assert.equal(b.motherSplit?.x,to);assert.equal(b.enemies.length,4);
});
