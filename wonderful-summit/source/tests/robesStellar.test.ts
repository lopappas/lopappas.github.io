import test from 'node:test';
import assert from 'node:assert/strict';
import {newRun,startRun,battleForRun,finishBattle,acquireRelic,runRobesBonus,enterNode,RELICS} from '../src/run.ts';
import {launchSpell,robesBonus,stepBattle,drinkPotion,fizzleSpell,COMMON_POTIONS,POTIONS,effectiveAccuracy} from '../src/battle.ts';
function field(){const run={...newRun(),screen:'battle' as const};const b=battleForRun(run,()=>0);return {...b,approachAt:1000,enemies:[{...b.enemies[0],element:'Neutral' as const,hp:10000,maxHP:10000}]};}
function advance(b:ReturnType<typeof field>,seconds=.7){for(let i=0;i<Math.ceil(seconds/.01);i++)b=stepBattle(b,.01);return b;}
test('Filadora starts with Starter robes plus a keepsake; robes stay out of merchant pools',()=>{
 const run=startRun({...newRun(),keepsakeOffers:['amber','moss','feather'],screen:'sister'},'moss');assert.deepEqual(run.relics,['filadoraRobes','moss']);assert.equal(RELICS.filadoraRobes.rarity,'Starter');
 for(let i=0;i<20;i++)assert.ok(!enterNode({...run,screen:'map',node:2},()=>i/20).stock.some(s=>s.item==='filadoraRobes'));
});
test('raw Wonderful unlocks distinct run bonuses and survives combat transitions, but not a new run',()=>{
 let b=field();b=launchSpell(b,80,'#fff','water');assert.equal(b.projectile?.damageMultiplier,1.02);assert.deepEqual(b.robes.spells,['water']);
 b=launchSpell({...b,projectile:null},100,'#fff','water');assert.equal(robesBonus(b),2);
 b=launchSpell({...b,projectile:null},80,'#fff','fire');assert.equal(robesBonus(b),4);
 const run=finishBattle({...newRun(),screen:'battle'},{...b,phase:'victory'},()=>.99);assert.deepEqual(run.wonderfulSpells,['water','fire']);assert.equal(runRobesBonus(run),4);assert.equal(robesBonus(battleForRun({...run,screen:'battle'})),4);assert.deepEqual(newRun().wonderfulSpells,[]);
});
test('Artisan replaces starter robes and retroactively doubles all earned percentages',()=>{
 const base={...newRun(),wonderfulSpells:['water','fire'] as const};const run={...base,wonderfulSpells:[...base.wonderfulSpells]};
 const upgraded=acquireRelic(run,'artisanRobes');assert.ok(!upgraded.relics.includes('filadoraRobes'));assert.ok(upgraded.relics.includes('artisanRobes'));assert.equal(runRobesBonus(upgraded),8);assert.equal(runRobesBonus(run),4);assert.equal(acquireRelic(upgraded,'filadoraRobes'),upgraded);
 const cast=launchSpell(battleForRun(upgraded,()=>0),80,'#fff','nature');assert.equal(robesBonus(cast),12);assert.equal(cast.projectile?.damageMultiplier,1.12);
});
test('Calculus, clover and Stellar can raise quality without qualifying for true Wonderful',()=>{
 let b=field();b={...b,stellarReady:true,castingRelics:{...b.castingRelics,calculus:true,clover:true,steadyCasts:6}};
 assert.equal(effectiveAccuracy(b,77),97);const cast=launchSpell(b,77,'#fff','water');assert.equal(cast.projectile?.quality,97);assert.deepEqual(cast.robes.spells,[]);assert.equal(cast.stellarReady,false);
});
test('Stellar is common and non-stacking, consumed on success or fizzle',()=>{
 let b={...field(),potions:{heal:0,freeze:0,ink:0,stellar:2}};
 assert.ok(COMMON_POTIONS.includes('stellar'));assert.match(POTIONS.stellar.detail,/Does not stack/);
 const flight=drinkPotion(b,'stellar');assert.equal(flight.potions.stellar,1);assert.equal(drinkPotion(flight,'stellar'),flight);
 const active=advance(flight);assert.equal(active.stellarReady,true);assert.equal(drinkPotion(active,'stellar'),active);
 const cast=launchSpell(active,60,'#fff','water');assert.equal(cast.projectile?.quality,70);assert.equal(cast.stellarReady,false);assert.equal(fizzleSpell(active).stellarReady,false);
});
test('bottles neither receive nor consume Stellar, and their raw Wonderful is eligible',()=>{
 let b={...field(),stellarReady:true,potions:{heal:0,freeze:0,ink:0,spellBottle:1},bottledSpells:[{spellId:'water' as const,quality:70}]};
 const released=advance(drinkPotion(b,'spellBottle'));assert.equal(released.stellarReady,true);assert.deepEqual(released.robes.spells,[]);
 const raw=advance(drinkPotion({...b,bottledSpells:[{spellId:'water',quality:80}]},'spellBottle'));assert.deepEqual(raw.robes.spells,['water']);assert.equal(raw.stellarReady,true);
});
