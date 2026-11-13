import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {chronosClockFrame} from '../src/chronosClock.ts';
import {ChronosClock} from '../src/ChronosClockArt.ts';
import {newBattle,hitWithSpell,stepBattle,drinkPotion} from '../src/battle.ts';
test('one sigil hand starts at twelve, turns clockwise once, and disappears at expiry',()=>{
 let b=hitWithSpell(newBattle('active'),60,'chronos');const first=chronosClockFrame(b)!;assert.equal(first.angle,0);b={...b,time:first.until/4};assert.equal(chronosClockFrame(b)?.angle,90);b={...b,time:first.until/2};assert.equal(chronosClockFrame(b)?.angle,180);b={...b,time:first.until-.001};assert.ok(chronosClockFrame(b)!.angle>359);b={...b,time:first.until};assert.equal(chronosClockFrame(b),null);
});
test('recast resets the hand and uses the longest remaining duration without shortening earlier freeze',()=>{
 let b=hitWithSpell(newBattle('active'),100,'chronos');const end=chronosClockFrame(b)!.until;b={...b,time:1};b=hitWithSpell(b,48,'chronos');assert.equal(chronosClockFrame(b)?.angle,0);assert.equal(chronosClockFrame(b)?.until,end);b={...b,time:1+(end-1)/2};assert.equal(chronosClockFrame(b)?.angle,180);
 b=hitWithSpell(b,100,'chronos');assert.equal(chronosClockFrame(b)?.angle,0);assert.ok(chronosClockFrame(b)!.until>end);
});
test('the shared clock follows combat time and hides outside active combat',()=>{
 let b=hitWithSpell(newBattle('active','pack'),80,'chronos');const snapshot=structuredClone(b);const first=chronosClockFrame(b);assert.equal(stepBattle(b,0),b);assert.deepEqual(chronosClockFrame(b),first);assert.deepEqual(b,snapshot);
 for(const phase of ['ready','victory','defeat'] as const)assert.equal(chronosClockFrame({...b,phase}),null);
 b=stepBattle(b,.1);assert.ok(chronosClockFrame(b)!.angle>0);assert.equal(chronosClockFrame(newBattle('active')),null);
});
test('bottled casts restart the same clock on bottle impact',()=>{
 let b=hitWithSpell(newBattle('active'),100,'chronos');b={...b,time:1,potions:{...b.potions,spellBottle:1},bottledSpells:[{spellId:'chronos',quality:60}]};b=drinkPotion(b,'spellBottle');for(let i=0;i<70;i++)b=stepBattle(b,.01);assert.ok(chronosClockFrame(b)!.started>=1.6);assert.ok(chronosClockFrame(b)!.angle<5);
});
test('the projection renders a single circular sigil with one rotated radial hand',()=>{
 const b=hitWithSpell(newBattle('active'),60,'chronos');b.time=chronosClockFrame(b)!.until/2;const markup=renderToStaticMarkup(React.createElement('svg',null,React.createElement(ChronosClock,{frame:chronosClockFrame(b),y:140})));
 assert.ok(markup.includes('translate(360 140)'));assert.ok(markup.includes('rotate(180)'));assert.ok(markup.includes('M0 0V-38'));assert.equal((markup.match(/<path /g)??[]).length,1);assert.ok(!markup.includes('filter'));assert.equal(renderToStaticMarkup(React.createElement(ChronosClock,{frame:null,y:140})), '');
});
