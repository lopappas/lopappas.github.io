import test from 'node:test';
import assert from 'node:assert/strict';
import {SPELLS,PLAYER_SPELLS,recognize,spellPower} from '../src/magic.ts';
import {newBattle,hitWithSpell,launchSpell,stepBattle,spellDamage,spellTarget,spellCooldownRemaining,drinkPotion,ENEMY_BACK_X} from '../src/battle.ts';
import {spellUpgradePreview} from '../src/spellbook.ts';
function field(){const b=newBattle('active','pack',()=>0);b.approachAt=1000;b.enemies=b.enemies.map((e,i)=>({...e,element:'Neutral',hp:1000,maxHP:1000,x:350+i*100}));return b;}
test('Sneaky Vine is a learnable uncommon Nature spell with a recognizable simple DNA sigil',()=>{
 const s=PLAYER_SPELLS.find(s=>s.id==='sneakyVine')!;assert.equal(s.element,'Nature');assert.equal(s.rarity,'Uncommon');
 for(const strokes of [s.strokes,[...s.strokes].reverse().map(st=>[...st].reverse())]){const result=recognize(strokes);assert.equal(result.spell?.id,s.id);assert.ok(result.quality>=95);}
});
test('Sneaky Vine targets only the furthest living, present enemy and breaks ties by ID',()=>{
 const b=field();b.enemies.push({...b.enemies[1],id:3,x:640,spawnAt:10},{...b.enemies[1],id:4,x:600,hp:0});
 assert.equal(spellTarget(b,'sneakyVine')?.id,2);
 const hit=launchSpell(b,60,'green','sneakyVine',0,()=>.99);assert.equal(hit.enemies[0].hp,1000);assert.equal(hit.enemies[1].hp,973);assert.equal(hit.vineGrab?.targetId,2);assert.equal(hit.projectile,null);
 const tie={...b,enemies:b.enemies.slice(0,2).map(e=>({...e,x:450}))};assert.equal(spellTarget(tie,'sneakyVine')?.id,1);
});
test('Sneaky Vine deals 27 at Steady, scales with accuracy and has the normal 25 percent damage upgrade',()=>{
 assert.equal(spellDamage({element:'Neutral'},60,'sneakyVine'),27);assert.equal(spellPower('sneakyVine',47),0);
 let last=0;for(let q=48;q<=100;q++){const damage=spellPower('sneakyVine',q);assert.ok(damage>=last);last=damage;}
 assert.equal(spellUpgradePreview('sneakyVine')?.nextDamage,34);
});
test('the vine drags backwards over 0.9 seconds, never exceeds the runway, and expires',()=>{
 let b=launchSpell(field(),60,'green','sneakyVine',0,()=>.99);const e=b.enemies[1];assert.equal(e.push?.ends,.9);assert.ok(e.push!.to>450);assert.ok(e.push!.to<=ENEMY_BACK_X);
 b=stepBattle(b,.1);assert.ok(b.enemies[1].x>450);assert.ok(b.vineGrab);
 for(let i=0;i<12;i++)b=stepBattle(b,.1);assert.equal(b.vineGrab,null);assert.equal(b.enemies[1].push,null);
});
test('the 12 second cooldown blocks repeat casts and becomes available at exactly 12 seconds',()=>{
 let b=launchSpell(field(),60,'green','sneakyVine',0,()=>.99);assert.equal(spellCooldownRemaining(b,'sneakyVine'),12);assert.equal(launchSpell(b,60,'green','sneakyVine'),b);
 b={...b,time:12};assert.equal(spellCooldownRemaining(b,'sneakyVine'),0);assert.equal(launchSpell(b,60,'green','sneakyVine',0,()=>.99).casts,2);
});
test('bottled Sneaky Vine targets the furthest enemy without starting a cooldown',()=>{
 let b=field();b.potions.spellBottle=1;b.bottledSpells=[{spellId:'sneakyVine',quality:60}];b=drinkPotion(b,'spellBottle');for(let i=0;i<7;i++)b=stepBattle(b,.1);
 assert.equal(b.enemies[1].hp,973);assert.equal(b.enemies[0].hp,1000);assert.equal(spellCooldownRemaining(b,'sneakyVine'),0);assert.equal(b.vineGrab?.targetId,2);
});
test('Sneaky Vine can Black Flash at Steady but not Faint, without changing other targets',()=>{
 const b=field();b.blackFlash.enabled=true;const flash=launchSpell(b,60,'green','sneakyVine',0,()=>0);assert.equal(flash.enemies[1].hp,946);assert.equal(flash.blackFlash.chain,true);assert.equal(flash.blackFlashBurst?.x,450);
 assert.equal(launchSpell(b,59,'green','sneakyVine',0,()=>0).blackFlashBurst,null);
});
test('fizzles and no living target do not spend the vine cooldown or create a grab',()=>{
 const b=field();assert.equal(launchSpell(b,47,'green','sneakyVine').vineGrab,null);assert.equal(spellCooldownRemaining(launchSpell(b,47,'green','sneakyVine'),'sneakyVine'),0);
 const empty={...b,enemies:b.enemies.map(e=>({...e,hp:0}))};const noTarget=launchSpell(empty,60,'green','sneakyVine');assert.equal(noTarget.vineGrab,null);assert.equal(spellCooldownRemaining(noTarget,'sneakyVine'),0);
});
