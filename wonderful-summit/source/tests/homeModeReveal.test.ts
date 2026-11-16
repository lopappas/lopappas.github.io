import test from 'node:test';
import assert from 'node:assert/strict';
import {revealHomeModes} from '../src/homeModeReveal.ts';
test('mode choices remain hidden for home fade and become focusable only after their own fade',()=>{
 const jobs=new Map<number,()=>void>();let visible=false,ready=false;const cancel=revealHomeModes(()=>visible=true,()=>ready=true,false,(fn,delay)=>{jobs.set(delay,fn);return()=>{jobs.delete(delay);};});
 assert.equal(visible,false);assert.equal(ready,false);jobs.get(180)!();assert.equal(visible,true);assert.equal(ready,false);jobs.get(500)!();assert.equal(ready,true);cancel();assert.equal(jobs.size,0);
});
test('mode reveal supports reduced motion and cancels callbacks when leaving the screen',()=>{
 const jobs=new Map<number,()=>void>();let next=0,calls=0;const delays:number[]=[];const cancel=revealHomeModes(()=>calls++,()=>calls++,true,(fn,delay)=>{delays.push(delay);const id=next++;jobs.set(id,fn);return()=>{jobs.delete(id);};});assert.deepEqual(delays,[0,0]);cancel();for(const fn of jobs.values())fn();assert.equal(calls,0);assert.equal(jobs.size,0);
});
