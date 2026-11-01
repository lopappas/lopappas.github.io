import test from 'node:test';
import assert from 'node:assert/strict';
import {spellDamage,spellKnockback} from '../src/battle.ts';
import {power,knockback} from '../src/magic.ts';
test('three starter spells match every approved damage endpoint and upgrade by 25 percent',()=>{
 for(const id of ['water','fire','nature'] as const){
  for(const [q,damage] of [[48,7],[59,11],[60,17],[69,22],[70,26],[79,31],[80,36],[100,52]]){
   assert.equal(spellDamage({element:'Neutral'},q,id),damage);
   assert.equal(spellDamage({element:'Neutral'},q,id,1,1),Math.round(damage*1.25));
  }
  for(let q=48;q<=100;q++){
   const damage=spellDamage({element:'Neutral'},q,id);
   assert.equal(spellDamage({element:'Neutral'},q,id,1,1),Math.round(damage*1.25));
   assert.equal(spellKnockback(q,id),knockback(q));
   if(q>48)assert.ok(damage>=spellDamage({element:'Neutral'},q-1,id));
  }
 }
});
test('other damaging spells keep their existing base curve and multipliers',()=>{
 for(const [id,factor] of [['wave',.9],['bolt',1.3],['leaf',.75],['tidalcrest',1.1]] as const)
  for(let q=48;q<=100;q++)assert.equal(spellDamage({element:'Neutral'},q,id),Math.round(power(q)*factor));
});
