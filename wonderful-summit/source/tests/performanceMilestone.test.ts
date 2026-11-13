import test from 'node:test';
import assert from 'node:assert/strict';
import {FrameLoop,bindFrameVisibility} from '../src/frameLoop.ts';
import {PerformanceMetrics} from '../src/performanceMetrics.ts';
import {newBattle,stepBattle} from '../src/battle.ts';
function clock(){let now=0,id=0;const jobs=new Map<number,(now:number)=>void>();return{now:()=>now,request:(cb:(now:number)=>void)=>{jobs.set(++id,cb);return id;},cancel:(id:number)=>{jobs.delete(id);},get pending(){return jobs.size;},advance(ms:number){now+=ms;const callbacks=[...jobs.values()];jobs.clear();callbacks.forEach(cb=>cb(now));}};}
test('inactive loops have no queued callbacks and repeated starts own exactly one',()=>{
 const c=clock(),times:number[]=[];const loop=new FrameLoop(dt=>{times.push(dt);},c);assert.equal(c.pending,0);loop.setRunning(true);loop.setRunning(true);assert.equal(c.pending,1);c.advance(16);assert.equal(times.length,1);assert.equal(c.pending,1);loop.setRunning(false);assert.equal(c.pending,0);c.advance(10000);assert.equal(times.length,1);
});
test('pause/resume discards elapsed idle time and preserves real combat simulation',()=>{
 const c=clock();let b=newBattle('active','slime',()=>.4);const initial=structuredClone(b);const loop=new FrameLoop(dt=>{b=stepBattle(b,dt);},c);loop.setRunning(true);c.advance(20);loop.setRunning(false);const paused=structuredClone(b);c.advance(60000);assert.deepEqual(b,paused);loop.setRunning(true);c.advance(20);assert.ok(Math.abs(b.time-.04)<1e-9);assert.deepEqual(b,stepBattle(stepBattle(initial,.02),.02));loop.setRunning(false);
});
test('terminal combat stops scheduling immediately, including a transition inside a frame',()=>{
 const c=clock();let calls=0;const loop=new FrameLoop(()=>{calls++;return false;},c);loop.setRunning(true);c.advance(16);assert.equal(c.pending,0);c.advance(10000);assert.equal(calls,1);
 for(const phase of ['victory','defeat'] as const){let b=newBattle(phase);const idle=new FrameLoop(dt=>{b=stepBattle(b,dt);},c);idle.setRunning(b.phase==='active');assert.equal(c.pending,0);}
});
test('visibility cancels work and resumes with fresh deltas; disposal removes its listener',()=>{
 const c=clock(),deltas:number[]=[];const visibility=Object.assign(new EventTarget(),{hidden:false});const loop=new FrameLoop(dt=>{deltas.push(dt);},c);const dispose=bindFrameVisibility(loop,visibility);c.advance(16);visibility.hidden=true;visibility.dispatchEvent(new Event('visibilitychange'));assert.equal(c.pending,0);c.advance(60000);visibility.hidden=false;visibility.dispatchEvent(new Event('visibilitychange'));c.advance(16);assert.deepEqual(deltas,[.016,.016]);dispose();visibility.dispatchEvent(new Event('visibilitychange'));assert.equal(c.pending,0);
});
test('hidden mount schedules nothing and stopping from inside a callback cannot leave work behind',()=>{
 const c=clock(),visibility=Object.assign(new EventTarget(),{hidden:true});let loop:FrameLoop;loop=new FrameLoop(()=>{loop.setRunning(false);},c);const dispose=bindFrameVisibility(loop,visibility);assert.equal(c.pending,0);visibility.hidden=false;visibility.dispatchEvent(new Event('visibilitychange'));c.advance(16);assert.equal(c.pending,0);dispose();
});
test('metrics are opt-in, bounded, and accurately distinguish update rate from simulation cost',()=>{
 const metrics=new PerformanceMetrics();metrics.recordFrame(20,2);metrics.recordCommit();assert.equal(metrics.snapshot().frames,0);metrics.enabled=true;for(let i=0;i<1200;i++){metrics.recordFrame(20,2);metrics.recordCommit();}const s=metrics.snapshot();assert.equal(s.windowFrames,600);assert.equal(s.frames,1200);assert.equal(s.activeSeconds,24);assert.equal(s.updatesPerSecond,50);assert.equal(s.p95IntervalMs,20);assert.equal(s.meanStepMs,2);assert.equal(s.commitsPerActiveSecond,50);metrics.enabled=false;metrics.recordFrame(10,1);assert.equal(metrics.snapshot().frames,1200);metrics.reset();assert.equal(metrics.snapshot().frames,0);assert.equal(metrics.snapshot().commits,0);
});
test('metrics reject invalid samples and compute p95 without confusing stalls with simulation work',()=>{
 const metrics=new PerformanceMetrics();metrics.enabled=true;for(let i=0;i<95;i++)metrics.recordFrame(16,1);for(let i=0;i<5;i++)metrics.recordFrame(100,2);for(const n of [NaN,Infinity,-1,0])metrics.recordFrame(n,1);assert.equal(metrics.snapshot().frames,100);assert.equal(metrics.snapshot().p95IntervalMs,16);assert.equal(metrics.snapshot().maxIntervalMs,100);assert.equal(metrics.snapshot().meanStepMs,1.05);
});
