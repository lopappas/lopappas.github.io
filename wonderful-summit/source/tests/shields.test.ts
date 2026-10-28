import {test} from 'node:test';
import assert from 'node:assert/strict';
import {newBattle,hitWithSpell,stepBattle,spellDamage,spellKnockback,presentEnemies,nearestEnemy,drinkPotion,CONTACT_X} from '../src/battle.ts';
import {woodenShield,igniteShield,shieldProtection} from '../src/shields.ts';
import {SPELLS} from '../src/magic.ts';
import {newRun,battleForRun,ROUTE} from '../src/run.ts';
function advance(b:ReturnType<typeof newBattle>,seconds:number){for(let i=0;i<Math.round(seconds*100);i++)b=stepBattle(b,.01);return b;}
test('shield encounter starts two 100 HP elemental shield slimes and reveals a 150 HP rock slime at eight seconds',()=>{
 const seen=new Set<string>();for(const a of [0,.4,.8])for(const c of [0,.4,.8]){let i=0;const b=newBattle('active','shieldPack',()=>i++?c:a);seen.add(b.enemies.slice(0,2).map(e=>e.element).join('/'));assert.equal(presentEnemies(b).length,2);assert.equal(b.enemies[0].hp,100);assert.equal(b.enemies[1].hp,100);assert.ok(b.enemies[0].shield&&b.enemies[1].shield);assert.equal(b.enemies[2].hp,150);assert.equal(b.enemies[2].rocky,true);assert.equal(b.enemies[2].shield,null);assert.equal(b.enemies[2].spawnAt,8);b.time=8;assert.equal(presentEnemies(b).length,3);}
 assert.equal(seen.size,9);const node=ROUTE.findIndex(n=>n.kind==='battle'&&n.encounter==='shieldPack');assert.ok(node>=0);assert.equal(battleForRun({...newRun(),node}).encounter,'shieldPack');
});
test('wooden shields halve damage and knockback before rounding for every damage spell and enemy element',()=>{
 for(const element of ['Fire','Water','Nature','Neutral'] as const)for(const s of SPELLS.filter(s=>s.id!=='chronos')){
 const e={element,rocky:false,shield:woodenShield()};const raw=spellDamage({...e,shield:null},100,s.id,1.15,1);
 assert.ok(Math.abs(spellDamage(e,100,s.id,1.15,1)-raw*.5)<=.5);
 assert.equal(spellKnockback(100,s.id,1.25,element,false,e.shield),spellKnockback(100,s.id,1.25,element)*.5);
 }
});
test('any valid fire spell ignites wood regardless of element, rocky immunity, enemy kind or cast grade',()=>{
 for(const kind of ['slime','elite'] as const)for(const element of ['Fire','Water','Nature','Neutral'] as const)for(const q of [48,59,60,69,70,80,100])for(const id of ['fire','bolt'] as const){const b=newBattle('active',kind);b.time=7;b.enemies[0]={...b.enemies[0],element,rocky:true,shield:woodenShield(),hp:1000,maxHP:1000};const e=hitWithSpell(b,q,id).enemies[0];assert.equal(e.shield?.burnUntil,9);assert.equal(e.push,null);assert.equal(e.attackAt,null);}
 assert.equal(igniteShield(woodenShield(),'Fire',47,0).burnUntil,null);
});
test('burning shield locks movement and attacks for exactly two seconds; repeated hits never extend it',()=>{
 let b=newBattle('active','slime');b.approachAt=0;b.enemies[0]={...b.enemies[0],shield:woodenShield(),x:CONTACT_X,attackAt:.01,hp:1000,maxHP:1000};b=hitWithSpell(b,48,'fire');b=advance(b,1);b=hitWithSpell(b,60,'water');b=hitWithSpell(b,48,'fire');assert.equal(b.enemies[0].shield?.burnUntil,2);b=advance(b,.99);assert.equal(b.enemies[0].x,CONTACT_X);assert.equal(b.playerHP,100);assert.equal(b.enemies[0].clock,0);assert.ok(b.enemies[0].shield);b=advance(b,.02);assert.equal(b.enemies[0].shield,null);assert.equal(b.playerHP,100);assert.ok(b.enemies[0].attackAt!==null);
});
test('armor persists during burning, then disappears permanently; burn ticks use armor at the tick time',()=>{
 let b=newBattle('active','slime');b.enemies[0]={...b.enemies[0],element:'Neutral',shield:woodenShield(),hp:1000,maxHP:1000};b=hitWithSpell(b,100,'bolt');const hp=b.enemies[0].hp;b=advance(b,1.01);assert.equal(hp-b.enemies[0].hp,8);const afterFirst=b.enemies[0].hp;b=advance(b,1);assert.equal(b.enemies[0].shield,null);assert.equal(afterFirst-b.enemies[0].hp,16);const hit=hitWithSpell(b,60,'water');assert.equal(b.enemies[0].hp-hit.enemies[0].hp,spellDamage({element:'Neutral'},60,'water'));
 assert.equal(shieldProtection({material:'wood',burnUntil:2},1.99),.5);assert.equal(shieldProtection({material:'wood',burnUntil:2},2),1);
});
test('unburned shields reduce contact ward knockback and accept control effects; freeze does not postpone destruction',()=>{
 let b=newBattle('active','slime');b.approachAt=0;b.enemies[0]={...b.enemies[0],shield:woodenShield(),x:CONTACT_X,attackAt:0};const pushed=stepBattle(b,.01);assert.equal(pushed.enemies[0].push!.to-CONTACT_X,52.5);
 const controlled=hitWithSpell(b,60,'chronos');assert.equal(controlled.enemies[0].slowUntil,2.5);assert.equal(controlled.enemies[0].shield?.burnUntil,null);
 b=drinkPotion(hitWithSpell(b,48,'fire'),'freeze');b=advance(b,2.01);assert.equal(b.enemies[0].shield,null);assert.ok(b.freezeUntil>b.time);
});
test('reinforcement prevents early victory and cannot be targeted, controlled or damaged before its arrival',()=>{
 let b=newBattle('active','shieldPack');b.enemies[0].hp=0;b.enemies[1].hp=0;b=advance(b,7.99);assert.equal(b.phase,'active');assert.equal(nearestEnemy(b),undefined);assert.equal(hitWithSpell(b,100,'chronos'),b);assert.equal(b.enemies[2].hp,150);b=advance(b,.02);assert.equal(nearestEnemy(b)?.id,3);assert.equal(presentEnemies(b).length,1);
});
