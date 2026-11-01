import test from 'node:test';
import assert from 'node:assert/strict';
import {battleForRun,newRun,RELICS,type RelicId} from '../src/run.ts';
import {newBattle,launchSpell,fizzleSpell,effectiveAccuracy,cloverReady,stepBattle,releaseMultiplier} from '../src/battle.ts';
import {SPELLS,recognize} from '../src/magic.ts';
import {snapshotDrawing,bestDrawing} from '../src/drawings.ts';
function setup(relics:RelicId[]){const b=battleForRun({...newRun(),relics},()=>0);return {...b,approachAt:1000,enemies:[{...b.enemies[0],element:'Neutral' as const,hp:10000,maxHP:10000}]};}
test('Calculus adds 3 accuracy points, caps at 100, and does not distort perfect recognition margins',()=>{
 const b=setup(['forgivingCalculus']);assert.equal(effectiveAccuracy(b,59),62);assert.equal(effectiveAccuracy(b,99),100);
 const next=launchSpell(b,59,'#fff','water');assert.equal(next.projectile?.quality,62);
 assert.equal(recognize(SPELLS[0].strokes,undefined,3).spell?.id,'water');
 const original=snapshotDrawing('water',79,SPELLS[0].strokes,100,100),boosted=snapshotDrawing('fire',78,SPELLS[1].strokes,100,100);
 assert.equal(bestDrawing(original,boosted)?.spellId,'water');
});
test('Black Stardust deals exactly 10 through defenses once per combat, including boss resolution',()=>{
 let b=setup(['blackStardust']);b={...b,enemies:[{...b.enemies[0],rocky:true,element:'Fire'}, {...b.enemies[0],id:2,spawnAt:50}]};
 const first=fizzleSpell(b);assert.equal(first.enemies[0].hp,9990);assert.equal(first.enemies[0].push?.to,Math.min(640,b.enemies[0].x+25));assert.equal(first.enemies[1].hp,10000);
 assert.equal(fizzleSpell(first).enemies[0].hp,9990);assert.equal(b.enemies[0].hp,10000);
 const boss={...setup(['blackStardust']),enemies:[{...b.enemies[0],kind:'mother' as const,hp:5}]};assert.ok(fizzleSpell(boss).motherSplit);
 const ordinary={...setup(['blackStardust']),enemies:[{...b.enemies[0],hp:5}]};assert.equal(fizzleSpell(ordinary).phase,'victory');
 assert.equal(setup(['blackStardust']).castingRelics.stardustUsed,false);
});
test('clover boosts the next attempt after six competent casts and fizzles reset the streak',()=>{
 let b=setup(['sevenLeafClover','forgivingCalculus']);
 for(let i=0;i<6;i++){assert.equal(cloverReady(b),false);b={...launchSpell(b,60,'#fff','water'),projectile:null};}
 assert.equal(cloverReady(b),true);assert.equal(effectiveAccuracy(b,60),70);
 b=launchSpell(b,60,'#fff','water');assert.equal(b.projectile?.quality,70);assert.equal(cloverReady(b),false);
 b=fizzleSpell({...b,projectile:null});assert.equal(b.castingRelics.steadyCasts,0);assert.equal(effectiveAccuracy(b,60),63);
 assert.equal(setup(['sevenLeafClover']).castingRelics.steadyCasts,0);
});
test('Artisan robes award 4% per distinct true Wonderful with no combat cap',()=>{
 let b=setup(['artisanRobes']);b=launchSpell(b,79,'#fff','water');assert.equal(b.projectile?.damageMultiplier,1);b={...b,projectile:null};
 b=launchSpell(b,80,'#fff','water');assert.equal(b.projectile?.damageMultiplier,1.04);b={...b,projectile:null};
 b=launchSpell(b,100,'#fff','water');assert.equal(b.robes.spells.length,1);b={...b,projectile:null};
 for(const id of ['fire','nature','wave','bolt','leaf'] as const)b={...launchSpell(b,80,'#fff',id),projectile:null};
 assert.equal(b.robes.spells.length,6);assert.equal(releaseMultiplier(b,'water'),1.24);assert.equal(fizzleSpell(b).robes.spells.length,6);
});
test('new relics enter the normal rarity catalog and battles without relics keep base accuracy',()=>{
 assert.equal(RELICS.forgivingCalculus.rarity,'Rare');assert.equal(RELICS.artisanRobes.rarity,'Rare');assert.equal(RELICS.blackStardust.rarity,'Rare');assert.equal(RELICS.sevenLeafClover.rarity,'Common');
 assert.equal(effectiveAccuracy(newBattle(),60),60);
});
