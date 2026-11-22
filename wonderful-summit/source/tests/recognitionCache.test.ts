import test from 'node:test';
import assert from 'node:assert/strict';
import {SPELLS,SPELL_VARIATIONS,recognize,applyRecognitionBonus,gradeDrawnCast,type Strokes} from '../src/magic.ts';
import {launchGradedSpell,launchSpell,newBattle,relicAccuracyBonus,robesBonus} from '../src/battle.ts';
import {guardianStats} from '../src/guardian.ts';

test('all scoring references are perfect regardless of stroke order, direction or scale',()=>{
 for(const spell of SPELLS)for(const shape of [spell.strokes,...(SPELL_VARIATIONS[spell.id]??[])]){
  const expected=recognize(shape);
  assert.equal(expected.spell?.id,spell.id);
  assert.equal(expected.quality,100,spell.name);
  const reversed=shape.toReversed().map(stroke=>stroke.toReversed());
  assert.deepEqual(recognize(reversed),expected,spell.name);
  for(const scale of [.2,3]){
   const moved=reversed.map(stroke=>stroke.map(({x,y})=>({x:x*scale+321,y:y*scale-78})));
   const match=recognize(moved);
   assert.equal(match.spell?.id,spell.id);
   assert.equal(match.quality,100,spell.name);
  }
 }
});

test('reordering and reversing rough strokes preserves candidate scores and spell decisions',()=>{
 let seed=9183;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;};
 for(const spell of SPELLS){
  const rough=spell.strokes.map(stroke=>stroke.map(({x,y})=>({x:x+(random()-.5)*12,y:y+(random()-.5)*12})));
  const reordered=[...rough.slice(1),rough[0]].map((stroke,i)=>i%2?stroke:stroke.toReversed());
  assert.deepEqual(recognize(reordered),recognize(rough),spell.name);
 }
});

test('Cursed Twig accepts every stroke sequence and penalizes gaps and extra connecting ink',()=>{
 const twig=SPELLS.find(s=>s.id==='toxicTwig')!;
 const [stem,upper,lower]=twig.strokes;
 const expected=recognize(twig.strokes);
 const orders=[[stem,upper,lower],[stem,lower,upper],[upper,stem,lower],[upper,lower,stem],[lower,stem,upper],[lower,upper,stem]];
 for(const order of orders)for(let mask=0;mask<8;mask++){
  const strokes=order.map((stroke,i)=>mask&(1<<i)?stroke.toReversed():stroke);
  assert.deepEqual(recognize(strokes),expected);
 }
 const [top,bottom]=stem;
 const middle={x:top.x,y:(top.y+bottom.y)/2};
 const split=recognize([[top,middle],[middle,bottom],upper,lower]);
 assert.equal(split.spell,twig);
 assert.ok(split.quality>=98);
 const gap=recognize([[top,{...middle,y:middle.y-8}],[{...middle,y:middle.y+8},bottom],upper,lower]);
 assert.equal(gap.spell,twig);
 assert.ok(gap.quality<80);
 const connected=recognize([[...stem,...upper,...lower]]);
 assert.equal(connected.spell,null);
 assert.ok(connected.quality<45);
});

test('recognition handles empty ink, learned spell limits and accuracy bonuses',()=>{
 const water=SPELLS.find(s=>s.id==='water')!;
 for(const stretch of [.35,.45,.55,.65,.75,.85]){
  const strokes=water.strokes.map(stroke=>stroke.map(p=>({x:p.x*stretch,y:p.y})));
  const known=['water','fire','nature'] as const;
  const raw=recognize(strokes,[...known]);
  for(const bonus of [3,7,10])assert.deepEqual(recognize(strokes,[...known],bonus),applyRecognitionBonus(raw,bonus));
 }
 for(const strokes of [[],[[]],[[{x:0,y:0}]],[[{x:0,y:0},{x:0,y:0}]]] as Strokes[]){
  const empty=recognize(strokes,[],100);
  assert.equal(empty.spell,null);assert.equal(empty.quality,0);assert.deepEqual(empty.candidates,[]);
 }
 assert.deepEqual(recognize(water.strokes,[]).candidates,[]);
 assert.deepEqual(recognize(water.strokes,['fire','nature']).candidates.map(candidate=>candidate.spell.id).sort(),['fire','nature']);
});
test('cache reuse does not mutate input or leak mutable candidate results into later attempts',()=>{
 const shapes=structuredClone(SPELLS),input=structuredClone(SPELLS[0].strokes),before=structuredClone(input),expected=recognize(input);
 const first=recognize(input);first.candidates[0].quality=0;first.candidates.reverse();assert.deepEqual(recognize(input),expected);assert.deepEqual(input,before);assert.deepEqual(SPELLS,shapes);
});

test('only the six selected spells earn the tapered grade boost, and fizzles keep their recognition score',()=>{
 const eligible=['Drudge Bog','Firestorm','Constellation','Flame Blade','Cursed Twig','Snowman'];
 for(const spell of SPELLS){
  for(const [raw,expected] of [[45,50],[55,60],[65,70],[77,80],[90,92],[99,99],[100,100]]){
   const rawMatch={spell:null,quality:0,candidates:[{spell,quality:raw,error:0}],reason:''};
   const recognized=applyRecognitionBonus(rawMatch);
   assert.strictEqual(gradeDrawnCast(recognized),recognized);
   const quality=eligible.includes(spell.name)?expected:raw;
   assert.deepEqual(gradeDrawnCast(recognized,true),{...recognized,spell,quality});
  }
 }
 const spell=SPELLS.find(s=>s.id==='snowman')!,other=SPELLS[0];
 for(const [score,runnerUp] of [[44,0],[77,71]]){
  const rawMatch={spell:null,quality:0,candidates:[{spell,quality:score,error:0},{spell:other,quality:runnerUp,error:0}],reason:''};
  const recognized=applyRecognitionBonus(rawMatch);
  assert.equal(recognized.spell,null);
  assert.strictEqual(gradeDrawnCast(recognized,true),recognized);
 }
});

test('boosted Snowman uses the displayed quality while both robes count True Wonderful from raw accuracy',()=>{
 const base=newBattle('active');
 const spell=SPELLS.find(s=>s.id==='snowman')!;
 for(const artisan of [false,true]){
  const state={...base,castingRelics:{...base.castingRelics,calculus:true},robes:{...base.robes,enabled:true,artisan}};
  for(const [rawQuality,expected] of [[77,83],[80,86]]){
   const rawMatch={spell,quality:rawQuality,candidates:[{spell,quality:rawQuality,error:0}],reason:''};
   const recognized=applyRecognitionBonus(rawMatch,relicAccuracyBonus(state,rawQuality));
   const match=gradeDrawnCast(recognized,true);
   assert.equal(match.quality,expected);
   const cast=launchGradedSpell(state,{rawQuality,quality:match.quality},spell.color,spell.id);
   assert.equal(cast.snowman?.quality,expected);
   assert.equal(cast.snowman?.hp,guardianStats('snowman',expected).hp);
   assert.deepEqual(cast.robes.spells,rawQuality===80?['snowman']:[]);
   assert.equal(robesBonus(cast),rawQuality===80?(artisan?4:2):0);
   assert.equal(launchSpell(state,rawQuality,spell.color,spell.id).snowman?.quality,rawQuality+3);
  }
 }
});
