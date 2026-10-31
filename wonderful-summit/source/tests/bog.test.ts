import {test} from 'node:test';
import assert from 'node:assert/strict';
import {bogEffect} from '../src/bog.ts';
import {SPELLS,recognize,PLAYER_SPELLS,DRUDGE_BOG_VARIANTS,SPELL_VARIATIONS} from '../src/magic.ts';
import {newBattle,launchSpell,stepBattle,bogSlow,bogTickDamage,drinkPotion} from '../src/battle.ts';
import {newRun,enterNode,finishBattle,camp,spellPrice} from '../src/run.ts';
import {spellUpgradePreview} from '../src/spellbook.ts';
function setup(){const b=newBattle('active','pack',()=>0);b.approachAt=1000;for(const e of b.enemies){e.element='Neutral';e.hp=e.maxHP=1000;}return b;}
function advance(b:ReturnType<typeof setup>,seconds:number,dt=.01){for(let i=0;i<Math.round(seconds/dt);i++)b=stepBattle(b,dt);return b;}
test('all three named Bog variants score as one spell without altering canonical art',()=>{
 const original=SPELLS.find(s=>s.id==='bog')!,before=structuredClone(original);
 assert.deepEqual(Object.keys(DRUDGE_BOG_VARIANTS),['variant1','variant2','variant3']);
 assert.deepEqual(SPELL_VARIATIONS.bog,Object.values(DRUDGE_BOG_VARIANTS));
 for(const variant of Object.values(DRUDGE_BOG_VARIANTS))for(const scale of [.15,1,5]){
  const drawing=[...variant].reverse().map(st=>[...st].reverse().map(p=>({x:230+p.x*scale,y:-50+p.y*scale})));
  const match=recognize(drawing);assert.equal(match.spell,original);assert.equal(match.quality,100);assert.equal(match.candidates.filter(c=>c.spell.id==='bog').length,1);
  assert.equal(recognize(drawing,['water','fire','nature']).spell,null);
 }
 const v1=DRUDGE_BOG_VARIANTS.variant1,v2=DRUDGE_BOG_VARIANTS.variant2,v3=DRUDGE_BOG_VARIANTS.variant3;
 for(let side=0;side<2;side++){
  const center=side===0?24:76;
  for(let st=0;st<2;st++)assert.deepEqual(v1[side*2+st],SPELL_VARIATIONS.nature![0][st].map(p=>({x:center+(p.x-50)*.5,y:14+p.y*.5})));
 }
 assert.deepEqual(v2.slice(0,4),original.strokes.slice(0,4));assert.deepEqual(v3.slice(0,4),v1.slice(0,4));
 for(const variant of [v2,v3])assert.deepEqual(variant[4],original.strokes[4].map(p=>({...p,y:p.y+4})));
 assert.deepEqual(original,before);
});
test('bog quality endpoints and one upgrade match all durations, slow strengths and damage tiers',()=>{
 for(const [q,d,s,damage] of [[48,4,.5,1],[59,5,.55,1],[60,6,.6,1.5],[69,8,.64,1.5],[70,10,.66,2],[79,13,.7,2],[80,15,.74,2.5],[100,20,.78,2.5]]){
  const e=bogEffect(q);assert.equal(e.duration,d);assert.ok(Math.abs(e.slow-s)<1e-9);assert.equal(e.damage,damage);
  const up=bogEffect(q,1);assert.equal(up.damage,damage+1);assert.ok(Math.abs(up.slow-s-.08)<1e-9);assert.equal(up.duration,d);assert.deepEqual(bogEffect(q,4),up);
 }for(const q of [0,47,NaN,Infinity])assert.equal(bogEffect(q).duration,0);
});
test('approved sigil is recognized at any size, position and stroke order',()=>{
 const s=SPELLS.find(s=>s.id==='bog')!;assert.equal(s.rarity,'Uncommon');assert.equal(s.strokes.length,5);
 const [left,stem,right,rightStem,baseline]=s.strokes;assert.deepEqual(right,left.map(p=>({x:100-p.x,y:p.y})).reverse());assert.deepEqual(rightStem,stem.map(p=>({x:100-p.x,y:p.y})));assert.equal(baseline[0].y,baseline[1].y);assert.equal(baseline[0].x+baseline[1].x,100);
 for(const scale of [.2,1,4]){const strokes=[...s.strokes].reverse().map(st=>[...st].reverse().map(p=>({x:p.x*scale+200,y:p.y*scale-40})));const r=recognize(strokes);assert.equal(r.spell?.id,'bog');assert.equal(r.quality,100);}
});
test('bog arrives after one second, then ticks on every present foe without knockback',()=>{
 let b=launchSpell(setup(),60,'#9bbe72','bog');assert.equal(b.projectile,null);assert.equal(b.casts,1);b=advance(b,.99);assert.equal(bogSlow(b,b.enemies[0],b.time),0);b=advance(b,.02);assert.equal(bogSlow(b,b.enemies[0],b.time),.6);b=advance(b,.49);assert.ok(b.enemies.every(e=>e.hp===998.5&&e.push===null));
 b=advance(b,5.5);assert.equal(b.bog,null);assert.ok(b.enemies.every(e=>e.hp===982));
});
test('recasts append their own quality and upgrade without another arrival delay',()=>{
 let b=launchSpell(setup(),48,'#9bbe72','bog');b=advance(b,2);b.upgrades.bog=1;b=launchSpell(b,80,'#9bbe72','bog');assert.equal(b.bog!.arrives,1);assert.equal(b.bog!.portions.at(-1)!.until,20);assert.equal(b.bog!.portions[1].upgrade,1);b=advance(b,3.1);assert.equal(bogSlow(b,b.enemies[0],b.time),.82);
});
test('elemental and rocky defenses apply to damage and slowing',()=>{
 const b=launchSpell(setup(),60,'#9bbe72','bog');b.time=2;const e=b.enemies[0];assert.equal(bogSlow(b,{...e,element:'Nature'},2),0);assert.equal(bogSlow(b,{...e,element:'Fire'},2),.6);assert.equal(bogTickDamage({element:'Nature'},60),.75);assert.equal(bogTickDamage({element:'Fire'},60),1.125);assert.equal(bogTickDamage({element:'Water'},60),2.25);
 const faint=launchSpell(setup(),48,'#9bbe72','bog');assert.equal(bogSlow(faint,{...e,rocky:true},2),0);assert.equal(bogTickDamage({element:'Neutral',rocky:true},48),.5);
});
test('reinforcements enter the active bog; fractional ticks, end cleanup and frame rates remain consistent',()=>{
 let b=setup();b.enemies[1].spawnAt=2;const launched=launchSpell(b,80,'#9bbe72','bog'),before=structuredClone(launched);const fine=advance(launched,4),coarse=advance(launched,4,.1);assert.deepEqual(launched,before);assert.deepEqual(fine.enemies.map(e=>e.hp),coarse.enemies.map(e=>e.hp));assert.equal(fine.enemies[1].hp,987.5);assert.equal(bogSlow(fine,fine.enemies[1],4),.74);
});
test('bottles preserve Fury; damage relics snapshot per cast and do not add burn',()=>{
 let b=setup();b.midnightStone=true;b.damageBonus=1.15;b.furyReady=true;b.lotus=true;b.lotusReady=true;b.colorful=true;b.lastElement='Fire';b.potions.spellBottle=1;b.bottledSpells=[{spellId:'bog',quality:60,inkUsed:55}];b=advance(drinkPotion(b,'spellBottle'),.66);assert.equal(b.furyReady,true);assert.ok(b.bog);const p=b.bog!.portions[0];assert.equal(p.midnight,.2);assert.equal(p.multiplier,1.3*1.15);b=advance(b,1.5);assert.ok(b.enemies.every(e=>e.hp<998.5&&e.burn===null));
});
test('bog is available to merchants and spell rewards, costs uncommon price, and upgrades once',()=>{
 const known=PLAYER_SPELLS.filter(s=>s.id!=='bog').map(s=>s.id),r={...newRun(),screen:'map' as const,node:2,spells:known};assert.ok(enterNode(r,()=>0).stock.some(s=>s.item==='bog'&&s.price===spellPrice('bog')));const b=setup();b.phase='victory';assert.deepEqual(finishBattle({...r,screen:'battle',combats:1},b,()=>0).reward!.offers,['bog']);const c={...r,screen:'camp' as const,spells:[...known,'bog' as const]};const upgraded=camp(c,'bog');assert.equal(upgraded.upgrades.bog,1);assert.equal(camp({...upgraded,campUsed:false},'bog').campUsed,false);assert.equal(spellUpgradePreview('bog')?.bog,true);
});
