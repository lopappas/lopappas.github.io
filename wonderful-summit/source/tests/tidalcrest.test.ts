import {test} from 'node:test';
import assert from 'node:assert/strict';
import {SPELLS,SPELL_VARIATIONS,PLAYER_SPELLS,recognize,power,knockback,type SpellId} from '../src/magic.ts';
import {newBattle,launchSpell,stepBattle,spellDamage,spellKnockback,drinkPotion,tidalWavePosition,TIDAL_TRAVEL_SECONDS,ENEMY_BACK_X,CONTACT_X,type Battle} from '../src/battle.ts';
import {woodenShield} from '../src/shields.ts';
import {newRun,enterNode,finishBattle,battleForRun,camp} from '../src/run.ts';
import {spellName,spellUpgradePreview,spellbookColumns} from '../src/spellbook.ts';
import {parseDeveloperCommand} from '../src/developerCommands.ts';
function advance(b:Battle,seconds:number,dt=.01){for(let i=0;i<Math.round(seconds/dt);i++)b=stepBattle(b,dt);return b;}
function setup():Battle{const b=newBattle('active','shieldPack',()=>0);b.approachAt=1000;b.enemies=b.enemies.map((e,i)=>({...e,rocky:false,shield:null,spawnAt:0,element:'Neutral',hp:1000,maxHP:1000,x:360+i*120}));return b;}
test('Aquaspout uses the approved droplet and caret; Tidalcrest inherits the old fin, each uniquely recognizable',()=>{
 const spout=SPELLS.find(s=>s.id==='wave')!,tide=SPELLS.find(s=>s.id==='tidalcrest')!;
 assert.equal(spout.name,'Aquaspout');assert.equal(spout.path,'M36 18 L50 6 L64 18 M50 32 C53.04 43.4 74.32 63.16 72.8 74.56 C71.28 97.36 28.72 97.36 27.2 74.56 C25.68 63.16 46.96 43.4 50 32 Z');
 assert.equal(tide.path,'M15 85 C15 47 50 15 85 12 C61 36 61 60 88 85 L15 85 Z');
 for(const spell of [spout,tide])for(const scale of [.15,1,7]){
  const strokes=[...spell.strokes].reverse().map(st=>[...st].reverse().map(p=>({x:31+p.x*scale,y:52+p.y*scale})));const match=recognize(strokes);
  assert.equal(match.spell,spell);assert.equal(match.quality,100);
 }
 assert.equal(recognize(tide.strokes,['water','wave']).spell,null);
 assert.equal(recognize(spout.strokes,['water','tidalcrest']).spell,null);
 assert.notEqual(recognize([spout.strokes[1]],['wave']).spell?.id,'wave');
});
test('the narrower fin scores perfectly as Tidalcrest without changing its book art or creating a second ambiguity candidate',()=>{
 const spell=SPELLS.find(s=>s.id==='tidalcrest')!,narrow=spell.strokes.map(st=>st.map(p=>({x:50+(p.x-50)*.8,y:p.y})));
 assert.deepEqual(SPELL_VARIATIONS.tidalcrest,[narrow]);
 assert.equal(spell.path,'M15 85 C15 47 50 15 85 12 C61 36 61 60 88 85 L15 85 Z');
 for(const shape of [spell.strokes,narrow])for(const scale of [.15,1,6]){
  const moved=[...shape].reverse().map(st=>[...st].reverse().map(p=>({x:120+p.x*scale,y:-40+p.y*scale}))),result=recognize(moved);
  assert.equal(result.spell,spell);assert.equal(result.quality,100);assert.equal(result.candidates.filter(c=>c.spell.id==='tidalcrest').length,1);
  assert.equal(recognize(moved,['tidalcrest']).spell,spell);assert.equal(recognize(moved,['water','wave']).spell,null);
 }
});
test('Tidalcrest uses quality-scaled ×1.1 damage and ×1.5 knockback at every grade; Aquaspout keeps its old balance',()=>{
 let last=0;
 for(let q=48;q<=100;q++){
  assert.equal(spellDamage({element:'Neutral'},q,'tidalcrest'),Math.round(power(q)*1.1));
  assert.equal(spellDamage({element:'Neutral'},q,'wave'),Math.round(power(q)*.9));
  assert.equal(spellKnockback(q,'tidalcrest'),knockback(q)*1.5);assert.ok(spellKnockback(q,'tidalcrest')>=last);last=spellKnockback(q,'tidalcrest');
  if(q>=60)assert.equal(spellKnockback(q,'wave'),knockback(q)*1.7);
 }
 assert.equal(spellKnockback(48,'wave'),40);assert.equal(spellKnockback(59,'wave'),54);
});
test('the moving wave hits front then rear enemies exactly once, including after knockback carries them ahead of it',()=>{
 let b=launchSpell(setup(),70,'#69c2d6','tidalcrest');const damage=spellDamage({element:'Neutral'},70,'tidalcrest');
 assert.equal(b.projectile,null);assert.equal(b.casts,1);assert.equal(b.tidalWaves.length,1);assert.equal(tidalWavePosition(b.tidalWaves[0],0),300);
 b=advance(b,.15);assert.deepEqual(b.enemies.map(e=>e.hp),[1000,1000,1000]);
 b=advance(b,.02);assert.deepEqual(b.enemies.map(e=>e.hp),[1000-damage,1000,1000]);
 assert.ok(b.enemies[0].push);assert.deepEqual(b.tidalWaves[0].hitIds,[1]);
 b=advance(b,.33);assert.deepEqual(b.enemies.map(e=>e.hp),[1000-damage,1000-damage,1000]);
 b=advance(b,.4);assert.deepEqual(b.enemies.map(e=>e.hp),[1000-damage,1000-damage,1000-damage]);assert.equal(b.tidalWaves.length,0);assert.equal(b.casts,1);
 b=advance(b,1);assert.ok(b.enemies.every(e=>e.hp===1000-damage));
});
test('a wave reaches the exact runway end, never hits outside it, and cannot linger for future reinforcements',()=>{
 let b=setup();b.enemies[0].x=ENEMY_BACK_X;b.enemies[1].x=ENEMY_BACK_X+1;b.enemies[2].spawnAt=1;b=launchSpell(b,60,'#fff','tidalcrest');
 b=advance(b,.89);assert.ok(b.enemies.every(e=>e.hp===1000));b=advance(b,.01);assert.equal(b.enemies[0].hp,1000-spellDamage({element:'Neutral'},60,'tidalcrest'));assert.equal(b.enemies[1].hp,1000);assert.equal(b.enemies[2].hp,1000);assert.equal(b.tidalWaves.length,0);
 b=advance(b,.5);assert.equal(b.enemies[2].hp,1000);
});
test('arrivals are eligible only if actually on the runway before the front reaches their position',()=>{
 let b=setup();b.enemies[0]={...b.enemies[0],x:400,spawnAt:.5};b.enemies[1]={...b.enemies[1],x:600,spawnAt:.5};b.enemies[2].spawnAt=2;
 b=advance(launchSpell(b,60,'#fff','tidalcrest'),.9);
 assert.equal(b.enemies[0].hp,1000);assert.equal(b.enemies[1].hp,1000-spellDamage({element:'Neutral'},60,'tidalcrest'));assert.equal(b.enemies[2].hp,1000);
 // Spawning inside a coarse frame behind its front must not create a false crossing.
 b=setup();b.enemies[0]={...b.enemies[0],x:410,spawnAt:.35};b.enemies[1].spawnAt=2;b.enemies[2].spawnAt=2;b=advance(launchSpell(b,60,'#fff','tidalcrest'),.9,.1);assert.equal(b.enemies[0].hp,1000);
});
test('elemental, rocky, wooden-shield and Mother defenses apply independently to every wave impact',()=>{
 for(const q of [48,60,70,100])for(const element of ['Fire','Water','Nature','Neutral'] as const)for(const rocky of [false,true])for(const shielded of [false,true]){
  let b=setup();b.enemies=b.enemies.slice(0,1);b.enemies[0]={...b.enemies[0],x:360,element,rocky,shield:shielded?woodenShield():null};const e=b.enemies[0];
  b=advance(launchSpell(b,q,'#fff','tidalcrest'),.17);
  assert.equal(b.enemies[0].hp,1000-spellDamage(e,q,'tidalcrest'));
  const expected=spellKnockback(q,'tidalcrest',1,element,rocky,e.shield);
  if(q<60&&rocky)assert.equal(b.enemies[0].push,null);else assert.ok(Math.abs(b.enemies[0].push!.to-e.x-expected)<1e-8);
  assert.equal(b.enemies[0].shield?.burnUntil??null,null);
 }
 let b=newBattle('active','mother',()=>0);b.approachAt=1000;b.enemies[0].x=CONTACT_X;b=advance(launchSpell(b,60,'#fff','tidalcrest'),.07);assert.ok(Math.abs(b.enemies[0].push!.to-CONTACT_X-spellKnockback(60,'tidalcrest',1,'Fire')*.8)<1e-8);
});
test('Fury, Lotus, Colorful Rock, Moon Amulet, upgrades and Midnight are snapshotted for the entire wave',()=>{
 let b=setup();b.damageBonus=1.15;b.pushBonus=1.15;b.upgrades.tidalcrest=1;b.midnightStone=true;b.amulets.moon=true;b.lotus=true;b.lotusReady=true;b.colorful=true;b.lastElement='Fire';b.furyReady=true;
 const enemies=structuredClone(b.enemies),multiplier=2*1.3*1.15;
 b=launchSpell(b,60,'#fff','tidalcrest',50);assert.equal(b.furyReady,false);assert.equal(b.lotusReady,false);assert.equal(b.lastElement,'Water');assert.equal(b.tidalWaves[0].damageMultiplier,multiplier);
 b.damageBonus=1;b.pushBonus=1;b.upgrades={};b.midnightStone=false;b.amulets.moon=false;
 b=advance(b,.9);
 for(let i=0;i<3;i++)assert.equal(b.enemies[i].hp,enemies[i].hp-Math.round(spellDamage(enemies[i],60,'tidalcrest',1.15*1.15,1)*multiplier*1.15));
 assert.equal(b.casts,1);
});
test('a bottled Tidalcrest starts from the player on impact and preserves Fury for the next drawn cast',()=>{
 let b=setup();b.furyReady=true;b.potions.spellBottle=1;b.bottledSpells=[{spellId:'tidalcrest',quality:60,inkUsed:50}];b.midnightStone=true;
 b=advance(drinkPotion(b,'spellBottle'),.66);assert.equal(b.furyReady,true);assert.equal(b.tidalWaves.length,1);assert.equal(b.tidalWaves[0].damageMultiplier,1);assert.ok(b.enemies.every(e=>e.hp===1000));
 b=advance(b,.9);for(const e of b.enemies)assert.equal(e.hp,1000-Math.round(spellDamage({element:'Neutral'},60,'tidalcrest')*1.15));assert.equal(b.casts,1);
 b=launchSpell(b,60,'#fff','water');assert.equal(b.furyReady,false);assert.equal(b.projectile?.damageMultiplier,2);
});
test('waves can overlap and run alongside an orb without cancelling either or duplicating a cast',()=>{
 let b=setup();b=launchSpell(b,48,'#fff','tidalcrest');b=advance(b,.1);b=launchSpell(b,60,'#fff','tidalcrest');assert.equal(b.tidalWaves.length,2);assert.notEqual(b.tidalWaves[0].id,b.tidalWaves[1].id);
 b=launchSpell(b,48,'#fff','water');assert.ok(b.projectile);b=advance(b,1);
 assert.equal(b.tidalWaves.length,0);assert.equal(b.projectile,null);assert.equal(b.casts,3);
 const waveDamage=spellDamage({element:'Neutral'},48,'tidalcrest')+spellDamage({element:'Neutral'},60,'tidalcrest');assert.equal(b.enemies[2].hp,1000-waveDamage);
});
test('wave kills resolve ordinary victory and the Mother split normally; defeat cancels travelling waves',()=>{
 let b=setup();b.enemies=b.enemies.slice(0,1);b.enemies[0].hp=1;b=advance(launchSpell(b,70,'#fff','tidalcrest'),.2);assert.equal(b.phase,'victory');assert.equal(b.tidalWaves.length,0);
 b=newBattle('active','mother',()=>0);b.approachAt=1000;b.enemies[0]={...b.enemies[0],x:360,hp:1};b=advance(launchSpell(b,70,'#fff','tidalcrest'),.2);assert.equal(b.phase,'active');assert.ok(b.motherSplit);
 b=advance(b,2);assert.equal(b.enemies.length,4);assert.ok(b.enemies.slice(1).every(e=>e.hp===100));
 b=setup();b.approachAt=0;b.playerHP=1;b.enemies[0]={...b.enemies[0],x:CONTACT_X,attackAt:0};b=stepBattle(launchSpell(b,48,'#fff','tidalcrest'),.01);assert.equal(b.phase,'defeat');assert.equal(b.tidalWaves.length,0);
});
test('swept collisions work at different frame rates, hit moving foes, preserve input states and expire even on an empty field',()=>{
 let b=setup();b.approachAt=0;b=launchSpell(b,60,'#fff','tidalcrest');const snapshot=structuredClone(b),fine=advance(b,.9,.01),coarse=advance(b,.9,.1);
 assert.deepEqual(b,snapshot);assert.deepEqual(fine.enemies.map(e=>e.hp),coarse.enemies.map(e=>e.hp));assert.ok(fine.enemies.every(e=>e.hp<1000));assert.equal(fine.tidalWaves.length,0);assert.equal(coarse.tidalWaves.length,0);
 b=setup();b.enemies.forEach(e=>e.spawnAt=2);b=advance(launchSpell(b,60,'#fff','tidalcrest'),1);assert.equal(b.tidalWaves.length,0);assert.ok(b.enemies.every(e=>e.hp===1000));
 for(const q of [0,47,NaN])assert.equal(launchSpell(setup(),q,'#fff','tidalcrest').tidalWaves.length,0);
});
test('both spells appear naturally, remain separate in the book, are developer-grantable, and upgrade exactly once',()=>{
 const columns=spellbookColumns(['tidalcrest','water','wave']);assert.deepEqual(columns[0].spells.map(s=>s.id),['water','wave','tidalcrest']);
 for(const id of ['wave','tidalcrest'] as SpellId[]){
  const spells=PLAYER_SPELLS.filter(s=>s.id!==id).map(s=>s.id),run={...newRun(),spells};
  assert.deepEqual(parseDeveloperCommand({type:'spell',id}),{type:'spell',id});
  assert.ok(enterNode({...run,screen:'map',node:2},()=>0).stock.some(s=>s.kind==='spell'&&s.item===id));
  assert.deepEqual(finishBattle({...run,screen:'battle',combats:2},{...battleForRun(run),phase:'victory'},()=>0).reward?.offers,[id]);
  const upgraded=camp({...run,spells:[...spells,id],screen:'camp'},id);assert.equal(upgraded.upgrades[id],1);assert.equal(camp({...upgraded,campUsed:false},id).campUsed,false);assert.equal(spellUpgradePreview(id,1),null);
  const preview=spellUpgradePreview(id)!;assert.equal(preview.currentDamage,spellDamage({element:'Neutral'},60,id));assert.equal(preview.nextDamage,spellDamage({element:'Neutral'},60,id,1,1));assert.equal(spellName(id,1),SPELLS.find(s=>s.id===id)!.name+'+');
 }
});
