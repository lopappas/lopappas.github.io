import test from 'node:test';
import assert from 'node:assert/strict';
import {SpellAcquisition} from '../src/spellAcquisition.ts';

test('acquisition requires 600 milliseconds and commits exactly once',()=>{
 const hold=new SpellAcquisition();assert.ok(hold.start(100));
 assert.equal(hold.advance(699),false);assert.ok(hold.progress<1);
 assert.equal(hold.advance(700),true);assert.equal(hold.progress,1);
 assert.equal(hold.advance(1200),false);assert.equal(hold.start(1200),false);
 hold.cancel();assert.equal(hold.start(1300),false);
});
test('release, cancellation and restart cannot carry over partial acquisition',()=>{
 const hold=new SpellAcquisition();assert.equal(hold.advance(10000),false);
 hold.start(0);hold.advance(400);hold.cancel();assert.equal(hold.progress,0);
 assert.equal(hold.advance(2000),false);assert.ok(hold.start(2000));
 assert.equal(hold.advance(2599),false);assert.equal(hold.advance(2600),true);
});
test('repeat input cannot reset or shorten an active hold',()=>{
 const hold=new SpellAcquisition();hold.start(0);assert.equal(hold.start(500),false);
 assert.equal(hold.advance(599),false);assert.equal(hold.advance(600),true);
});
