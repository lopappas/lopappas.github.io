import test from 'node:test';
import assert from 'node:assert/strict';
import {DrawingPresentation,inkControlBand,CanvasLayout} from '../src/drawingPresentation.ts';
import {StrokeGeometryCache} from '../src/strokeGeometry.ts';
import {observeAnchoredLayout} from '../src/observeAnchoredLayout.ts';
import {recognize,SPELLS,type Strokes} from '../src/magic.ts';
import {paintSpellInk} from '../src/inkVisuals.ts';
test('ink and charge publish independently while control bands change only at meaningful boundaries',()=>{
 const store=new DrawingPresentation();let ink=0,charge=0;const off=store.subscribeInk(()=>ink++),offCharge=store.subscribeCharge(()=>charge++);let controls=0;
 for(const value of [99,98,75,30,25,1,0]){if(inkControlBand(value)!==inkControlBand(store.getInk()))controls++;store.setInk(value);}assert.equal(ink,7);assert.equal(controls,2);assert.equal(charge,0);
 for(let i=1;i<=60;i++)store.setCharge(i/60);assert.equal(charge,60);assert.equal(ink,7);store.setCharge(1);assert.equal(charge,60);off();offCharge();store.setCharge(0);store.setInk(100);assert.equal(charge,60);
});
test('canvas coordinates are cached until scroll/resize invalidation or explicit pointer-down refresh',()=>{
 let reads=0,left=10;const layout=new CanvasLayout(()=>{reads++;return{left,top:20,width:300,height:200};});for(let i=0;i<100;i++)assert.equal(layout.get().left,10);assert.equal(reads,1);left=40;layout.invalidate();assert.equal(layout.get().left,40);assert.equal(reads,2);layout.refresh();assert.equal(reads,3);
});
function pathFactory(){let builds=0;return{get builds(){return builds;},make:()=>{builds++;return{moveTo(){},lineTo(){}} as unknown as Path2D;}};}
test('stroke paths and bounds are reused during charge, with append, clear, resize and scripted replacement invalidation',()=>{
 const cache=new StrokeGeometryCache(),factory=pathFactory();let strokes:Strokes=[[{x:10,y:20},{x:40,y:60}]];const original=structuredClone(strokes),a=cache.get(strokes,factory.make);assert.deepEqual(a.center,{x:25,y:40});for(let i=0;i<60;i++)assert.equal(cache.get(strokes,factory.make),a);assert.equal(factory.builds,1);assert.deepEqual(strokes,original);
 strokes[0].push({x:80,y:100});const appended=cache.get(strokes,factory.make);assert.notEqual(appended,a);assert.deepEqual(appended.center,{x:45,y:60});
 strokes.push([]);assert.notEqual(cache.get(strokes,factory.make),appended);strokes=strokes.map(s=>s.map(p=>({x:p.x*2,y:p.y*2})));assert.deepEqual(cache.get(strokes,factory.make).center,{x:90,y:120});assert.equal(cache.get([],factory.make).center,null);
 const scripted=structuredClone(SPELLS[0].strokes);const before=recognize(scripted);cache.get(scripted,factory.make);assert.deepEqual(recognize(scripted),before);
});
test('cached paint uses native paths while preserving expansion center and one stroke per path',()=>{
 const strokes:Strokes=[[{x:10,y:20},{x:40,y:60}]],cache=new StrokeGeometryCache(),factory=pathFactory(),geometry=cache.get(strokes,factory.make);let strokesPainted=0;const translations:number[][]=[];
 const ctx={save(){},restore(){},translate(...args:number[]){translations.push(args);},scale(){},stroke(path:Path2D){assert.equal(path,geometry.paths![0]);strokesPainted++;}} as unknown as CanvasRenderingContext2D;
 paintSpellInk(ctx,strokes,'#123456',1,123,null,false,geometry);assert.equal(strokesPainted,1);assert.deepEqual(translations.slice(0,2),[[25,40],[-25,-40]]);
});
test('dialogue measurement coalesces layout events, stays idle without changes and cleans up',()=>{
 let serial=0,measured=0,resized=()=>{},disconnected=false;const jobs=new Map<number,()=>void>(),events=new EventTarget(),motion=new EventTarget();let hidden=false;
 const dispose=observeAnchoredLayout([],motion,target=>target===motion,()=>measured++,{request:cb=>{jobs.set(++serial,cb);return serial;},cancel:id=>{jobs.delete(id);},events:[events],observer:cb=>{resized=cb;return{observe(){},disconnect(){disconnected=true;}};},hidden:()=>hidden});
 assert.equal(measured,1);assert.equal(jobs.size,0);resized();events.dispatchEvent(new Event('scroll'));events.dispatchEvent(new Event('resize'));assert.equal(jobs.size,1);
 const flush=()=>{const list=[...jobs.values()];jobs.clear();list.forEach(fn=>fn());};flush();assert.equal(measured,2);assert.equal(jobs.size,0);
 const start=new Event('animationstart');Object.defineProperty(start,'animationName',{value:'fila-recoil'});motion.dispatchEvent(start);flush();assert.equal(jobs.size,1);const end=new Event('animationend');Object.defineProperty(end,'animationName',{value:'fila-recoil'});motion.dispatchEvent(end);flush();assert.equal(jobs.size,0);
 hidden=true;events.dispatchEvent(new Event('visibilitychange'));assert.equal(jobs.size,0);hidden=false;events.dispatchEvent(new Event('visibilitychange'));assert.equal(jobs.size,1);dispose();assert.equal(jobs.size,0);assert.equal(disconnected,true);events.dispatchEvent(new Event('resize'));resized();assert.equal(jobs.size,0);
});
