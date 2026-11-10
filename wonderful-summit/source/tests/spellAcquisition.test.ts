import test from 'node:test';
import assert from 'node:assert/strict';
import {SpellAcquisition} from '../src/spellAcquisition.ts';

test('acquisition requires a full second and commits exactly once',()=>{
 const hold=new SpellAcquisition();assert.ok(hold.start(100));
 assert.equal(hold.advance(1099),false);assert.ok(hold.progress<1);
 assert.equal(hold.advance(1100),true);assert.equal(hold.progress,1);
 assert.equal(hold.advance(1200),false);assert.equal(hold.start(1200),false);
 hold.cancel();assert.equal(hold.start(1300),false);
});
test('release, cancellation and restart cannot carry over partial acquisition',()=>{
 const hold=new SpellAcquisition();assert.equal(hold.advance(10000),false);
 hold.start(0);hold.advance(700);hold.cancel();assert.equal(hold.progress,0);
 assert.equal(hold.advance(2000),false);assert.ok(hold.start(2000));
 assert.equal(hold.advance(2999),false);assert.equal(hold.advance(3000),true);
});
test('repeat input cannot reset or shorten an active hold',()=>{
 const hold=new SpellAcquisition();hold.start(0);assert.equal(hold.start(500),false);
 assert.equal(hold.advance(999),false);assert.equal(hold.advance(1000),true);
});
