import test from 'node:test';
import assert from 'node:assert/strict';
import {SPELLS} from '../src/magic.ts';
import {newBattle,hitWithSpell,spellDamage,spellKnockback,firestormTickDamage,bogTickDamage,launchSpell,stepBattle,drinkPotion,CONTACT_X,eliteRush,resistedSlow,type Battle} from '../src/battle.ts';
import {newRun,startRun,enterNode,battleForRun,finishBattle,encounterGold} from '../src/run.ts';
const field=()=>{const b=newBattle('active','goblinKing',()=>0);b.approachAt=1000;b.enemies[0].x=350;return b;};
function advance(b:Battle,seconds:number){for(let i=0;i<Math.round(seconds*100);i++)b=stepBattle(b,.01);return b;}
test('boss choice is exactly 50/50 at run start and never rerolls on entering or rebuilding node 12',()=>{
 const counts={mother:0,goblinKing:0};
 for(let i=0;i<200;i++){
  const run=startRun({...newRun(),screen:'sister',keepsakeOffers:['amber']},'amber',()=>i/200);
  counts[run.bossEncounter!]++;
  for(const rng of [()=>0,()=>.999]){
   const active=enterNode({...run,node:11},rng);assert.equal(active.bossEncounter,run.bossEncounter);
   assert.equal(battleForRun(active,rng).encounter,run.bossEncounter);
  }
 }
 assert.deepEqual(counts,{mother:100,goblinKing:100});
 const legacy={...newRun(),node:11};assert.equal(battleForRun(legacy,()=>.999).encounter,'mother');
 assert.equal(encounterGold(11),54);
});
test('Goblin King has 1000 health, is neutral, moves at rock-slime speed and never charges',()=>{
 const b=field(),king=b.enemies[0];assert.equal(king.hp,1000);assert.equal(king.maxHP,1000);assert.equal(king.element,'Neutral');assert.equal(king.rocky,false);
 for(const clock of [0,6,7,8,9,17])assert.equal(eliteRush({...king,clock}),'none');
 const rock=newBattle('active','rock',()=>0);b.approachAt=rock.approachAt=0;b.enemies[0].x=rock.enemies[0].x=600;
 assert.ok(Math.abs(advance(b,2).enemies[0].x-advance(rock,2).enemies[0].x)<1e-8);
});
test('Faint spells deal zero direct and tick damage without knockback, but status effects still apply',()=>{
 const b=field(),king=b.enemies[0];
 for(const q of [48,55,59]){
  for(const spell of SPELLS){assert.equal(spellDamage(king,q,spell.id,10,1),0);assert.equal(spellKnockback(q,spell.id,10,'Neutral',false,null,0,1,true),0);}
  assert.equal(firestormTickDamage(king,q,10,1),0);assert.equal(bogTickDamage(king,q,1,10),0);
  const leaf=hitWithSpell(b,q,'leaf');assert.equal(leaf.enemies[0].hp,1000);assert.ok(leaf.enemies[0].leafSlows.length);assert.equal(leaf.enemies[0].push,null);
  const burn=hitWithSpell(b,q,'bolt');assert.ok(burn.enemies[0].burn);assert.equal(advance(burn,3).enemies[0].hp,1000);
  const frozen=hitWithSpell(b,q,'chronos');assert.ok(frozen.enemies[0].stunUntil>0);
  for(const id of ['bog','firestorm','thistleBush'] as const){const result=advance(launchSpell(b,q,'#fff',id),6);assert.equal(result.enemies[0].hp,1000);}
 }
});
test('competent spells deal normal neutral damage and half knockback, including Sneaky Vine',()=>{
 for(const q of [60,69,70,79,80,100])for(const id of ['water','fire','nature','wave','bolt','leaf','tidalcrest','puddleGuard','sneakyVine'] as const){
  const b=field(),king=b.enemies[0];assert.equal(spellDamage(king,q,id),spellDamage({element:'Neutral'},q,id));
  const hit=hitWithSpell(b,q,id,king.id);
  const expected=spellKnockback(q,id)*.5;
  if(expected)assert.ok(Math.abs(hit.enemies[0].push!.to-king.x-expected)<1e-8,`${id} ${q}`);
 }
});
test('slow resistance subtracts 20 percentage points, clamps to zero and does not affect freeze potions',()=>{
 const b=field(),king=b.enemies[0];assert.equal(resistedSlow(king,.5),.3);assert.equal(resistedSlow(king,.15),0);
 b.approachAt=0;b.enemies[0].x=600;const normal=advance(b,.2);
 const slowed=advance({...b,enemies:[{...king,x:600,leafSlows:[{until:100,amount:.5}]}]},.2);
 assert.ok(Math.abs((600-slowed.enemies[0].x)/(600-normal.enemies[0].x)-.7)<1e-8);
 const frozen=advance(drinkPotion(field(),'freeze'),.7);assert.ok(frozen.freezeUntil>frozen.time+5.9);
});
test('King attacks for exactly 34 damage with normal goblin timing and produces normal boss rewards on victory',()=>{
 let b=field();b.approachAt=0;b.difficulty=1.2;b.enemies[0].x=CONTACT_X;
 b=stepBattle(b,.01);assert.equal(b.enemies[0].attackAt,.66);b=advance(b,.64);assert.equal(b.playerHP,100);b=advance(b,.02);assert.equal(b.playerHP,66);
 const dead=hitWithSpell({...field(),enemies:[{...field().enemies[0],hp:1}]},100,'water');assert.equal(dead.phase,'victory');assert.equal(dead.motherSplit,null);
 const reward=finishBattle({...newRun(),screen:'battle',node:11,bossEncounter:'goblinKing'},dead,()=>.99);assert.equal(reward.screen,'rewards');assert.equal(reward.reward?.gold,54);
});
