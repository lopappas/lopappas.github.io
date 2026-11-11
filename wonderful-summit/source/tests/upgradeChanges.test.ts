import test from 'node:test';
import assert from 'node:assert/strict';
import {power,SPELLS} from '../src/magic.ts';
import {newBattle,launchSpell,spellDamage,brambleEffect,hitWithSpell} from '../src/battle.ts';
import {spellUpgradePreview} from '../src/spellbook.ts';
test('revised damage upgrades apply before rounding and match the campsite preview',()=>{
 for(const q of [48,60,70,80,100]){
  assert.equal(spellDamage({element:'Neutral'},q,'bolt',1,1),Math.round(power(q)*1.3*1.2));
  assert.equal(spellDamage({element:'Neutral'},q,'tidalcrest',1,1),Math.round(power(q)*(1.265*.95)*1.15));
  assert.equal(spellDamage({element:'Neutral'},q,'flameBlade',1,1),Math.round((q<60?24+10*(q-48)/11:q<70?45+13*(q-60)/9:q<80?70+20*(q-70)/9:105+35*(q-80)/20)*1.16*.79*.95*1.15));
 }
 for(const [id,bonus] of [['bolt',20],['tidalcrest',15],['flameBlade',15]] as const)assert.equal(spellUpgradePreview(id)!.nextBonus,bonus);
});
test('Bramble Leaf upgrades add five percentage points to slowing, preserving duration',()=>{
 for(const q of [48,59,60,69,70,79,80,100]){
  assert.ok(Math.abs(brambleEffect(q,1).amount-brambleEffect(q).amount-.05)<1e-8);
  assert.equal(brambleEffect(q,1).duration,brambleEffect(q).duration);
  let b=newBattle('active');b.upgrades.leaf=1;b.enemies[0].element='Neutral';b.enemies[0].shield=null;
  b=hitWithSpell(b,q,'leaf');assert.equal(b.enemies[0].leafSlows[0].amount,brambleEffect(q,1).amount);
 }
});
test('upgraded Alchemize rolls twice, keeps first roll when only one slot fits, and never exceeds capacity',()=>{
 for(const capacity of [1,2,3,5])for(const occupied of [capacity-2,capacity-1,capacity].filter(n=>n>=0)){
  let b=newBattle('active');b.upgrades.alchemize=1;b.potionCapacity=capacity;b.potions={heal:occupied,freeze:0,ink:0};
  let calls=0;const rng=()=>[0,0,0,.999][calls++%4];
  const result=launchSpell(b,80,'#fff','alchemize',0,rng);
  if(occupied===capacity){assert.equal(result,b);assert.equal(calls,0);continue;}
  assert.equal(calls,4);assert.equal(result.potions.rejection,1);
  assert.equal(result.alchemizedPotions?.length,Math.min(2,capacity-occupied));
  assert.equal(result.potionFullSerial,occupied===capacity-1?1:0);
  assert.ok(Object.values(result.potions).reduce((a,n)=>a+n,0)<=capacity);
  assert.equal(launchSpell(result,80,'#fff','alchemize'),result);
 }
 assert.equal(spellUpgradePreview('alchemize')?.alchemy,true);
 assert.ok(SPELLS.find(s=>s.id==='alchemize')!.description.includes('two potions'));
});
