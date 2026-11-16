import test from 'node:test';
import assert from 'node:assert/strict';
import {SPELLS,type SpellId} from '../src/magic.ts';
import {orderedCombatSpells,combatTraceScale,TRACE_STROKE_WIDTH,TRACE_FADE_MS} from '../src/combatTracePresentation.ts';
import {CombatTrace} from '../src/combatTrace.ts';
test('combat picker puts starters first, then owned spells by Water, Fire, Nature, Ancient',()=>{
 const before=structuredClone(SPELLS),all=orderedCombatSpells(SPELLS.map(s=>s.id));assert.deepEqual(all.slice(0,3).map(s=>s.id),['water','fire','nature']);
 const order={Water:0,Fire:1,Nature:2,Ancient:3};const ranks=all.slice(3).map(s=>order[s.element]);assert.deepEqual(ranks,[...ranks].sort((a,b)=>a-b));
 assert.deepEqual(orderedCombatSpells(['fire','water','water','bog']).map(s=>s.id),['water','fire','bog']);assert.equal(orderedCombatSpells(['fire']).some(s=>s.element==='Ancient'),false);assert.deepEqual(SPELLS,before);
});
test('trace presentation applies requested multipliers without changing source shapes',()=>{
 const before=structuredClone(SPELLS);for(const id of ['bog','chronos','firestorm','flameBlade'] as SpellId[])assert.equal(combatTraceScale(id),1.15);
 assert.equal(combatTraceScale('thistleBush'),1.5);assert.equal(combatTraceScale('torrent'),1.4);assert.equal(combatTraceScale('water'),1);assert.equal(TRACE_STROKE_WIDTH,4*1.1);assert.equal(TRACE_FADE_MS,180);assert.deepEqual(SPELLS,before);
 const trace=new CombatTrace();trace.select('torrent',['torrent'],'expert',0);assert.equal(trace.advance(1.99),false);assert.equal(trace.advance(2),true);assert.equal(trace.canSelect('expert',11.99),false);assert.equal(trace.canSelect('expert',12),true);
});
