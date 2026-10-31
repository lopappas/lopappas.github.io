import {test} from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {PaletteGroup} from '../src/PaletteGroup.ts';
import {TargetCaret} from '../src/TargetCaret.ts';
import {COMMON_POTIONS,RARE_POTIONS,POTIONS,potionPrice,rollRewardPotion,newBattle,launchSpell,drinkPotion,stepBattle,enemyElementColor,spellDamage} from '../src/battle.ts';
import {newRun,enterNode,finishBattle,battleForRun,ROUTE} from '../src/run.ts';
import {SPELLS,type SpellId} from '../src/magic.ts';
function advance(b:ReturnType<typeof newBattle>,seconds:number){for(let i=0;i<Math.round(seconds*100);i++)b=stepBattle(b,.01);return b;}
function setup(){const b=newBattle('active');b.approachAt=1000;b.enemies[0]={...b.enemies[0],element:'Neutral',hp:10000,maxHP:10000,x:400};return b;}
test('target caret retains its element color throughout partial and full Chronos grayscale',()=>{
 for(const amount of [.1,.5,1])for(const element of ['Fire','Water','Nature','Neutral'] as const){const markup=renderToStaticMarkup(React.createElement('svg',null,React.createElement(PaletteGroup,{amount},React.createElement('path',{fill:'#f00'}),React.createElement(TargetCaret,{element}))));assert.ok(markup.includes(`stroke="${enemyElementColor(element)}"`));assert.ok(!markup.includes('fill="#f00"'));}
});
test('each merchant guarantees a rare potion and prices all common/rare and fallback offers correctly',()=>{
 for(const node of ROUTE.flatMap((n,i)=>n.kind==='shop'?[i]:[]))for(const roll of [0,.2,.5,.7,.999])for(const all of [false,true]){const r=enterNode({...newRun(),screen:'map',node,spells:all?SPELLS.map(s=>s.id):newRun().spells},()=>roll);const bottles=r.stock.filter(s=>s.kind==='potion');assert.ok(bottles.some(s=>RARE_POTIONS.includes(s.item as any)));for(const s of bottles)assert.equal(s.price,RARE_POTIONS.includes(s.item as any)?36:18);assert.equal(r.stock.length,6);assert.equal(new Set(r.stock.map(s=>s.id)).size,6);}
 for(const id of COMMON_POTIONS)assert.equal(potionPrice(id),18);for(const id of RARE_POTIONS)assert.equal(potionPrice(id),36);
 assert.deepEqual([...RARE_POTIONS].sort(),['fury','rejection','spellBottle']);assert.equal(POTIONS.fury.detail,'Your next spell deals twice as much damage. Make it count.');
});
test('reward rarity is exactly 70 percent common / 30 percent rare; selection within each tier is uniform',()=>{
 let common=0,rare=0;for(let i=0;i<1000;i++){let call=0;const id=rollRewardPotion(()=>call++===0?(i+.5)/1000:.5);if(COMMON_POTIONS.includes(id))common++;else rare++;}assert.equal(common,700);assert.equal(rare,300);
 for(const [rarity,pool] of [[.699999,COMMON_POTIONS],[.7,RARE_POTIONS]] as const)for(let i=0;i<3;i++){let call=0;assert.equal(rollRewardPotion(()=>call++===0?rarity:(i+.5)/3),pool[i]);}
 const run={...newRun(),screen:'battle' as const};const b={...battleForRun(run),phase:'victory' as const};assert.equal(finishBattle(run,b,()=>.35).reward?.potion,null);
 for(const scarf of [false,true])for(const rarity of [.1,.8]){const values=scarf?[rarity,.5]:[.1,rarity,.5];const r=finishBattle({...run,relics:scarf?['twillyScarf']:[]},b,()=>values.shift()??0);assert.ok((rarity<.7?COMMON_POTIONS:RARE_POTIONS).includes(r.reward!.potion!));}
});
test('Fury activates on potion impact and consumes on release, doubling only the next hit and its burn',()=>{
 for(const id of ['water','fire','nature','wave','bolt','leaf'] as const){const base=setup();base.damageBonus=1.15;base.upgrades[id]=1;base.amulets.sun=true;
 let b={...base,potions:{...base.potions,fury:1}};b=drinkPotion(b,'fury');assert.equal(b.furyReady,false);b=advance(b,.66);assert.equal(b.furyReady,true);
 const normal=advance(launchSpell(base,69,'#fff',id),.33);b=launchSpell(b,69,'#fff',id);assert.equal(b.furyReady,false);assert.equal(b.projectile?.damageMultiplier,2);b=advance(b,.33);assert.equal(10000-b.enemies[0].hp,2*(10000-normal.enemies[0].hp));assert.equal(b.enemies[0].push?.to,normal.enemies[0].push?.to);if(normal.enemies[0].burn)assert.equal(b.enemies[0].burn?.damage,normal.enemies[0].burn.damage*2);
 b=advance(b,.3);b=launchSpell(b,69,'#fff',id);assert.equal(b.projectile?.damageMultiplier,1);
 }
});
test('fizzles consume Fury while cancelled/blocked launches and earlier in-flight spells preserve it',()=>{
 let b=setup();b.furyReady=true;assert.equal(launchSpell(b,47,'#fff').furyReady,false);assert.equal(launchSpell({...b,phase:'ready'},80,'#fff').furyReady,true);assert.equal(launchSpell({...b,enemies:[]},80,'#fff').furyReady,false);
 b=launchSpell(setup(),60,'#fff');b.potions.fury=1;b=drinkPotion(b,'fury');b=advance(b,.66);assert.equal(b.furyReady,true);assert.equal(10000-b.enemies[0].hp,spellDamage({element:'Neutral'},60,'water'));
 b.potions.spellBottle=1;b.bottledSpells=[{spellId:null,quality:15}];b=advance(drinkPotion(b,'spellBottle'),.66);assert.equal(b.furyReady,true);
});
test('Fury skips stored spells and is consumed by a drawn zero-damage Chronos without increasing durations',()=>{
 let b=setup();b.furyReady=true;b.potions.spellBottle=1;b.bottledSpells=[{spellId:'fire',quality:60}];b=advance(drinkPotion(b,'spellBottle'),.66);assert.equal(b.furyReady,true);assert.equal(10000-b.enemies[0].hp,spellDamage({element:'Neutral'},60,'fire'));
 b=setup();b.furyReady=true;b=advance(launchSpell(b,70,'#fff','chronos'),.33);assert.equal(b.furyReady,false);assert.equal(b.enemies[0].hp,10000);assert.ok(Math.abs(b.enemies[0].stunUntil-b.time-5.1)<.02);
});
test('unused Fury survives rewards and the next battle without multiplying subsequent charges',()=>{
 const run={...newRun(),screen:'battle' as const},b={...battleForRun(run),phase:'victory' as const,furyReady:true};const r=finishBattle(run,b,()=>.99);assert.equal(r.furyReady,true);assert.equal(battleForRun(r).furyReady,true);
 let charged=setup();charged.furyReady=true;charged.potions.fury=1;charged=advance(drinkPotion(charged,'fury'),.66);assert.equal(launchSpell(charged,80,'#fff').projectile?.damageMultiplier,2);
});
test('every stored spell and stored fizzle leaves Fury for the next drawn cast, including after bottle flight begins',()=>{
 for(const id of [...SPELLS.map(s=>s.id),null] as (SpellId|null)[]){
  const make=()=>{const b=setup();b.potions.spellBottle=1;b.bottledSpells=[{spellId:id,quality:id?80:15,inkUsed:50}];b.lotus=true;b.lotusReady=true;b.colorful=true;b.lastElement='Water';b.midnightStone=true;return b;};
  for(const timing of ['before','during'] as const){
   let normal=make(),charged=structuredClone(normal);
   if(timing==='before')charged.furyReady=true;
   normal=drinkPotion(normal,'spellBottle');charged=drinkPotion(charged,'spellBottle');
   normal=advance(normal,.3);charged=advance(charged,.3);if(timing==='during')charged.furyReady=true;
   normal=advance(normal,.36);charged=advance(charged,.36);
   assert.equal(charged.furyReady,true);assert.deepEqual(charged.enemies,normal.enemies);assert.deepEqual(charged.firestorm,normal.firestorm);
   assert.equal(charged.lotusReady,normal.lotusReady);assert.equal(charged.lastElement,normal.lastElement);
   const withoutFury=launchSpell({...charged,furyReady:false},60,'#fff','water');
   charged=launchSpell(charged,60,'#fff','water');assert.equal(charged.furyReady,false);
   assert.equal(charged.projectile?.damageMultiplier,2*withoutFury.projectile!.damageMultiplier);
  }
 }
});
