import test from 'node:test';
import assert from 'node:assert/strict';
import {SPELLS,PLAYER_SPELLS,recognize} from '../src/magic.ts';
import {newBattle,launchSpell,stepBattle,spellDamage,spellKnockback,CONTACT_X,ENEMY_BACK_X,drinkPotion,type Battle} from '../src/battle.ts';
import {woodenShield} from '../src/shields.ts';
import {torrentDuration,torrentContains,TORRENT_INTERVAL,TORRENT_HALF_WIDTH} from '../src/torrent.ts';
import {practiceLesson} from '../src/practiceLessons.ts';
import {parseDeveloperCommand} from '../src/developerCommands.ts';
import {newRun,rollSpellOffers,camp} from '../src/run.ts';
import {spellUpgradePreview} from '../src/spellbook.ts';
import {COMBAT_LANE_Y,FILA_FOOT_Y} from '../src/combatLanes.ts';
function setup(encounter:Battle['encounter']='slime'){
 const b=newBattle('active',encounter,()=>0);b.approachAt=1000;
 b.enemies=b.enemies.map(e=>({...e,element:'Neutral',initialElement:'Neutral',hp:10000,maxHP:10000}));return b;
}
function advance(b:Battle,seconds:number,frame=.05){const end=b.time+seconds;while(b.phase==='active'&&b.time<end-1e-9)b=stepBattle(b,Math.min(frame,end-b.time));return b;}
function cast(b=setup(),q=60,r=()=>.5){return launchSpell(b,q,'#69c2d6','torrent',0,r);}
test('approved two-arc Torrent glyph recognizes with all spells known and practice uses the same arcs',()=>{
 const s=SPELLS.find(s=>s.id==='torrent')!;assert.equal(s.rarity,'Uncommon');assert.equal(s.element,'Water');assert.equal(s.strokes.length,2);
 const found=recognize(s.strokes);assert.equal(found.spell?.id,'torrent');assert.equal(found.quality,100);
 const lesson=practiceLesson('torrent')!;assert.equal(lesson.paths.length,1);assert.deepEqual(lesson.paths[0][0],{x:10,y:48});assert.deepEqual(lesson.paths[0].at(-1),{x:90,y:48});assert.equal(recognize(lesson.paths).spell?.id,'torrent');
 assert.ok(Math.min(...s.strokes[0].map(p=>p.y))>35);
 for(const strokes of [s.strokes.toReversed(),s.strokes.map(stroke=>stroke.toReversed()),[s.strokes[0].toReversed(),s.strokes[1]]]){assert.equal(recognize(strokes).spell?.id,'torrent');}
 assert.ok(s.strokes.every(stroke=>stroke[0].x===50&&stroke[0].y===90));
});
test('Steady lasts eight seconds, has nine orbs, and does not launch a targeting projectile',()=>{
 const b=cast();assert.equal(b.torrent?.until,8);assert.equal(b.torrent?.orbs.length,9);assert.equal(b.projectile,null);assert.equal(b.casts,1);assert.equal(b.enemies[0].hp,10000);
 assert.equal(b.torrent!.orbs[0].landsAt,1/1.2);
 assert.ok(Math.abs(b.torrent!.orbs[8].landsAt-b.torrent!.orbs[7].landsAt-1/1.2)<1e-9);
 assert.equal(torrentDuration(69),8);assert.equal(torrentDuration(45),5);assert.equal(torrentDuration(70),11);assert.equal(torrentDuration(80),14);
 for(const q of [0,44,NaN])assert.equal(cast(setup(),q).torrent,null);
});
test('Torrent shuffles ten middle-lane spots without reusing any until the next set',()=>{
 const spacing=(ENEMY_BACK_X-CONTACT_X)/10;
 const positions=Array.from({length:10},(_,i)=>CONTACT_X+(i+.5)*spacing);
 for(const encounter of ['slime','mother','spiderGoblinElite','rockWebNest'] as const){
  const battle=setup(encounter);
  battle.enemies.forEach(enemy=>{enemy.x=CONTACT_X;enemy.spawnAt=5;});
  const natural=cast(battle,80,()=>0).torrent!.orbs.map(orb=>orb.x);
  const shuffled=cast(battle,80,()=>.8).torrent!.orbs;
  assert.deepEqual(natural.slice(0,10),positions);
  assert.notDeepEqual(shuffled.slice(0,10).map(orb=>orb.x),positions);
  assert.deepEqual(shuffled.slice(0,10).map(orb=>orb.x).sort((a,b)=>a-b),positions);
  assert.equal(new Set(shuffled.slice(10).map(orb=>orb.x)).size,6);
  assert.ok(shuffled.every(orb=>orb.y===FILA_FOOT_Y));
  for(const y of COMBAT_LANE_Y){
   assert.ok(torrentContains(shuffled[0],shuffled[0].x+35,y));
   assert.equal(torrentContains(shuffled[0],shuffled[0].x+35.01,y),false);
  }
 }
});
test('one rectangular splash hits all three lanes at a column edge and misses outside or hidden foes',()=>{
 const battle=setup('pack');
 const edge=CONTACT_X+(ENEMY_BACK_X-CONTACT_X)/20+TORRENT_HALF_WIDTH;
 const template=battle.enemies[0];
 battle.enemies=[
  {...template,id:1,lane:0,x:edge},
  {...template,id:2,lane:1,x:edge},
  {...template,id:3,lane:2,x:edge},
  {...template,id:4,lane:2,x:edge+11},
  {...template,id:5,lane:0,x:CONTACT_X,spawnAt:5},
 ];
 const casted=cast(battle,60,()=>0);
 const falling=advance(casted,TORRENT_INTERVAL-.01);
 assert.ok(falling.enemies.every(e=>e.hp===10000));
 const landed=advance(falling,.01);
 const hit=10000-spellDamage({element:'Neutral'},60,'water');
 assert.deepEqual(landed.enemies.map(e=>e.hp),[hit,hit,hit,10000,10000]);
 assert.ok(landed.enemies.slice(0,3).every(e=>e.push));
 assert.deepEqual(advance(landed,.1).enemies.map(e=>e.hp),landed.enemies.map(e=>e.hp));
 assert.equal(torrentContains(casted.torrent!.orbs[0],edge+.01,FILA_FOOT_Y),false);
});
test('orb base damage and knockback stay at Steady Dewdrop while defenses use cast quality',()=>{
 for(const q of [60,69,70,80,100]){assert.equal(spellDamage({element:'Neutral'},q,'torrent'),spellDamage({element:'Neutral'},60,'water'));assert.equal(spellKnockback(q,'torrent'),spellKnockback(60,'water'));}
 assert.equal(spellDamage({element:'Neutral',goblinKing:true,hp:1000,maxHP:1000},45,'torrent'),spellDamage({element:'Neutral'},45,'torrent')*.75);
 assert.equal(spellDamage({element:'Neutral',rocky:true},45,'torrent'),spellDamage({element:'Neutral'},60,'water')*.5);
 assert.equal(spellKnockback(45,'torrent',1,'Neutral',true),0);
 assert.ok(spellDamage({element:'Fire'},60,'torrent')>spellDamage({element:'Water'},60,'torrent'));
});
test('cast snapshots damage bonuses and upgrades, consumes Fury once, and cooldown blocks recast',()=>{
 let b=setup();b.damageBonus=2;b.furyReady=true;b.upgrades.torrent=1;b.enemies[0].x=CONTACT_X;
 b=cast(b,60,()=>0);assert.equal(b.furyReady,false);assert.equal(cast(b),b);b.damageBonus=1;b.upgrades.torrent=0;
 b=advance(b,1);assert.equal(10000-b.enemies[0].hp,spellDamage({element:'Neutral'},60,'water',2,1)*2);
});
test('pause, terminal state, final splash cleanup, and encounter reset preserve lifecycle',()=>{
 const b=cast();assert.equal(stepBattle(b,0),b);const paused={...b,phase:'ready' as const};assert.equal(stepBattle(paused,.1),paused);
 let end=advance(b,8);assert.ok(end.torrent?.orbs.every(o=>o.applied));end=advance(end,.41);assert.equal(end.torrent,null);assert.equal(newBattle().torrent,null);
 let dying=setup();dying.enemies[0].x=CONTACT_X;dying.enemies[0].hp=1;dying=advance(cast(dying,60,()=>0),1);assert.equal(dying.phase,'victory');assert.equal(dying.torrent,null);
});
test('bottles start Torrent on impact and recasting replaces the current rain',()=>{
 let b=setup();b.potions.spellBottle=1;b.bottledSpells=[{spellId:'torrent',quality:60}];b=advance(drinkPotion(b,'spellBottle'),.7);assert.ok(b.torrent);assert.equal(b.torrent?.orbs.length,9);
 b.cooldownsDisabled=true;const old=b.torrent;b=cast(b,80);assert.notEqual(b.torrent,old);assert.equal(b.torrent?.orbs.length,16);assert.equal(b.torrent?.started,b.time);
});
test('Torrent is available in rewards, developer tools, and the usual damage upgrade',()=>{
 assert.ok(PLAYER_SPELLS.some(s=>s.id==='torrent'));assert.deepEqual(parseDeveloperCommand({type:'spell',id:'torrent'}),{type:'spell',id:'torrent'});
 const spells=PLAYER_SPELLS.filter(s=>s.id!=='torrent').map(s=>s.id);assert.deepEqual(rollSpellOffers({...newRun(),spells},()=>0),['torrent']);
 const r=camp({...newRun(),screen:'camp',spells:['torrent']},'torrent');assert.equal(r.upgrades.torrent,1);const preview=spellUpgradePreview('torrent')!;assert.equal(preview.nextDamage,preview.currentDamage*1.25);
});
test('advancement does not mutate prior states and landing damage agrees across frame sizes',()=>{
 const b=cast(setup(),60,()=>0),snapshot=structuredClone(b);b.enemies[0].x=CONTACT_X;snapshot.enemies[0].x=CONTACT_X;
 const fine=advance(b,1,.01),coarse=advance(b,1,.1);assert.deepEqual(b,snapshot);assert.equal(fine.enemies[0].hp,coarse.enemies[0].hp);
});
test('orb defenses match the full elemental matrix, shields, rocky tiers, and crown loss',()=>{
 for(const element of ['Neutral','Fire','Nature','Water'] as const)for(const q of [45,60,70,100])for(const rocky of [false,true]){
  const expected=spellDamage({element},60,'water')*(rocky?(q<60?.5:q<70?.75:1):1);
  assert.ok(Math.abs(spellDamage({element,rocky},q,'torrent')-expected)<1e-8);
 }
 assert.equal(spellDamage({element:'Neutral',shield:woodenShield()},60,'torrent'),spellDamage({element:'Neutral'},60,'water')*.5);
 assert.equal(spellKnockback(60,'torrent',1,'Neutral',false,woodenShield()),spellKnockback(60,'water')*.5);
 const king={element:'Neutral' as const,goblinKing:true,hp:1000,maxHP:1000};assert.equal(spellDamage(king,45,'torrent'),spellDamage({element:'Neutral'},45,'torrent')*.75);assert.ok(spellDamage({...king,kingEnragedAt:0,hp:500},45,'torrent')>0);
});
test('a single Black Flash roll doubles every victim of one splash',t=>{
 t.mock.method(Math,'random',()=>0);
 let b=setup('pack');b.blackFlash.enabled=true;b.enemies=b.enemies.map((e,i)=>({...e,lane:i===0?0:1,x:CONTACT_X}));b=advance(cast(b,60,()=>0),1);
 const base=spellDamage({element:'Neutral'},60,'water');assert.equal(10000-b.enemies[0].hp,base*2);assert.equal(10000-b.enemies[1].hp,base*2);assert.equal(b.blackFlashBurst?.serial,1);assert.equal(b.blackFlash.chain,true);
});
test('Torrent damage triggers the Goblin King dialogue and the Slime Mother split',()=>{
 let b=setup('goblinKing');b.enemies[0]={...b.enemies[0],x:CONTACT_X,hp:501,maxHP:1000};b=advance(cast(b,60,()=>0),TORRENT_INTERVAL);assert.equal(b.enemies[0].kingEnragedAt,b.time);assert.equal(b.enemies[0].x,CONTACT_X);
 b=setup('mother');b.enemies[0]={...b.enemies[0],x:CONTACT_X,hp:1};b=advance(cast(b,60,()=>0),1);assert.ok(b.motherSplit);assert.equal(b.phase,'active');b=advance(b,2.1);assert.equal(b.enemies.length,4);
});
