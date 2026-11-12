import test from 'node:test';
import assert from 'node:assert/strict';
import {RELICS,newRun,battleForRun,enterNode,finishBattle,type RelicId} from '../src/run.ts';
import {newBattle,hitWithSpell,launchSpell,stepBattle,spellSlow,brambleEffect} from '../src/battle.ts';
import {applyDeveloperCommand} from '../src/developerCommands.ts';
import {ENCYCLOPEDIA_ENTRIES} from '../src/encyclopedia.ts';
function field(snaily=true){const b=newBattle('active');b.snaily=snaily;b.approachAt=0;b.enemies[0]={...b.enemies[0],element:'Neutral',hp:10000,maxHP:10000,x:600};return b;}
function near(a:number,b:number){assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);}
test('Snaily is an uncommon collectible available to shops, rewards, developer grants and encyclopedia',()=>{
 assert.equal(RELICS.snaily.rarity,'Uncommon');assert.equal(RELICS.snaily.description,'Increases the slowing effects of spells');
 assert.ok(ENCYCLOPEDIA_ENTRIES.some(e=>e.id==='snaily'&&e.chapter==='relics'));
 const granted=applyDeveloperCommand(newRun(),{type:'relic',id:'snaily'});assert.ok(granted.relics.includes('snaily'));assert.equal(battleForRun(granted).snaily,true);assert.equal(battleForRun(newRun()).snaily,false);
 const r={...newRun(),screen:'map' as const,node:2,relics:(Object.keys(RELICS) as RelicId[]).filter(id=>id!=='snaily')};
 assert.ok(enterNode(r,()=>0).stock.some(s=>s.item==='snaily'));
 assert.equal(finishBattle({...r,screen:'battle',node:3},{...newBattle('active'),phase:'victory'},()=>0).reward?.relic,'snaily');
});
test('Bramble Leaf gains five points at every quality and upgrade, without extending its duration',()=>{
 for(const q of [48,60,70,80,100])for(const upgrade of [0,1]){
  const b=field();b.upgrades.leaf=upgrade;const hit=hitWithSpell(b,q,'leaf');const e=hit.enemies[0];
  near(spellSlow(hit,e,hit.time),brambleEffect(q,upgrade).amount+.05);
  near(e.leafSlows[0].until,brambleEffect(q,upgrade).duration);
  near(spellSlow({...hit,snaily:false},e,hit.time),brambleEffect(q,upgrade).amount);
  assert.equal(spellSlow(hit,e,e.leafSlows[0].until),0);
  e.push=null;const moved=stepBattle(hit,.1);near(e.x-moved.enemies[0].x,18*(1-spellSlow(hit,e,0))*.1);
 }
});
test('Bog gains five points, overlaps use the strongest slow once, and movement never reverses',()=>{
 let b=launchSpell(field(),60,'#fff','bog');b.time=2;const e=b.enemies[0];near(spellSlow(b,e,2),.45);
 b=hitWithSpell(b,100,'leaf');near(spellSlow(b,b.enemies[0],2),.8);
 const capped={...b.enemies[0],leafSlows:[{amount:.99,until:20}],push:null};b={...b,enemies:[capped]};assert.equal(spellSlow(b,capped,2),1);assert.equal(stepBattle(b,.1).enemies[0].x,capped.x);
});
test('Snaily creates no slow on ordinary spells, fizzles or immune targets and preserves king resistance',()=>{
 const b=field();assert.equal(spellSlow(b,b.enemies[0],0),0);
 for(const spell of ['fire','water','nature','leaf'] as const){const hit=hitWithSpell(b,spell==='leaf'?47:80,spell);assert.equal(spellSlow(hit,hit.enemies[0],0),0);}
 for(const [element,rocky] of [['Nature',false],['Neutral',true]] as const){
  const target={...b.enemies[0],element,rocky};const hit=hitWithSpell({...b,enemies:[target]},48,'leaf');assert.equal(spellSlow(hit,hit.enemies[0],0),0);
  const bog=launchSpell({...b,enemies:[target]},48,'#fff','bog');assert.equal(spellSlow(bog,target,2),0);
 }
 const king={...b.enemies[0],goblinKing:true,hp:1000,maxHP:1000,leafSlows:[{amount:.5,until:20}]};near(spellSlow(b,king,0),.35);near(spellSlow(b,{...king,kingEnragedAt:0},0),.55);
});
test('Snaily leaves freeze and root durations unchanged',()=>{
 for(const snaily of [false,true]){
  const chronos=hitWithSpell(field(snaily),80,'chronos');const normal=hitWithSpell(field(false),80,'chronos');assert.equal(chronos.enemies[0].stunUntil,normal.enemies[0].stunUntil);
  const b=field(snaily);b.amulets.twilight=true;const rooted=hitWithSpell(b,80,'nature',undefined,()=>0);assert.equal(rooted.enemies[0].rootUntil,1.5);
 }
});
