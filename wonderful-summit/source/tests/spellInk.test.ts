import test from 'node:test';
import assert from 'node:assert/strict';
import {spellInkColor,chargeColor,SPELLS} from '../src/magic.ts';

test('ink remains black until the cast bar changes to the recognized element',()=>{
 for(const spell of SPELLS){
  assert.equal(spellInkColor(0,spell.color),'#000000');
  assert.equal(spellInkColor(.4999,spell.color),'#000000');
  for(const progress of [.5,.75,1])assert.equal(spellInkColor(progress,spell.color),chargeColor(progress,spell.color));
  assert.equal(spellInkColor(0,spell.color),'#000000');
 }
});
test('unrecognized drawings remain black throughout the hold',()=>{
 for(const progress of [0,.49,.5,1])assert.equal(spellInkColor(progress),'#000000');
});
