import test from 'node:test';
import assert from 'node:assert/strict';
import {SPELLS,PLAYER_SPELLS,recognize,isUpgradableSpell} from '../src/magic.ts';
import {newBattle,launchSpell,stepBattle,hitWithSpell,rollAlchemizePotion,alchemizeBlockReason,spellDamage,spellKnockback,drinkPotion,COMMON_POTIONS,RARE_POTIONS,type Battle} from '../src/battle.ts';
import {newRun,battleForRun,rollSpellOffers,buy,enterNode,finishBattle} from '../src/run.ts';
const spell=SPELLS.find(s=>s.id==='alchemize')!;
function field(){const b=newBattle('active');b.approachAt=1000;b.potions={heal:0,freeze:0,ink:0};return b;}
function advance(b:Battle,seconds:number){for(let i=0;i<Math.round(seconds*100);i++)b=stepBattle(b,.01);return b;}
test('Alchemize is a Legendary Ancient spell using the approved two-stroke cork bottle and no damage upgrade',()=>{
 assert.equal(spell.rarity,'Legendary');assert.equal(spell.element,'Ancient');assert.equal(isUpgradableSpell('alchemize'),false);assert.equal(spell.strokes.length,2);
 for(const scale of [.2,1,4]){const strokes=spell.strokes.slice().reverse().map(s=>s.slice().reverse().map(p=>({x:70+p.x*scale,y:-13+p.y*scale})));const match=recognize(strokes);assert.equal(match.spell?.id,'alchemize');assert.equal(match.quality,100);}
});
test('every tier rolls the exact common/higher-tier odds, with healing only from Beautiful upwards',()=>{
 for(const [q,rare] of [[48,0],[59,0],[60,100],[69,100],[70,250],[79,250],[80,1000],[100,1000]]){
  let higher=0;for(let i=0;i<1000;i++){let n=0;const result=rollAlchemizePotion(q,()=>n++?.5:(i+.5)/1000)!;assert.notEqual(result,'spellBottle');if(RARE_POTIONS.includes(result))higher++;else{assert.ok(COMMON_POTIONS.includes(result));if(q<70)assert.notEqual(result,'heal');}}assert.equal(higher,rare);
 }
 for(const q of [0,47,NaN,Infinity])assert.equal(rollAlchemizePotion(q),null);
 let n=0;assert.equal(rollAlchemizePotion(70,()=>n++?0:.99),'heal');
 for(const q of [48,60,70,80])for(let i=0;i<100;i++){let n=0;assert.notEqual(rollAlchemizePotion(q,()=>n++?(i+.5)/100:0),'spellBottle');}
});
test('a successful cast creates one potion instantly, causes no damage or push, and preserves Lotus',()=>{
 let b=field();b.lotus=true;b.lotusReady=true;const old=structuredClone(b);b=launchSpell(b,80,spell.color,'alchemize',0,()=>0);
 assert.equal(b.alchemizeUsed,true);assert.equal(b.casts,1);assert.equal(b.alchemizedPotion,'rejection');assert.equal(b.potions.rejection,1);assert.equal(b.projectile,null);assert.equal(b.lotusReady,true);assert.deepEqual(b.enemies,old.enemies);assert.equal(spellDamage({element:'Neutral'},100,'alchemize',10,1),0);assert.equal(spellKnockback(100,'alchemize',10),0);
 const snapshot=structuredClone(b);assert.equal(launchSpell(b,100,spell.color,'alchemize'),b);assert.deepEqual(b,snapshot);
 assert.equal(battleForRun(newRun()).alchemizeUsed,false);
});
test('full purses, rejected casts and fizzles preserve the once-per-battle use and all casting bonuses',()=>{
 const b=field();b.potions.heal=3;b.furyReady=true;b.stellarReady=true;const snapshot=structuredClone(b);
 assert.equal(alchemizeBlockReason(b),'Your purse is full');assert.equal(launchSpell(b,100,spell.color,'alchemize'),b);assert.deepEqual(b,snapshot);
 b.potionCapacity=5;assert.equal(alchemizeBlockReason(b),null);assert.equal(launchSpell(b,60,spell.color,'alchemize',0,()=>.99).alchemizeUsed,true);
 assert.equal(launchSpell(field(),47,spell.color,'alchemize').alchemizeUsed,false);assert.equal(battleForRun({...newRun(),relics:['birkinStock']}).potionCapacity,5);
});
test('bottled Alchemize consumes the same battle use, reserves it in flight, and leaves a spent bottle unconsumed',()=>{
 let b=field();b.potions.spellBottle=1;b.bottledSpells=[{spellId:'alchemize',quality:80}];b=drinkPotion(b,'spellBottle');assert.equal(launchSpell(b,100,spell.color,'alchemize'),b);b=advance(b,.66);assert.equal(b.alchemizeUsed,true);assert.equal(b.casts,1);assert.equal(Object.values(b.potions).reduce((a,n)=>a+n,0),1);
 b.potions.spellBottle=1;b.bottledSpells=[{spellId:'alchemize',quality:80}];assert.equal(drinkPotion(b,'spellBottle'),b);
});
test('Alchemize can appear in rewards and Random spell purchases, and an owned spell is excluded',()=>{
 const run={...newRun(),screen:'map' as const,node:2,gold:100,spells:PLAYER_SPELLS.filter(s=>s.id!=='alchemize').map(s=>s.id)};
 assert.deepEqual(rollSpellOffers(run,()=>0),['alchemize']);assert.deepEqual(buy(enterNode(run,()=>0),'random-spell',()=>0).pendingSpellOffers,['alchemize']);
 assert.deepEqual(finishBattle({...run,screen:'battle',combats:2},{...battleForRun(run),phase:'victory'},()=>0).reward?.offers,['alchemize']);assert.deepEqual(rollSpellOffers({...run,spells:[...run.spells,'alchemize']},()=>0),[]);
});
