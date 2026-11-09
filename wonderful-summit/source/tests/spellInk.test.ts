import test from 'node:test';
import assert from 'node:assert/strict';
import {spellInkColor,SPELLS} from '../src/magic.ts';

test('ink blends from black at 40% to the exact spell color at 90% of the cast',()=>{
 for(const spell of SPELLS){
  for(const progress of [0,.39,.4])assert.equal(spellInkColor(progress,spell.color),'#000000');
  for(const progress of [.9,.95,1])assert.equal(spellInkColor(progress,spell.color),spell.color);
  let previous=[0,0,0];
  for(const progress of [.41,.5,.65,.8,.89]){
   const ink=spellInkColor(progress,spell.color);
   assert.notEqual(ink,'#000000');assert.notEqual(ink,spell.color);
   const channels=ink.slice(1).match(/.{2}/g)!.map(channel=>parseInt(channel,16));
   channels.forEach((value,i)=>assert.ok(value>=previous[i]));previous=channels;
  }
  assert.equal(spellInkColor(0,spell.color),'#000000');
 }
 assert.equal(spellInkColor(.65,'#804020'),'#402010');
});
test('unrecognized drawings remain black throughout the hold',()=>{
 for(const progress of [0,.4,.5,.9,1])assert.equal(spellInkColor(progress),'#000000');
});
