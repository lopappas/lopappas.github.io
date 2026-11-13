import test from 'node:test';
import assert from 'node:assert/strict';
import {SPELLS,SPELL_VARIATIONS,recognize,type Strokes,type SpellId} from '../src/magic.ts';
import {legacyRecognize} from './fixtures/recognition-0.2.91.ts';
const all=SPELLS.map(s=>s.id);
function parity(strokes:Strokes,known:SpellId[]=all,bonus=0){assert.deepEqual(recognize(strokes,known,bonus),legacyRecognize(strokes,known,bonus));}
test('all reference shapes and variants retain exact candidate order, floating errors, scores and decisions',()=>{
 for(const spell of SPELLS)for(const shape of [spell.strokes,...(SPELL_VARIATIONS[spell.id]??[])]){
  parity(shape);parity(shape.toReversed().map(stroke=>stroke.toReversed()));
  for(const scale of [.2,3])parity(shape.map(stroke=>stroke.map(p=>({x:p.x*scale+321,y:p.y*scale-78}))));
  for(const bonus of [3,7,10,20])parity(shape,[spell.id],bonus);
 }
});
test('partial, distorted, mixed and seeded noisy drawings match the previous scorer exactly',()=>{
 let seed=9183;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;};
 for(const spell of SPELLS){parity(spell.strokes.map(stroke=>stroke.slice(0,Math.max(1,Math.floor(stroke.length*.6)))));parity(spell.strokes.map(stroke=>stroke.map(p=>({x:p.x*.6,y:p.y}))));parity(spell.strokes.map(stroke=>stroke.map(p=>({x:p.x+(random()-.5)*12,y:p.y+(random()-.5)*12}))),all,3);}
 for(let i=0;i<20;i++)parity([Array.from({length:12},()=>({x:random()*100,y:random()*100}))],all,i%2?10:0);
 for(let i=0;i<SPELLS.length-1;i++)parity([...SPELLS[i].strokes,...SPELLS[i+1].strokes]);
});
test('threshold crossings and ambiguity margins remain identical with learned subsets and bonuses',()=>{
 const water=SPELLS.find(s=>s.id==='water')!;
 for(const stretch of [.35,.45,.55,.65,.75,.85])for(const bonus of [0,3,7,10])parity(water.strokes.map(stroke=>stroke.map(p=>({x:p.x*stretch,y:p.y}))),['water','fire','nature'],bonus);
 for(const strokes of [[],[[]],[[{x:0,y:0}]],[[{x:0,y:0},{x:0,y:0}]]] as Strokes[]){parity(strokes);parity(strokes,[],100);}
 parity(water.strokes,[]);parity(water.strokes,['fire','nature']);
});
test('cache reuse does not mutate input or leak mutable candidate results into later attempts',()=>{
 const shapes=structuredClone(SPELLS),input=structuredClone(SPELLS[0].strokes),before=structuredClone(input),expected=legacyRecognize(input);
 const first=recognize(input);first.candidates[0].quality=0;first.candidates.reverse();assert.deepEqual(recognize(input),expected);assert.deepEqual(input,before);assert.deepEqual(SPELLS,shapes);
});
