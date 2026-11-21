import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SPELLS,applyRecognitionBonus,grade,spellPower,type SpellId,type RecognitionResult} from '../src/magic.ts';
import {spellDamage,spellKnockback,launchSpell,stepBattle,drinkPotion} from '../src/battle.ts';
import {battleForRun,newRun} from '../src/run.ts';
import {nearKnockback} from '../src/nearSpells.ts';

// Captured from release 0.3.6 before changing the Faint threshold.
const baseline=JSON.parse(readFileSync(new URL('./fixtures/faint-balance-0.3.6.json',import.meta.url),'utf8')) as {q:number;id:SpellId;power:number;damage:number;push:number}[];
test('wider Faint preserves both endpoints and 60–100 values for spells with unchanged balance',()=>{
 for(const row of baseline){
  const q=row.q===48?45:row.q;
  assert.equal(spellPower(row.id,q),row.power,`${row.id} power ${q}`);
  // Flame Blade was rebalanced after this fixture and has its own checks in nearSpells.test.ts.
  if(row.id==='flameBlade')continue;
  // Puddle Guard gained chip damage. Its knockback still matches the baseline.
  if(row.id!=='puddleGuard')assert.equal(spellDamage({element:'Neutral'},q,row.id),row.damage,`${row.id} damage ${q}`);
  assert.equal(spellKnockback(q,row.id),row.push,`${row.id} knockback ${q}`);
 }
});
test('Faint interpolates over 45–59, remains monotonic and retains actual score labels',()=>{
 for(let q=45;q<=59;q++){
  const t=(q-45)/14;
  assert.equal(grade(q),'Faint');
  assert.equal(spellPower('water',q),Math.round(7+4*t)-.5);
  assert.ok(Math.abs(spellPower('sneakyVine',q)-(12+8*t))<1e-10);
  assert.ok(Math.abs(spellKnockback(q,'wave')-(40+14*t))<1e-10);
  assert.ok(Math.abs(nearKnockback('puddleGuard',q)-(54.74+(87.584-54.74)*t))<1e-10);
  for(const spell of SPELLS){assert.ok(spellDamage({element:'Neutral'},q,spell.id)>=spellDamage({element:'Neutral'},q-1,spell.id));assert.ok(spellKnockback(q,spell.id)>=spellKnockback(q-1,spell.id));}
 }
 assert.equal(grade(60),'Steady');
});
test('45 is accepted only with the unchanged seven-point separation, including accuracy bonuses',()=>{
 const result=(quality:number,margin:number):RecognitionResult=>({spell:null,quality,reason:'',candidates:[{spell:SPELLS[0],quality,error:0},{spell:SPELLS[1],quality:quality-margin,error:1}]});
 for(const q of [45,46,47,48,59,60]){
  const clear=applyRecognitionBonus(result(q,7),0);assert.equal(clear.spell?.id,SPELLS[0].id);assert.equal(clear.quality,q);
  assert.equal(applyRecognitionBonus(result(q,6),0).spell,null);
  assert.equal(applyRecognitionBonus(result(q,6),30).spell,null);
 }
 assert.equal(applyRecognitionBonus(result(44,7),0).spell,null);
 const boosted=applyRecognitionBonus(result(44,7),1);assert.equal(boosted.spell?.id,SPELLS[0].id);assert.equal(boosted.quality,45);
});
test('newly valid drawn and bottled casts resolve once using their real quality in both modes',()=>{
 for(const playMode of ['apprentice','expert'] as const)for(const q of [45,46,47,48,59,60]){
  let b=battleForRun({...newRun(),playMode});b={...b,approachAt:1000,enemies:b.enemies.map(e=>({...e,hp:1000,maxHP:1000,element:'Neutral' as const}))};
  const before=structuredClone(b);let cast=launchSpell(b,q,'#fff','water');assert.equal(cast.projectile?.quality,q);
  for(let i=0;i<4;i++)cast=stepBattle(cast,.1);assert.equal(cast.enemies[0].hp,1000-spellDamage({element:'Neutral'},q,'water'));assert.deepEqual(b,before);
  let bottle=drinkPotion({...b,potions:{...b.potions,spellBottle:1},bottledSpells:[{spellId:'water',quality:q}]},'spellBottle');
  for(let i=0;i<8;i++)bottle=stepBattle(bottle,.1);
  assert.equal(bottle.enemies[0].hp,1000-spellDamage({element:'Neutral'},q,'water'));assert.equal(bottle.bottledSpells.length,0);
 }
});
