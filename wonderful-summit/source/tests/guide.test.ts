import {test} from 'node:test';
import assert from 'node:assert/strict';
import {GuideCooldown,GUIDE_DURATION_MS} from '../src/guide.ts';

test('preview cannot restart or switch spells while already active',()=>{
 const gate=new GuideCooldown();assert.equal(gate.tryStart(0),true);
 for(const time of [0,100,500,999,2000])assert.equal(gate.tryStart(time),false);
});
test('perfect trace is available immediately when its 1.5-second preview ends',()=>{
 assert.equal(GUIDE_DURATION_MS,1500);const gate=new GuideCooldown();assert.equal(gate.tryStart(0),true);
 gate.finish(GUIDE_DURATION_MS);assert.equal(gate.isReady(1500),true);assert.equal(gate.tryStart(1500),true);
});
test('repeated book closes can trigger traces without a hidden wait',()=>{
 const gate=new GuideCooldown();for(let i=0;i<10;i++){const now=i*1500;assert.equal(gate.tryStart(now),true);gate.finish(now+1500);assert.equal(gate.isReady(now+1500),true);}
});
test('a delayed preview completion adds no cooldown',()=>{
 const gate=new GuideCooldown();gate.tryStart(0);gate.finish(1900);assert.equal(gate.tryStart(1900),true);
});
test('Ready border queries do not consume the next trace',()=>{
 const gate=new GuideCooldown();for(let i=0;i<20;i++)assert.equal(gate.isReady(i),true);
 gate.tryStart(100);assert.equal(gate.isReady(100),false);gate.finish(1600);
 for(let i=0;i<20;i++)assert.equal(gate.isReady(1600),true);
 assert.equal(gate.tryStart(1600),true);assert.equal(gate.isReady(1600),false);
});
