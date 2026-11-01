import test from 'node:test';
import assert from 'node:assert/strict';
import {newRun,battleForRun,RELICS} from '../src/run.ts';
import {launchSpell,fizzleSpell,cloverReady,effectiveAccuracy,drinkPotion,stepBattle,type Battle} from '../src/battle.ts';
function field(){const b=battleForRun({...newRun(),relics:['sevenLeafClover']},()=>0);return {...b,approachAt:1000,enemies:b.enemies.map(e=>({...e,hp:10000,maxHP:10000,element:'Neutral' as const}))};}
function cast(b:Battle,q:number){return {...launchSpell(b,q,'#fff','water'),projectile:null};}
test('six consecutive competent casts arm the next attempt; Faint and fizzle reset unarmed progress',()=>{
 let b=cast(field(),60);assert.equal(b.castingRelics.steadyCasts,1);b=cast(b,59);assert.equal(b.castingRelics.steadyCasts,0);
 b=cast(b,60);b=fizzleSpell(b);assert.equal(b.castingRelics.steadyCasts,0);
 for(let i=0;i<6;i++)b=cast(b,60);assert.equal(cloverReady(b),true);assert.equal(effectiveAccuracy(b,53),60);
 const seventh=launchSpell(b,53,'#fff','water');assert.equal(seventh.projectile?.quality,60);assert.equal(seventh.castingRelics.steadyCasts,0);
});
test('a fresh six-cast streak is required after each seventh attempt, even if that attempt is competent',()=>{
 let b=field();for(let i=1;i<=15;i++){const next=launchSpell(b,60,'#fff','water');assert.equal(next.projectile?.quality,i%7===0?67:60);b={...next,projectile:null};}
 assert.equal(cloverReady(b),false);assert.equal(field().castingRelics.steadyCasts,0);
});
test('the armed bonus applies to Faint attempts too and is consumed even by a fizzle',()=>{
 let b=field();b={...b,castingRelics:{...b.castingRelics,steadyCasts:6}};
 assert.equal(effectiveAccuracy(b,42),49);assert.equal(launchSpell(b,42,'#fff','water').projectile?.quality,49);
 const failed=launchSpell(b,30,'#fff','water');assert.equal(failed.projectile,null);assert.equal(failed.castingRelics.steadyCasts,0);
 assert.equal(fizzleSpell(b).castingRelics.steadyCasts,0);
 assert.equal(RELICS.sevenLeafClover.description,'If you cast 6 consecutive competent spells in a row, your 7th spell has +7% spell quality.');
});
test('bottled Steady casts neither consume the seventh bonus nor increment its counter',()=>{
 let b:Battle=field();b={...b,castingRelics:{...b.castingRelics,steadyCasts:6},potions:{heal:0,freeze:0,ink:0,spellBottle:1},bottledSpells:[{spellId:'water',quality:60}]};
 b=drinkPotion(b,'spellBottle');for(let i=0;i<70;i++)b=stepBattle(b,.01);
 assert.equal(b.castingRelics.steadyCasts,6);assert.equal(cloverReady(b),true);assert.equal(launchSpell(b,60,'#fff','water').projectile?.quality,67);
});
