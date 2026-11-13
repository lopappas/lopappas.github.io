import test from 'node:test';
import assert from 'node:assert/strict';
import {publishVisualFrame,batterySaver,setBatterySaver} from '../src/renderPreferences.ts';
import {FrameBatch} from '../src/frameBatch.ts';
import {BattlePresentation} from '../src/battlePresentation.ts';
import {newBattle,stepBattle} from '../src/battle.ts';
test('Battery Saver samples 30 visual frames without dropping simulation steps',()=>{
 let b=newBattle('active'),snapshot=b;const store=new BattlePresentation(b,['water']);let publications=0;store.subscribe(()=>publications++);
 for(let i=0;i<60;i++){b=stepBattle(b,1/60);store.publish(b,['water'],false,true,false);snapshot=stepBattle(snapshot,1/60);}
 assert.equal(publications,30);assert.deepEqual(b,snapshot);assert.equal(store.getSnapshot(),b);
 assert.equal(publishVisualFrame(1,1.001,true,true),true);assert.equal(publishVisualFrame(1,0,true),true);assert.equal(publishVisualFrame(1,1.001,false),true);
});
test('normal mode publishes all motion and Battery Saver is off by default',()=>{
 assert.equal(batterySaver(),false);setBatterySaver(true);assert.equal(batterySaver(),true);setBatterySaver(false);
 let b=newBattle('active');const store=new BattlePresentation(b,['water']);let count=0;store.subscribe(()=>count++);for(let i=0;i<60;i++){b=stepBattle(b,1/60);store.publish(b,['water'],false,false,false);}assert.equal(count,60);
});
test('drawing batches one paint per frame without dropping geometry, and cleanup cancels stale paint',()=>{
 let serial=0;const jobs=new Map<number,()=>void>(),points:number[]=[];let paints=0;const batch=new FrameBatch(fn=>{jobs.set(++serial,fn);return serial;},id=>{jobs.delete(id);});
 for(let i=0;i<20;i++){points.push(i);batch.schedule(()=>{paints++;assert.equal(points.length,20);});}assert.equal(jobs.size,1);const fn=[...jobs.values()][0];jobs.clear();fn();assert.equal(paints,1);batch.schedule(()=>paints++);batch.clear();assert.equal(jobs.size,0);
});
