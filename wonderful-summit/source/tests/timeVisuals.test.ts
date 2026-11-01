import {test} from 'node:test';
import assert from 'node:assert/strict';
import {newBattle,hitWithSpell,chronosEffect,spellDamage} from '../src/battle.ts';
import {chronosAffected,chronosVisuals,enemyStatusLabel} from '../src/timeVisuals.ts';
import {newRun,camp} from '../src/run.ts';
import {PLAYER_SPELLS,SPELLS} from '../src/magic.ts';
import {spellName,spellUpgradePreview} from '../src/spellbook.ts';
test('weak Chronos keeps its small pulse and freezes the environment for its duration',()=>{
 for(const q of [48,59,60,69]){
  const b=hitWithSpell(newBattle('active','pack'),q,'chronos');
  assert.equal(chronosVisuals(b).environment,true);assert.equal(chronosVisuals(b).pulse?.strong,false);
  for(const e of b.enemies){assert.equal(chronosAffected(e,b.time),true);assert.equal(enemyStatusLabel(e,b),null);assert.equal(chronosAffected(e,chronosEffect(q).duration),false);}
  b.time=.29;assert.equal(chronosVisuals(b).pulse,null);
 }
 const rock=hitWithSpell(newBattle('active','rock'),59,'chronos');assert.equal(chronosAffected(rock.enemies[0],0),true);
});
test('strong Chronos flashes large and grayscales the environment while any present enemy is stunned',()=>{
 for(const q of [70,79,80,100]){
  const b=hitWithSpell(newBattle('active','pack'),q,'chronos');const v=chronosVisuals(b);
  assert.equal(v.environment,true);assert.equal(v.pulse?.strong,true);assert.equal(enemyStatusLabel(b.enemies[0],b),null);
  const before=structuredClone(b);chronosVisuals(b);assert.deepEqual(b,before);
  b.time=.46;assert.equal(chronosVisuals(b).pulse,null);assert.equal(chronosVisuals(b).environment,true);
  b.time=chronosEffect(q).duration;assert.equal(chronosVisuals(b).environment,false);assert.equal(chronosAffected(b.enemies[0],b.time),false);
 }
});
test('Chronos visuals do not suppress unrelated burn/freeze cues, and leaf Slow returns after Chronos ends',()=>{
 let b=newBattle('active');b.enemies[0].slowUntil=20;b=hitWithSpell(b,48,'chronos');
 assert.equal(enemyStatusLabel(b.enemies[0],b),null);b.time=1.01;assert.equal(enemyStatusLabel(b.enemies[0],b),'Slow');
 b.enemies[0].burn={damage:2,nextTick:3,ticks:3};assert.equal(enemyStatusLabel(b.enemies[0],b),'Burn');
 b.freezeUntil=4;assert.equal(enemyStatusLabel(b.enemies[0],b),'❄');
});
test('every natural spell can be upgraded once; legacy second levels cannot increase effects or add a second plus',()=>{
 for(const spell of PLAYER_SPELLS){
  const run={...newRun(),screen:'camp' as const,spells:SPELLS.map(s=>s.id)},first=camp(run,spell.id),secondCamp={...first,campUsed:false};
  assert.equal(first.upgrades[spell.id],1);assert.equal(camp(secondCamp,spell.id),secondCamp);assert.equal(spellUpgradePreview(spell.id,1),null);assert.equal(spellName(spell.id,2),spell.name+'+');
  assert.equal(spellDamage({element:'Neutral'},80,spell.id,1,2),spellDamage({element:'Neutral'},80,spell.id,1,1));
 }
});
