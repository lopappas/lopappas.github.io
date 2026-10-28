import {test} from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {TargetCaret} from '../src/TargetCaret.ts';
import {midnightBonus,newBattle,hitWithSpell,launchSpell,stepBattle,fizzleSpell,drinkPotion,presentEnemies,enemyElementColor,spellDamage} from '../src/battle.ts';
import {newRun,battleForRun,finishBattle,RELICS,enterNode,camp,sealBottle} from '../src/run.ts';
import {SPELLS,inkCost} from '../src/magic.ts';
import {soundSamples,SOUND_RATE} from '../src/sound.ts';
function advance(b:ReturnType<typeof newBattle>,seconds:number){for(let i=0;i<Math.round(seconds*100);i++)b=stepBattle(b,.01);return b;}
test('Midnight Stone follows every ink threshold, using a maximum of 20 flat damage',()=>{
 for(const [ink,damage] of [[0,0],[19.99,0],[20,2],[24.99,2],[25,3],[29.99,3],[30,5],[35,7],[40,10],[45,15],[50,20],[100,20]])assert.equal(midnightBonus(ink),damage);
 assert.equal(midnightBonus(NaN),0);assert.equal(midnightBonus(-3),0);
 const normal=inkCost({x:0,y:0},{x:150,y:0},100);assert.equal(midnightBonus(normal),3);assert.equal(midnightBonus(normal*.8),2);
});
test('flat damage is added once after shields, rocky/elemental defenses, upgrades, relics and Fury',()=>{
 for(const element of ['Fire','Water','Nature','Neutral'] as const)for(const quality of [48,60,80])for(const rocky of [false,true]){
  const b=newBattle('active','shieldPack');b.damageBonus=1.15;b.upgrades.fire=1;b.enemies[0]={...b.enemies[0],element,rocky,hp:10000,maxHP:10000};
  const plain=hitWithSpell(b,quality,'fire',1,()=>0,2,50);b.midnightStone=true;const stone=hitWithSpell(b,quality,'fire',1,()=>0,2,50);assert.equal(plain.enemies[0].hp-stone.enemies[0].hp,20);assert.deepEqual(stone.enemies[0].burn,plain.enemies[0].burn);assert.deepEqual(stone.enemies[0].push,plain.enemies[0].push);
 }
});
test('Midnight can give Chronos flat damage to each present foe without changing its control effects',()=>{
 const b=newBattle('active','pack');b.midnightStone=true;const hit=hitWithSpell(b,70,'chronos',undefined,()=>0,2,35);assert.ok(hit.enemies.every(e=>e.hp===93&&e.stunUntil===5.1));
});
test('ink usage is preserved on a projectile and individually stored bottles',()=>{
 let b=newBattle('active');b.midnightStone=true;b.enemies[0]={...b.enemies[0],element:'Neutral',hp:1000,maxHP:1000};b=launchSpell(b,60,'#fff','water',45);assert.equal(b.projectile?.inkUsed,45);b=advance(b,.33);assert.equal(1000-b.enemies[0].hp,spellDamage({element:'Neutral'},60,'water')+15);
 let r={...newRun(),pendingBottle:true,potions:{heal:0,freeze:0,ink:0,spellBottle:1},relics:['midnightStone' as const]};const sealed=sealBottle(r,{spellId:'water',quality:60,inkUsed:50});assert.equal(sealed.bottledSpells[0].inkUsed,50);
 b=battleForRun(sealed,()=>0);b.enemies[0].element='Neutral';b=advance(drinkPotion(b,'spellBottle'),.66);assert.equal(100-b.enemies[0].hp,spellDamage({element:'Neutral'},60,'water')+20);
});
test('Midnight is available from merchants, elite drops and the live battle relic state',()=>{
 const relics=(Object.keys(RELICS) as Array<keyof typeof RELICS>).filter(id=>id!=='midnightStone');const r={...newRun(),screen:'map' as const,node:2,relics};assert.ok(enterNode(r,()=>0).stock.some(s=>s.item==='midnightStone'));
 const reward=finishBattle({...r,screen:'battle',node:3},{...newBattle('active'),phase:'victory'},()=>0).reward;assert.equal(reward?.relic,'midnightStone');assert.equal(battleForRun({...newRun(),relics:['midnightStone']}).midnightStone,true);
});
test('Fury is spent by completed fizzles and non-damaging spells; cancellations alone do not spend it',()=>{
 let b=newBattle('active');b.furyReady=true;assert.equal(fizzleSpell(b).furyReady,false);assert.equal(fizzleSpell({...b,phase:'ready'}).furyReady,true);assert.equal(launchSpell(b,12,'#fff').furyReady,false);assert.equal(launchSpell(b,70,'#fff','chronos').furyReady,false);
 b.potions.spellBottle=1;b.bottledSpells=[{spellId:null,quality:20}];assert.equal(advance(drinkPotion(b,'spellBottle'),.66).furyReady,false);
});
test('every second combat offers three distinct unknown spells, or all remaining spells when fewer exist',()=>{
 for(const combats of [0,1,2,3,5,7])for(const remaining of [0,1,2,3,4]){
  const r={...newRun(),screen:'battle' as const,combats,spells:SPELLS.slice(0,SPELLS.length-remaining).map(s=>s.id)},b={...battleForRun(r),phase:'victory' as const};const reward=finishBattle(r,b,()=>.4).reward!;assert.equal(reward.offers.length,(combats+1)%2===0?Math.min(3,remaining):0);assert.equal(new Set(reward.offers).size,reward.offers.length);assert.ok(reward.offers.every(s=>!r.spells.includes(s)));
 }
});
test('both camps restore 70 HP capped at 100 and the cozy rest jingle is bounded',()=>{
 for(const node of [4,9])for(const health of [1,29,30,60,100]){const r=camp({...newRun(),screen:'camp',node,health});assert.equal(r.health,Math.min(100,health+70));assert.equal(camp(r),r);}
 const samples=soundSamples('rest');assert.equal(samples.length,Math.ceil(SOUND_RATE*1.25));assert.equal(Math.abs(samples[0]),0);assert.ok(Math.abs(samples.at(-1)!)<.002);assert.ok(samples.every(s=>Number.isFinite(s)&&Math.abs(s)<=.901));assert.ok(samples.some(s=>Math.abs(s)>.1));
});
test('upper meadow has one random slime plus a separately rolled shield slime arriving at seven seconds',()=>{
 const combinations=new Set<string>();for(const a of [0,.4,.8])for(const c of [0,.4,.8]){let roll=0;let b=battleForRun({...newRun(),node:5},()=>roll++?c:a);combinations.add(b.enemies.map(e=>e.element).join('/'));assert.equal(b.encounter,'upperMeadow');assert.equal(presentEnemies(b).length,1);assert.equal(b.enemies[0].shield,null);assert.ok(b.enemies[1].shield);assert.equal(b.enemies[1].spawnAt,7);assert.ok(b.enemies.every(e=>e.hp===100));b.enemies[0].hp=0;b=advance(b,6.99);assert.equal(b.phase,'active');assert.equal(presentEnemies(b).length,0);b=advance(b,.02);assert.equal(presentEnemies(b).length,1);assert.equal(presentEnemies(b)[0].id,2);}
 assert.equal(combinations.size,9);
});
test('target caret is thicker, non-elemental dark gray, and retains its palette boundary',()=>{
 assert.equal(enemyElementColor('Neutral'),'#45474c');const markup=renderToStaticMarkup(React.createElement('svg',null,React.createElement(TargetCaret,{element:'Neutral'})));assert.ok(markup.includes('stroke-width="4.5"'));assert.ok(markup.includes('stroke="#45474c"'));
});
