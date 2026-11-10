import test from 'node:test';
import assert from 'node:assert/strict';
import {SPELLS,recognize,type Point} from '../src/magic.ts';
import {elementTrace} from '../src/tutorial2Elements.ts';
import {practiceLesson,lessonFrame,LESSON_INSTRUCTIONS} from '../src/practiceLessons.ts';
const area=(p:Point[])=>p.slice(1).reduce((a,b,i)=>a+p[i].x*b.y-b.x*p[i].y,0);

test('all fifteen learnable lessons retain their original sigils and recognize as the intended spell',()=>{
 const original=structuredClone(SPELLS);
 assert.equal(Object.keys(LESSON_INSTRUCTIONS).length,15);assert.equal(practiceLesson('ender'),null);
 for(const spell of SPELLS.filter(s=>s.id!=='ender')){
  const lesson=practiceLesson(spell.id)!;assert.ok(lesson);assert.ok(lesson.duration>=4000&&lesson.duration<=8000);
  const match=recognize(lesson.paths,[spell.id]);assert.equal(match.spell?.id,spell.id,spell.name);assert.ok(match.quality>=80,`${spell.name}: ${match.quality}`);
  const end=lessonFrame(lesson.paths,1);assert.deepEqual(end.strokes,lesson.paths);assert.deepEqual(end.tip,lesson.paths.at(-1)!.at(-1));
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
 const bottle=practiceLesson('alchemize')!.paths;assert.deepEqual(bottle[0][0],{x:41,y:14});assert.ok(area(bottle[0])<0);assert.deepEqual(bottle[1][0],{x:39.2,y:5});assert.ok(area(bottle[1])>0);
});
test('leaf, triangles, blade and line spells follow approved starting points, order and clockwise direction',()=>{
 const leaf=practiceLesson('leaf')!.paths[0];assert.deepEqual(leaf[0],{x:15,y:50});assert.ok(area(leaf)>0);
 const rain=practiceLesson('firestorm')!.paths;assert.deepEqual(rain[0],[{x:10,y:18},{x:90,y:18}]);assert.deepEqual(rain[1][0],{x:12,y:38});assert.deepEqual(rain[2][0],{x:56,y:38});assert.ok(area(rain[1])>0&&area(rain[2])>0);
 const blade=practiceLesson('flameBlade')!.paths;assert.deepEqual(blade[0],[{x:28,y:62},{x:72,y:62}]);assert.deepEqual(blade[1],[{x:50,y:62},{x:50,y:88}]);assert.deepEqual(blade[2][0],{x:43,y:62});assert.ok(area(blade[2])>0);
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
