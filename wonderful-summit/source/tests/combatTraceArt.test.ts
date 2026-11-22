import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SPELLS,type SpellId} from '../src/magic.ts';
import {orderedCombatSpells,combatSpellColumns,combatTraceScale,TRACE_STROKE_WIDTH,TRACE_FADE_MS,traceStrokeWidth} from '../src/combatTracePresentation.ts';
import {CombatTrace} from '../src/combatTrace.ts';
test('combat picker puts starters first, then owned spells by Water, Fire, Nature, Ancient',()=>{
 const before=structuredClone(SPELLS),all=orderedCombatSpells(SPELLS.map(s=>s.id));assert.deepEqual(all.slice(0,3).map(s=>s.id),['water','fire','nature']);
 const order={Water:0,Fire:1,Nature:2,Ancient:3};const ranks=all.slice(3).map(s=>order[s.element]);assert.deepEqual(ranks,[...ranks].sort((a,b)=>a-b));
 assert.deepEqual(orderedCombatSpells(['fire','water','water','bog']).map(s=>s.id),['water','fire','bog']);assert.equal(orderedCombatSpells(['fire']).some(s=>s.element==='Ancient'),false);assert.deepEqual(SPELLS,before);
});
test('trace presentation applies requested multipliers without changing source shapes',()=>{
 const before=structuredClone(SPELLS);for(const id of ['chronos','firestorm','flameBlade','snowman'] as SpellId[])assert.equal(combatTraceScale(id),1.15);
 assert.equal(combatTraceScale('bog'),1.15*1.1);
 assert.equal(combatTraceScale('thistleBush'),1.5);assert.equal(combatTraceScale('torrent'),1.4);assert.equal(combatTraceScale('water'),1);assert.equal(TRACE_STROKE_WIDTH,4*1.1);assert.equal(TRACE_FADE_MS,180);assert.deepEqual(SPELLS,before);
 const trace=new CombatTrace();trace.select('torrent',['torrent'],'expert',0);assert.equal(trace.advance(1.99),false);assert.equal(trace.advance(2),true);assert.equal(trace.canSelect('expert',11.99),false);assert.equal(trace.canSelect('expert',12),true);
});

test('each elemental column contains only owned matching spells, with starters first and Ancient conditional',()=>{
 const known:SpellId[]=['bog','water','fire','nature','wave','leaf','bolt'];const columns=combatSpellColumns(known);assert.deepEqual(columns.map(c=>c.element),['Water','Fire','Nature']);assert.deepEqual(columns.map(c=>c.spells[0].id),['water','fire','nature']);
 for(const column of columns)for(const spell of column.spells){assert.equal(spell.element,column.element);assert.ok(known.includes(spell.id));}
 const ancient=combatSpellColumns([...known,'chronos']);assert.equal(ancient.length,4);assert.deepEqual(ancient[3].spells.map(s=>s.id),['chronos']);assert.equal(combatTraceScale('puddleGuard'),1.4);
});


test('requested trace thicknesses scale relative to each guide’s base stroke',()=>{
 const widths={firestorm:3.872,puddleGuard:3.74,flameBlade:3.96,thistleBush:3.872,torrent:3.96,scorchy:3.564,snowman:3.872,constellation:5.06};
 for(const [id,width] of Object.entries(widths))assert.equal(traceStrokeWidth(id as SpellId),width);
 assert.equal(traceStrokeWidth('water'),4.4);
 assert.equal(traceStrokeWidth('puddleGuard',3.45),2.9325);
 assert.equal(traceStrokeWidth('bog'),3.96);
 assert.equal(traceStrokeWidth('bog',undefined,true),3.6);
});

test('the spellbook fade cannot override persistent combat or tutorial trace opacity',()=>{
 const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
 const fadeSelectors=Array.from(css.matchAll(/([^{}]+)\{[^{}]*animation:\s*hintFade\b/g),rule=>rule[1].trim());
 assert.deepEqual(fadeSelectors,['.spellbook-trace']);
});
