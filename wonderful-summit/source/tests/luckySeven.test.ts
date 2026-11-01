import test from 'node:test';
import assert from 'node:assert/strict';
import {newRun,battleForRun} from '../src/run.ts';
import {launchSpell,fizzleSpell,cloverReady,effectiveAccuracy,drinkPotion,stepBattle,type Battle} from '../src/battle.ts';
function field(){const b=battleForRun({...newRun(),relics:['sevenLeafClover']},()=>0);return {...b,approachAt:1000,enemies:b.enemies.map(e=>({...e,hp:10000,maxHP:10000,element:'Neutral' as const}))};}
function cast(b:Battle,q:number){return {...launchSpell(b,q,'#fff','water'),projectile:null};}
test('only Steady or better drawn casts count and weaker casts and fizzles preserve progress',()=>{
 let b=field();for(let i=0;i<6;i++){b=cast(b,59);b=fizzleSpell(b);assert.equal(b.castingRelics.steadyCasts,i);b=cast(b,60);}
 assert.equal(cloverReady(b),true);assert.equal(effectiveAccuracy(b,53),53);
 b=cast(b,59);assert.equal(b.castingRelics.steadyCasts,6);assert.equal(cloverReady(b),true);
 b=fizzleSpell(b);assert.equal(b.castingRelics.steadyCasts,6);
 const seventh=launchSpell(b,60,'#fff','water');assert.equal(seventh.projectile?.quality,67);assert.equal(seventh.castingRelics.steadyCasts,7);
});
test('the seventh bonus is used once per combat, not again on the fourteenth cast, and resets next combat',()=>{
 let b=field();for(let i=1;i<=15;i++){const next=launchSpell(b,60,'#fff','water');assert.equal(next.projectile?.quality,i===7?67:60);b={...next,projectile:null};}
 assert.equal(cloverReady(b),false);assert.equal(field().castingRelics.steadyCasts,0);
});
test('other quality bonuses can qualify a cast, but the clover cannot supply its own eligibility',()=>{
 let b=field();b={...b,castingRelics:{...b.castingRelics,calculus:true,steadyCasts:6}};
 assert.equal(effectiveAccuracy(b,56),59);assert.equal(effectiveAccuracy(b,57),67);
 const next=launchSpell(b,57,'#fff','water');assert.equal(next.projectile?.quality,67);assert.equal(next.castingRelics.steadyCasts,7);
});
test('bottled Steady casts neither consume the seventh bonus nor increment its counter',()=>{
 let b:Battle=field();b={...b,castingRelics:{...b.castingRelics,steadyCasts:6},potions:{heal:0,freeze:0,ink:0,spellBottle:1},bottledSpells:[{spellId:'water',quality:60}]};
 b=drinkPotion(b,'spellBottle');for(let i=0;i<70;i++)b=stepBattle(b,.01);
 assert.equal(b.castingRelics.steadyCasts,6);assert.equal(cloverReady(b),true);assert.equal(launchSpell(b,60,'#fff','water').projectile?.quality,67);
});
