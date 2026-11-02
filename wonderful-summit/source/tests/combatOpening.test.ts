import {newRun,markSpellsReviewed,learnReward,finishBattle,battleForRun} from '../src/run.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import {combatOpening,openingSpells,openingSpellGroups} from '../src/combatOpening.ts';
import {newBattle,stepBattle} from '../src/battle.ts';
test('review waits for explicit readiness and battle timers stay paused until then',()=>{
 const initial=newBattle('active');let b=initial;
 for(let frame=0;frame<1000;frame++)if(!combatOpening(false).blocked)b=stepBattle(b,.1);
 assert.equal(b,initial);assert.equal(b.time,0);assert.equal(b.enemies[0].clock,0);
 assert.deepEqual(combatOpening(true),{blocked:false});
 if(!combatOpening(true).blocked)b=stepBattle(b,.1);assert.equal(b.time,.1);
});

test('review shows only owned symbols, each once, in spellbook element and spell order',()=>{
 const spells=openingSpells(['chronos','bog','bolt','wave','nature','fire','water','leaf','tidalcrest','firestorm','water']);
 assert.deepEqual(spells.map(s=>s.id),['water','wave','tidalcrest','fire','bolt','firestorm','nature','leaf','bog','chronos']);
 assert.deepEqual(openingSpells(['nature','water']).map(s=>s.id),['water','nature']);
 assert.deepEqual(openingSpells([]),[]);
});

test('new highlights preserve element grouping and canonical positions',()=>{
 const known=['bog','water','fire','nature','wave'] as const;
 const fresh=openingSpellGroups([...known],['water','fire','nature']);
 assert.deepEqual(fresh.map(g=>g.element),['Water','Fire','Nature']);
 assert.deepEqual(fresh.flatMap(g=>g.spells).map(s=>[s.id,s.isNew]),[['water',false],['wave',true],['fire',false],['nature',false],['bog',true]]);
 const seen=openingSpellGroups([...known],[...known]);
 assert.deepEqual(seen.flatMap(g=>g.spells).map(s=>s.id),fresh.flatMap(g=>g.spells).map(s=>s.id));
 assert.ok(seen.flatMap(g=>g.spells).every(s=>!s.isNew));
});

test('learned spells stay new until Ready marks the current arsenal reviewed',()=>{
 const run={...newRun(),screen:'battle' as const,combats:2};
 const reward=finishBattle(run,{...battleForRun(run),phase:'victory'},()=>0);
 const learned=learnReward(reward,reward.reward!.offers[0]);
 const entering={...learned,screen:'battle' as const};
 const newId=learned.reward!.learned!;assert.ok(!entering.reviewedSpells.includes(newId));
 const acknowledged=markSpellsReviewed(entering);assert.ok(acknowledged.reviewedSpells.includes(newId));
 assert.ok(!entering.reviewedSpells.includes(newId));assert.deepEqual(acknowledged.spells,entering.spells);
 assert.deepEqual(newRun().reviewedSpells,['water','fire','nature']);
});
