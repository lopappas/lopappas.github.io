import {test} from 'node:test';
import assert from 'node:assert/strict';
import {SPELLS,SPELL_VARIATIONS,recognize,type Strokes} from '../src/magic.ts';
import {newRun,enterNode,castTrailEvent,ROUTE,sealBottle} from '../src/run.ts';
import {snapshotDrawing} from '../src/drawings.ts';
const fire=SPELLS.find(s=>s.id==='fire')!;
const equilateral=():Strokes=>[[{x:50,y:12},{x:85,y:12+35*Math.sqrt(3)},{x:15,y:12+35*Math.sqrt(3)},{x:50,y:12}]];

test('original and equilateral Hearthspark both score perfectly as the same canonical spell',()=>{
 for(const strokes of [fire.strokes,equilateral()]){const result=recognize(strokes);assert.equal(result.spell,fire);assert.equal(result.quality,100);}
 const [a,b,c]=equilateral()[0],length=(p:typeof a,q:typeof a)=>Math.hypot(p.x-q.x,p.y-q.y);
 assert.ok(Math.abs(length(a,b)-length(b,c))<1e-9);assert.ok(Math.abs(length(a,c)-length(b,c))<1e-9);
});
test('nearby triangle proportions collapse to one spell candidate before ambiguity checks',()=>{
 const height=(70+35*Math.sqrt(3))/2,strokes:Strokes=[[{x:50,y:12},{x:85,y:12+height},{x:15,y:12+height},{x:50,y:12}]],result=recognize(strokes);
 assert.equal(result.spell,fire);assert.ok(result.quality>=70);assert.equal(result.candidates.length,SPELLS.length);assert.equal(new Set(result.candidates.map(c=>c.spell.id)).size,SPELLS.length);assert.equal(result.candidates.filter(c=>c.spell.id==='fire').length,1);
 assert.equal(recognize(strokes,['fire']).candidates.length,1);assert.equal(recognize(strokes,['fire']).spell,fire);
});
test('equilateral matching remains independent of size, placement, stroke order and direction',()=>{
 const original=equilateral()[0],edges=original.slice(1).map((p,i)=>[original[i],p]);
 for(const shape of [equilateral(),[[...original].reverse()],[...edges].reverse().map(s=>[...s].reverse())])for(const scale of [.15,1,5]){
  const moved=shape.map(s=>s.map(p=>({x:p.x*scale+130,y:p.y*scale-50}))),result=recognize(moved);assert.equal(result.spell,fire);assert.ok(result.quality>=98);
 }
});
test('ambiguity between different spells still fizzles at the original seven-point margin',()=>{
 const roundedDiamond:Strokes=[[[50,8],[75,40],[80,64],[65,84],[50,90],[35,84],[20,64],[25,40],[50,8]].map(([x,y])=>({x,y}))];
 const result=recognize(roundedDiamond);assert.equal(result.quality,59);assert.equal(result.spell,null);assert.deepEqual(result.candidates.slice(0,2).map(c=>[c.spell.id,c.quality]),[['water',59],['leaf',55]]);assert.match(result.reason,/between two sigils/);
 assert.equal(recognize(roundedDiamond,['water']).spell?.id,'water');
});
test('variations do not unlock unlearned spells or accept incomplete and flattened triangles',()=>{
 assert.equal(recognize(equilateral(),['water','nature']).spell,null);assert.equal(recognize(equilateral(),[]).spell,null);
 for(const shape of [[[{x:50,y:12},{x:85,y:82}]],[[{x:50,y:12},{x:85,y:32},{x:15,y:32},{x:50,y:12}]],[[{x:10,y:10}]]] as Strokes[])assert.equal(recognize(shape).spell,null);
});
test('recognition-only variation keeps all canonical spellbook and perfect-trace shapes intact',()=>{
 assert.deepEqual(Object.keys(SPELL_VARIATIONS),['fire']);assert.equal(SPELL_VARIATIONS.fire?.length,1);assert.equal(fire.path,'M50 12 L85 82 L15 82 Z');assert.deepEqual(fire.strokes,[[{x:50,y:12},{x:85,y:82},{x:15,y:82},{x:50,y:12}]]);
 for(const spell of SPELLS){const result=recognize(spell.strokes);assert.equal(result.spell,spell);assert.equal(result.quality,100);}
});
test('recognized variation works in the campsite and bottle without replacing the player drawing',()=>{
 const strokes=equilateral(),match=recognize(strokes,newRun().spells),drawing=snapshotDrawing(match.spell!.id,match.quality,strokes,300,240);
 const event=enterNode({...newRun(),screen:'map',node:ROUTE.findIndex(n=>n.kind==='event')});const lit=castTrailEvent(event,match.spell!.id,match.quality,drawing);assert.equal(lit.event?.outcome,'lit');assert.deepEqual(lit.bestDrawing?.strokes,strokes);
 const bottle=sealBottle({...newRun(),pendingBottle:true},{spellId:match.spell!.id,quality:match.quality,drawing});assert.equal(bottle.bottledSpells[0].spellId,'fire');assert.equal(bottle.bottledSpells[0].quality,100);assert.deepEqual(bottle.bottledSpells[0].drawing?.strokes,strokes);
});
