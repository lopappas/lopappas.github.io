import test from 'node:test';
import assert from 'node:assert/strict';
import {spellDamage,spellKnockback} from '../src/battle.ts';
import {power,knockback} from '../src/magic.ts';
test('three starter spells match every approved damage endpoint and upgrade by 25 percent',()=>{
 for(const id of ['water','fire','nature'] as const){
  for(const [q,damage] of [[48,6.5],[59,10.5],[60,16.5],[69,21.5],[70,25.5],[79,30.5],[80,35.5],[100,51.5]]){
   assert.equal(spellDamage({element:'Neutral'},q,id),damage);
   assert.equal(spellDamage({element:'Neutral'},q,id,1,1),damage*1.25);
  }
  for(let q=48;q<=100;q++){
   const damage=spellDamage({element:'Neutral'},q,id);
   assert.equal(spellDamage({element:'Neutral'},q,id,1,1),damage*1.25);
   assert.equal(spellKnockback(q,id),knockback(q));
   if(q>48)assert.ok(damage>=spellDamage({element:'Neutral'},q-1,id));
  }
 }
});
test('other damaging spells keep their existing base curve and multipliers',()=>{
 for(const [id,factor] of [['wave',.9],['bolt',1.3],['leaf',.75],['tidalcrest',1.265]] as const)
  for(let q=48;q<=100;q++)assert.equal(spellDamage({element:'Neutral'},q,id),Math.round(power(q)*factor));
});
