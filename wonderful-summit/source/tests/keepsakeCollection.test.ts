import test from 'node:test';
import assert from 'node:assert/strict';
import {newRun,startRun,acquireRelic,battleForRun,RELICS,STARTER_RELICS,type RelicId} from '../src/run.ts';
import {applyDeveloperCommand} from '../src/developerCommands.ts';
import {spellDamage,launchSpell} from '../src/battle.ts';
test('coinpurse grants exactly 100 gold once, both at the start and through collection',()=>{
 const start={...newRun(),screen:'sister' as const};const r=startRun(start,'coinpurse');
 assert.equal(r.gold,100);assert.deepEqual(r.relics,['filadoraRobes','coinpurse']);assert.equal(startRun(r,'coinpurse'),r);assert.equal(acquireRelic(r,'coinpurse'),r);
 const richer=acquireRelic({...newRun(),gold:37},'coinpurse');assert.equal(richer.gold,137);assert.equal(applyDeveloperCommand(richer,{type:'relic',id:'coinpurse'}),richer);
 assert.equal(start.gold,0);
});
test('Untouched Box grants one unowned normal relic once and retains its own keepsake entry',()=>{
 const tiers=new Set<string>();
 for(let i=0;i<300;i++){
  const r=startRun({...newRun(),screen:'sister'},'untouchedBox',()=>i/300);
  assert.equal(r.relics.length,r.relics.includes('artisanRobes')?2:3);assert.equal(new Set(r.relics).size,r.relics.length);assert.ok(r.relics.includes('untouchedBox'));
  const gift=r.relics.find(id=>id!=='filadoraRobes'&&id!=='untouchedBox')!;
  assert.ok(gift);assert.ok(!STARTER_RELICS.includes(gift));assert.notEqual(RELICS[gift].rarity,'Starter');assert.notEqual(gift,'blackStardust');tiers.add(RELICS[gift].rarity);
  assert.equal(acquireRelic(r,'untouchedBox',()=>{throw Error('Cannot reroll a collected box');}),r);
 }
 assert.deepEqual([...tiers].sort(),['Common','Rare','Uncommon']);
});
test('box gifts cannot duplicate owned relics and safely handle an exhausted pool',()=>{
 const owned=(Object.keys(RELICS) as RelicId[]).filter(id=>id!=='untouchedBox'&&id!=='bell');
 const one=acquireRelic({...newRun(),relics:owned},'untouchedBox',()=>.99);assert.equal(one.relics.filter(id=>id==='bell').length,1);assert.equal(new Set(one.relics).size,one.relics.length);
 const complete=acquireRelic({...newRun(),relics:[...owned,'bell']},'untouchedBox',()=>{throw Error('No reward to roll');});assert.equal(complete.relics.length,Object.keys(RELICS).length);
});
test('Madora earring uses five percent in combat while the Sphere retains fifteen percent',()=>{
 const b=battleForRun({...newRun(),relics:['amber']},()=>0);assert.equal(b.damageBonus,1.05);
 assert.equal(spellDamage({element:'Neutral'},60,'water',b.damageBonus),Math.round(spellDamage({element:'Neutral'},60,'water')*1.05));
 const sphere=battleForRun({...newRun(),relics:['perfectedSphere']},()=>0);assert.equal(launchSpell(sphere,60,'#fff','water').projectile?.damageMultiplier,1.15);
});
