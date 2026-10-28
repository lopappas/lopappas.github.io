import {test} from 'node:test';
import assert from 'node:assert/strict';
import {GuideCooldown,GUIDE_DURATION_MS} from '../src/guide.ts';

test('preview cannot restart or switch spells while already active',()=>{
 const gate=new GuideCooldown();
 assert.equal(gate.tryStart(0),true);
 for(const time of [0,100,500,999,2000])assert.equal(gate.tryStart(time),false);
});
test('eight-second cooldown starts after the 1.5-second preview ends',()=>{
 assert.equal(GUIDE_DURATION_MS,1500);
 const gate=new GuideCooldown();
 assert.equal(gate.tryStart(0),true);
 gate.finish(GUIDE_DURATION_MS);
 for(const time of [1500,1501,4000,9000,9499])assert.equal(gate.tryStart(time),false);
 assert.equal(gate.tryStart(9500),true);
});
test('repeated closes during cooldown do not extend or bypass it',()=>{
 const gate=new GuideCooldown();gate.tryStart(100);gate.finish(1600);
 assert.equal(gate.tryStart(2000),false);
 gate.finish(5000); // A stale completion cannot restart the cooldown.
 assert.equal(gate.tryStart(9600),true);
 gate.finish(11100);
 assert.equal(gate.tryStart(19099),false);
 assert.equal(gate.tryStart(19100),true);
});
test('a delayed preview completion still receives eight full seconds of cooldown',()=>{
 const gate=new GuideCooldown();gate.tryStart(0);gate.finish(1900);
 assert.equal(gate.tryStart(9000),false);
 assert.equal(gate.tryStart(9900),true);
});

test('Ready border can query readiness repeatedly without starting or extending the trace cooldown',()=>{
 const gate=new GuideCooldown();
 for(let i=0;i<20;i++)assert.equal(gate.isReady(i),true);
 assert.equal(gate.tryStart(100),true);assert.equal(gate.isReady(100),false);
 gate.finish(1600);for(const now of [1600,2000,9599])assert.equal(gate.isReady(now),false);
 for(let i=0;i<20;i++)assert.equal(gate.isReady(9600),true);
 assert.equal(gate.tryStart(9600),true);assert.equal(gate.isReady(9600),false);
});
