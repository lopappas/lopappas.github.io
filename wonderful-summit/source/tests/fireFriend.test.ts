import test from 'node:test';
import assert from 'node:assert/strict';
import {RELICS,newRun,battleForRun,enterNode,finishBattle,acquireRelic,type RelicId} from '../src/run.ts';
import {newBattle,hitWithSpell,stepBattle,drinkPotion} from '../src/battle.ts';
import {applyDeveloperCommand} from '../src/developerCommands.ts';
import {ENCYCLOPEDIA_ENTRIES} from '../src/encyclopedia.ts';
import {woodenShield} from '../src/shields.ts';
function field(fireFriend=true){const b=newBattle('active');b.fireFriend=fireFriend;b.approachAt=1000;b.enemies[0]={...b.enemies[0],element:'Neutral',hp:10000,maxHP:10000,x:500};return b;}
function advance(b:ReturnType<typeof field>,seconds:number){for(let i=0;i<Math.round(seconds*100);i++)b=stepBattle(b,.01);return b;}
function near(a:number,b:number){assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);}
test('Fire Friend enters uncommon relic systems, grants once and equips in combat',()=>{
 assert.equal(RELICS.fireFriend.rarity,'Uncommon');assert.equal(RELICS.fireFriend.description,'Increase burn damage by 50%.');
 assert.ok(ENCYCLOPEDIA_ENTRIES.some(e=>e.id==='fireFriend'&&e.chapter==='relics'));
 const r=applyDeveloperCommand(newRun(),{type:'relic',id:'fireFriend'});assert.ok(r.relics.includes('fireFriend'));assert.equal(acquireRelic(r,'fireFriend').relics.filter(id=>id==='fireFriend').length,1);
 assert.equal(battleForRun(r).fireFriend,true);assert.equal(battleForRun(newRun()).fireFriend,false);
 const pool={...newRun(),screen:'map' as const,node:2,relics:(Object.keys(RELICS) as RelicId[]).filter(id=>id!=='fireFriend')};
 assert.ok(enterNode(pool,()=>0).stock.some(s=>s.item==='fireFriend'));
 assert.equal(finishBattle({...pool,screen:'battle',node:3},{...newBattle('active'),phase:'victory'},()=>0).reward?.relic,'fireFriend');
});
test('Flare Bolt and Sun-Amulet Hearthspark burn get fifty percent more damage before rounding',()=>{
 for(const spell of ['bolt','fire'] as const)for(const quality of [48,59,60,70,80,100])for(const element of ['Neutral','Water','Nature','Fire'] as const){
  const b=field();b.amulets.sun=true;b.upgrades[spell]=1;b.enemies[0].element=element;
  const base=hitWithSpell({...b,fireFriend:false},quality,spell),boost=hitWithSpell(b,quality,spell);
  assert.equal(boost.enemies[0].hp,base.enemies[0].hp);assert.deepEqual(boost.enemies[0].push,base.enemies[0].push);
  if(!base.enemies[0].burn){assert.equal(boost.enemies[0].burn,null);continue;}
  near(boost.enemies[0].burn!.damage,base.enemies[0].burn!.damage*1.5);
  assert.equal(boost.enemies[0].burn!.ticks,3);assert.equal(boost.enemies[0].burn!.nextTick,1);
  const after=advance(boost,3.01);assert.equal(boost.enemies[0].hp-after.enemies[0].hp,Math.round(base.enemies[0].burn!.damage*3*1.5));assert.equal(after.enemies[0].burn,null);
 }
});
test('Wonderful neutral Flare Bolt deals 72 burn damage instead of 48',()=>{
 const b=hitWithSpell(field(),100,'bolt');assert.equal(b.enemies[0].burn!.damage,24);assert.equal(b.enemies[0].hp-advance(b,3.01).enemies[0].hp,72);
});
test('burn refreshes retain the strongest burn without repeatedly multiplying Fire Friend',()=>{
 let b=hitWithSpell(field(),100,'bolt');b=advance(b,.5);b=hitWithSpell(b,100,'bolt');assert.equal(b.enemies[0].burn!.damage,24);
 b=hitWithSpell(b,48,'bolt');assert.equal(b.enemies[0].burn!.damage,24);assert.equal(b.enemies[0].burn!.ticks,3);
 near(b.enemies[0].burn!.nextTick,1.5);
});
test('Fire Friend adds no new burns or shield damage and preserves rocky immunity and Black Flash behavior',()=>{
 for(const spell of ['fire','nature','water','wave','leaf','firestorm'] as const){const b=hitWithSpell(field(),80,spell);assert.equal(b.enemies[0].burn,null);}
 const rocky=field();rocky.enemies[0].rocky=true;assert.equal(hitWithSpell(rocky,48,'bolt').enemies[0].burn,null);
 const shielded=field();shielded.enemies[0].shield=woodenShield();const hit=hitWithSpell(shielded,80,'fire');assert.equal(hit.enemies[0].burn,null);assert.equal(hit.enemies[0].shield?.burnUntil,2);assert.equal(advance(hit,2.01).enemies[0].shield,null);
 const b=field();b.blackFlash.enabled=true;assert.deepEqual(hitWithSpell(b,80,'bolt',1,()=>0).enemies[0].burn,hitWithSpell(b,80,'bolt',1,()=>.99).enemies[0].burn);
});
test('Fire Friend boosts bottled burns and continues ticking during freeze',()=>{
 const b=field();b.potions.spellBottle=1;b.bottledSpells=[{spellId:'bolt',quality:100}];
 let cast=advance(drinkPotion(b,'spellBottle'),.7);cast.freezeUntil=20;
 const hp=cast.enemies[0].hp;cast=advance(cast,3.01);assert.equal(hp-cast.enemies[0].hp,72);
});
