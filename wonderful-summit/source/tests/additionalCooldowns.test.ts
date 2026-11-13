import test from 'node:test';
import assert from 'node:assert/strict';
import {newBattle,launchSpell,drinkPotion,stepBattle,spellCooldownRemaining,SPELL_COOLDOWNS,type Battle} from '../src/battle.ts';
const spells=[['firestorm',10],['bog',15],['tidalcrest',8],['puddleGuard',10],['thistleBush',15],['flameBlade',8]] as const;
function field(){const b=newBattle('active');b.approachAt=1000;b.enemies[0]={...b.enemies[0],element:'Neutral',x:350,hp:1e6,maxHP:1e6};return b;}
function advance(b:Battle,seconds:number){for(let i=0;i<Math.round(seconds*100);i++)b=stepBattle(b,.01);return b;}

test('each new cooldown starts on launch and blocks all changes until its exact expiry',()=>{
 assert.deepEqual(SPELL_COOLDOWNS,{torrent:10,sneakyVine:12,chronos:30,firestorm:10,bog:15,tidalcrest:8,puddleGuard:10,thistleBush:15,flameBlade:8});
 for(const [id,seconds] of spells){
  let b=field();b.time=2;b=launchSpell(b,60,'#fff',id);
  assert.equal(spellCooldownRemaining(b,id),seconds);
  b={...b,stellarReady:true,furyReady:true,time:2+seconds-1e-6};const snapshot=structuredClone(b);
  assert.equal(launchSpell(b,100,'#fff',id),b);assert.deepEqual(b,snapshot);
  b.time=2+seconds;assert.equal(spellCooldownRemaining(b,id),0);
  const next=launchSpell(b,100,'#fff',id);assert.notEqual(next,b);assert.equal(next.casts,b.casts+1);assert.equal(spellCooldownRemaining(next,id),seconds);
 }
});

test('different spell cooldowns run independently and reset every encounter',()=>{
 let b=field();for(const [id] of spells)b=launchSpell(b,60,'#fff',id);
 assert.equal(b.casts,6);
 for(const [id,seconds] of spells)assert.equal(spellCooldownRemaining(b,id),seconds);
 b=advance(b,8);
 for(const [id,seconds] of spells)assert.ok(Math.abs(spellCooldownRemaining(b,id)-Math.max(0,seconds-8))<1e-8);
 const paused={...b,phase:'ready' as const};assert.equal(stepBattle(paused,10),paused);
 for(const [id] of spells)assert.equal(spellCooldownRemaining(field(),id),0);
});

test('bottled spells bypass all six cooldowns without starting or extending them',()=>{
 for(const [id] of spells)for(const cooling of [false,true]){
  let b=field();if(cooling)b=launchSpell(b,60,'#fff',id);
  b.potions.spellBottle=1;b.bottledSpells=[{spellId:id,quality:70}];
  const cooldowns={...b.cooldowns},stale={...b.stale},casts=b.casts;
  b=advance(drinkPotion(b,'spellBottle'),.66);
  assert.deepEqual(b.cooldowns,cooldowns);assert.deepEqual(b.stale,stale);assert.equal(b.casts,casts+1);
 }
});

test('fizzles never start a cooldown on any of the six spells',()=>{
 for(const [id] of spells){const b=launchSpell(field(),47,'#fff',id);assert.equal(b.casts,0);assert.equal(spellCooldownRemaining(b,id),0);}
});

