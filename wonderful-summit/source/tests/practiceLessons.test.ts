import test from 'node:test';
import assert from 'node:assert/strict';
import {SPELLS,recognize,type Point} from '../src/magic.ts';
import {elementTrace} from '../src/tutorial2Elements.ts';
import {practiceLesson,lessonFrame,lessonTipPages,LESSON_INSTRUCTIONS} from '../src/practiceLessons.ts';
const area=(p:Point[])=>p.slice(1).reduce((a,b,i)=>a+p[i].x*b.y-b.x*p[i].y,0);

test('every completed Practice demonstration casts its intended spell at 100% against the full roster',()=>{
 const original=structuredClone(SPELLS);
 assert.equal(Object.keys(LESSON_INSTRUCTIONS).length,SPELLS.filter(s=>!s.developerOnly).length);assert.equal(practiceLesson('ender'),null);
 for(const spell of SPELLS.filter(s=>!s.developerOnly)){
  const lesson=practiceLesson(spell.id)!;assert.ok(lesson);assert.ok(lesson.duration>=4000/1.2&&lesson.duration<=8000/1.2);
  const end=lessonFrame(lesson.paths,1);assert.deepEqual(end.strokes,lesson.paths);assert.deepEqual(end.tip,lesson.paths.at(-1)!.at(-1));
  const match=recognize(end.strokes);
  assert.equal(match.spell?.id,spell.id,spell.name);
  assert.equal(match.quality,100,spell.name);
  assert.deepEqual(lessonFrame(lesson.paths,0).tip,lesson.paths[0][0]);
 }
 assert.deepEqual(SPELLS,original);
});
test('starter lessons reuse the existing tutorial paths exactly',()=>{
 for(const id of ['water','fire','nature'] as const)assert.deepEqual(practiceLesson(id)!.paths,elementTrace(id,1).strokes);
});
test('Aquaspout, Chronos, Bog and Alchemize follow the approved counterclockwise curves and separate strokes',()=>{
 const aqua=practiceLesson('wave')!.paths;assert.deepEqual(aqua[0][0],{x:50,y:32});assert.ok(area(aqua[0])<0);assert.deepEqual(aqua[1],[{x:36,y:18},{x:50,y:6},{x:64,y:18}]);
 const chronos=practiceLesson('chronos')!.paths;assert.ok(area(chronos[0])<0);assert.deepEqual(chronos[1],[{x:50,y:10},{x:50,y:50}]);
 const bog=practiceLesson('bog')!.paths;assert.deepEqual(bog[0][0],{x:50,y:12});assert.ok(area(bog[0])<0);assert.deepEqual(bog[1][0],{x:32.5,y:50});assert.ok(area(bog[1])>0);
 const bottle=practiceLesson('alchemize')!.paths;assert.deepEqual(bottle[0][0],{x:41,y:14});assert.ok(area(bottle[0])<0);assert.equal(bottle.length,2);assert.deepEqual(bottle[1],[{x:41,y:14},{x:39.2,y:5},{x:60.8,y:5},{x:59,y:14}]);
});
test('leaf, triangles, blade and line spells follow approved starting points, order and clockwise direction',()=>{
 const leaf=practiceLesson('leaf')!.paths[0];assert.deepEqual(leaf[0],{x:15,y:50});assert.ok(area(leaf)>0);
 const rain=practiceLesson('firestorm')!.paths;assert.deepEqual(rain[0],[{x:10,y:18},{x:90,y:18}]);assert.deepEqual(rain[1][0],{x:12,y:38});assert.deepEqual(rain[2][0],{x:56,y:38});assert.ok(area(rain[1])>0&&area(rain[2])>0);
 const blade=practiceLesson('flameBlade')!.paths;
 const canonical=SPELLS.find(s=>s.id==='flameBlade')!.strokes;
 assert.deepEqual(blade.slice(0,2),canonical.slice(1));
 assert.equal(blade[0][1].x-blade[0][0].x,blade[0][1].y-blade[0][0].y);
 assert.ok(area([...blade[2],blade[2][0]])>0);
 for(const id of ['puddleGuard','thistleBush'] as const){const p=practiceLesson(id)!.paths[0];assert.ok(p[0].x<p.at(-1)!.x);}
 const bolt=practiceLesson('bolt')!.paths[0];assert.ok(bolt[0].y<bolt.at(-1)!.y);
 const vine=practiceLesson('sneakyVine')!.paths[0];assert.deepEqual(vine[0],{x:70,y:90});
 const tidal=practiceLesson('tidalcrest')!.paths[0];assert.deepEqual(tidal[0],{x:15,y:85});assert.ok(area(tidal)>0);
});
test('progress traces strokes without connecting them or changing source geometry',()=>{
 const lesson=practiceLesson('firestorm')!,before=structuredClone(lesson.paths);let previous=0;
 for(let i=0;i<=100;i++){
  const frame=lessonFrame(lesson.paths,i/100);assert.ok(frame.strokes.length>=previous);previous=frame.strokes.length;
  frame.strokes.forEach((p,j)=>assert.deepEqual(p[0],lesson.paths[j][0]));assert.ok(Number.isFinite(frame.tip.x)&&Number.isFinite(frame.tip.y));
 }
 assert.deepEqual(lesson.paths,before);
});

test('tip paging preserves every approved instruction and whole words at small and large panel sizes',()=>{
 for(const text of Object.values(LESSON_INSTRUCTIONS))for(const capacity of [12,24,48,200]){
  const pages=lessonTipPages(text,capacity);assert.equal(pages.join(' '),text);assert.ok(pages.every(page=>page.trim()===page&&page.length>0));
  if(capacity>=text.length)assert.deepEqual(pages,[text]);
 }
 assert.deepEqual(lessonTipPages('',30),[]);
});

test('Flame Blade stops at the right edge without redrawing the already-present hilt',()=>{
 const paths=practiceLesson('flameBlade')!.paths;
 const [tip,right,left]=SPELLS.find(s=>s.id==='flameBlade')!.strokes[0];
 assert.deepEqual(paths[2],[left,tip,right]);
 assert.equal(practiceLesson('alchemize')!.paths.length,2);
});
test('every Learn example runs at 1.2 times its previous drawing speed',()=>{
 for(const id of Object.keys(LESSON_INSTRUCTIONS) as (typeof SPELLS)[number]['id'][]){
  const lesson=practiceLesson(id)!,length=lesson.paths.reduce((sum,p)=>sum+p.slice(1).reduce((n,b,i)=>n+Math.hypot(b.x-p[i].x,b.y-p[i].y),0),0);
  const previous=id==='water'?4500:['fire','nature'].includes(id)?4000:Math.max(4000,Math.min(8000,length*25));
  assert.equal(lesson.duration,previous/1.2);
 }
});
