import test from 'node:test';
import assert from 'node:assert/strict';
import {FrameBatch} from '../src/frameBatch.ts';
import {BattlePresentation} from '../src/battlePresentation.ts';
import {newBattle,stepBattle} from '../src/battle.ts';
test('battlefield publishes every simulation step without a reduced-rate mode',()=>{
 let b=newBattle('active'),expected=b;const store=new BattlePresentation(b,['water']);let count=0;store.subscribe(()=>count++);
 for(let i=0;i<60;i++){b=stepBattle(b,1/60);store.publish(b,['water']);expected=stepBattle(expected,1/60);}assert.equal(count,60);assert.deepEqual(b,expected);assert.equal(store.getSnapshot(),b);
});
test('drawing batches one paint per frame without dropping geometry, and cleanup cancels stale paint',()=>{
 let serial=0;const jobs=new Map<number,()=>void>(),points:number[]=[];let paints=0;const batch=new FrameBatch(fn=>{jobs.set(++serial,fn);return serial;},id=>{jobs.delete(id);});
 for(let i=0;i<20;i++){points.push(i);batch.schedule(()=>{paints++;assert.equal(points.length,20);});}assert.equal(jobs.size,1);const fn=[...jobs.values()][0];jobs.clear();fn();assert.equal(paints,1);batch.schedule(()=>paints++);batch.clear();assert.equal(jobs.size,0);
});
