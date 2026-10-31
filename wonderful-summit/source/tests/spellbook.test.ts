import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spellbookColumns,spellName,spellUpgradePreview} from '../src/spellbook.ts';
import {SPELLS,PLAYER_SPELLS,type SpellId} from '../src/magic.ts';
import {newRun,camp,battleForRun,type Run} from '../src/run.ts';
import {hitWithSpell} from '../src/battle.ts';

test('spellbook columns keep each element together with its beginner first',()=>{
 const columns=spellbookColumns(['leaf','bolt','wave','nature','fire','water']);
 assert.deepEqual(columns.map(c=>c.element),['Water','Fire','Nature']);
 assert.deepEqual(columns.map(c=>c.spells.map(s=>s.id)),[['water','wave'],['fire','bolt'],['nature','leaf']]);
 for(const c of columns)assert.ok(c.spells.every(s=>s.element===c.element));
});
test('travel and combat books can show only known spells without duplicating entries',()=>{
 const known:SpellId[]=['fire','leaf','fire'];const columns=spellbookColumns(known);
 assert.equal(columns.length,3);assert.deepEqual(columns.map(c=>c.spells.map(s=>s.id)),[[],['fire'],['leaf']]);
 const all=spellbookColumns(SPELLS.map(s=>s.id)).flatMap(c=>c.spells.map(s=>s.id));assert.equal(all.length,SPELLS.length);assert.equal(new Set(all).size,SPELLS.length);
});

test('upgrade previews preserve the campsite choice until confirmation and match actual battle damage',()=>{
 for(const spell of PLAYER_SPELLS.filter(s=>s.id!=='chronos'&&s.id!=='firestorm'&&s.id!=='bog'))for(const level of [0])for(const amber of [false,true]){
  const run:Run={...newRun(),screen:'camp',node:4,health:27,spells:SPELLS.map(s=>s.id),relics:amber?['amber']:[],upgrades:{[spell.id]:level}};
  const before=structuredClone(run),preview=spellUpgradePreview(spell.id,level,amber?1.15:1)!;
  assert.deepEqual(run,before);assert.equal(run.campUsed,false);
  assert.equal(preview.currentName,spell.name+'+'.repeat(level));assert.equal(preview.nextName,spell.name+'+'.repeat(level+1));
  const confirmed=camp(run,spell.id);assert.equal(confirmed.health,27);assert.equal(confirmed.campUsed,true);assert.equal(confirmed.upgrades[spell.id],level+1);
  for(const [state,expected] of [[run,preview.currentDamage],[confirmed,preview.nextDamage]] as const){
   const battle=battleForRun(state,()=>.2);battle.enemies[0].element='Neutral';const hit=hitWithSpell(battle,60,spell.id);
   assert.equal(battle.enemies[0].hp-hit.enemies[0].hp,expected);
  }
  assert.ok(preview.nextDamage>preview.currentDamage);
  assert.strictEqual(camp(confirmed,spell.id),confirmed);assert.strictEqual(camp(confirmed),confirmed);
 }
});

test('rest restores up to 70 health, consumes one campsite action, and keeps spells unchanged',()=>{
 for(const health of [1,45,99,100]){
  const run:Run={...newRun(),screen:'camp',health,upgrades:{fire:1}};
  const rested=camp(run);assert.equal(rested.health,Math.min(100,health+70));assert.equal(rested.campUsed,true);assert.deepEqual(rested.upgrades,run.upgrades);
  assert.strictEqual(camp(rested,'water'),rested);
 }
 const maxed:Run={...newRun(),screen:'camp',upgrades:{fire:2}};
 assert.equal(spellName('fire',1),'Hearthspark+');assert.equal(spellName('fire',2),'Hearthspark+');
 assert.equal(spellUpgradePreview('fire',2),null);assert.strictEqual(camp(maxed,'fire'),maxed);assert.equal(camp(maxed).campUsed,true);
});
