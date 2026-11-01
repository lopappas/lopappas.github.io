import test from 'node:test';
import assert from 'node:assert/strict';
import {combatOpening} from '../src/combatOpening.ts';
import {newBattle,stepBattle} from '../src/battle.ts';
test('opening book stays opaque for one second and fades over exactly 750ms',()=>{
 for(const ms of [0,500,999,1000])assert.deepEqual(combatOpening(ms),{blocked:true,opacity:1});
 assert.deepEqual(combatOpening(1375),{blocked:true,opacity:.5});
 assert.equal(combatOpening(1749).blocked,true);assert.deepEqual(combatOpening(1750),{blocked:false,opacity:0});
});
test('battle time and enemy countdown stay at zero throughout the blocked opening',()=>{
 const initial=newBattle('active');let b=initial;
 for(let ms=0;ms<1750;ms+=10)if(!combatOpening(ms).blocked)b=stepBattle(b,.01);
 assert.equal(b,initial);assert.equal(b.time,0);assert.equal(b.enemies[0].clock,0);
 b=stepBattle(b,.1);assert.equal(b.time,.1);assert.equal(b.approachAt,initial.approachAt);
});
