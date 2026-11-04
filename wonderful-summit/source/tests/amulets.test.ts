import {test} from 'node:test';
import assert from 'node:assert/strict';
import {newBattle,hitWithSpell,stepBattle,launchSpell,spellDamage,spellKnockback,burnDamage,type Battle,type Enemy} from '../src/battle.ts';
import {newRun,battleForRun,enterNode,finishBattle,RELICS} from '../src/run.ts';
function setup(element:Enemy['element']='Neutral'){
 const b=newBattle('active','elite');return {...b,approachAt:0,enemies:b.enemies.map(e=>({...e,element,hp:1000,maxHP:1000})),amulets:{sun:true,moon:true,twilight:true}};
}
function advance(b:Battle,seconds:number){for(let i=0;i<Math.round(seconds*100);i++)b=stepBattle(b,.01);return b;}
test('amulets require Steady and affect only their element',()=>{
 for(const id of ['water','fire','nature'] as const){const b=setup(),hit=hitWithSpell(b,59,id,1,()=>0);assert.equal(hit.enemies[0].hp,1000-spellDamage(b.enemies[0],59,id));assert.equal(hit.enemies[0].burn,null);assert.equal(hit.enemies[0].rootUntil,0);}
});
test('Sun adds 15 percent fire damage but grants bonus burn only to Hearthspark',()=>{
 for(const id of ['fire','bolt'] as const){for(const element of ['Neutral','Water','Nature','Fire'] as const){const b=setup(element),hit=hitWithSpell(b,60,id);const direct=1000-hit.enemies[0].hp;
 if(element==='Fire'){assert.equal(hit.enemies[0].burn,null);continue;}
 const extra=id==='fire'?Math.round(direct*.3):0,bolt=id==='bolt'?Math.round(burnDamage(60,element)*3*1.15):0;
 const after=advance(hit,3.01);assert.equal(hit.enemies[0].hp-after.enemies[0].hp,extra+bolt);assert.equal(after.enemies[0].burn,null);
 }}
});
test('Moon boosts both water spells before elemental resistance and preserves knockback resistance',()=>{
 for(const id of ['water','wave'] as const)for(const element of ['Neutral','Water','Nature','Fire'] as const){const b=setup(element);b.enemies[0].x=350;const hit=hitWithSpell(b,60,id);assert.equal(hit.enemies[0].hp,1000-spellDamage(b.enemies[0],60,id,1.15));assert.equal(hit.enemies[0].push?.to,Math.min(640,b.enemies[0].x+spellKnockback(60,id,id==='water'?1.15:1,element)));}
});
test('Twilight rolls once at 50 percent, roots for 1.5 seconds, and Nature resists roots but takes bonus damage',()=>{
 for(const id of ['nature'] as const){const b=setup(),hit=hitWithSpell(b,60,id,1,()=>.499);assert.equal(hit.enemies[0].rootUntil,1.5);
 const pushed=advance(hit,.4),held=advance(pushed,1.09);assert.equal(held.enemies[0].x,pushed.enemies[0].x);assert.equal(held.enemies[0].clock,pushed.enemies[0].clock);assert.ok(advance(held,.1).enemies[0].x<held.enemies[0].x);
 assert.equal(hitWithSpell(b,60,id,1,()=>.5).enemies[0].rootUntil,0);
 const nature=hitWithSpell(setup('Nature'),60,id,1,()=>0);assert.equal(nature.enemies[0].rootUntil,0);assert.equal(nature.enemies[0].hp,1000-spellDamage({element:'Nature'},60,id,1.15));
 const fire=hitWithSpell(setup('Fire'),60,id,1,()=>0);assert.equal(fire.enemies[0].rootUntil,1.5);
 }
});
test('new amulets carry into combat and can be offered by shops and elite rewards',()=>{
 const run={...newRun(),screen:'map' as const,relics:['sunAmulet','moonAmulet','twilightAmulet'] as const};
 assert.deepEqual(battleForRun({...run,relics:[...run.relics]}).amulets,{sun:true,moon:true,twilight:true});
 for(const id of run.relics){const owned=Object.keys(RELICS).filter(x=>x!==id) as (keyof typeof RELICS)[];
 const shop=enterNode({...newRun(),screen:'map',node:2,relics:owned},()=>0);assert.ok(shop.stock.some(x=>x.kind==='relic'&&x.item===id));
 const reward=finishBattle({...newRun(),screen:'battle',node:3,relics:owned},{...newBattle('active'),phase:'victory'},()=>0);assert.equal(reward.reward?.relic,id);
 }
});

test('advanced spells keep the matching 15 percent damage bonus without inheriting starter-only effects',()=>{
 for(const id of ['bolt','flameBlade','wave','tidalcrest','leaf','thistleBush'] as const){
  const b=setup();b.enemies[0].x=350;
  const hit=hitWithSpell(b,60,id,1,()=>0);
  assert.ok(Math.abs(1000-hit.enemies[0].hp-spellDamage(b.enemies[0],60,id,1.15))<1e-8);
  assert.equal(hit.enemies[0].rootUntil,0);
  if(id!=='bolt')assert.equal(hit.enemies[0].burn,null);
  else assert.equal(hit.enemies[0].burn!.damage,burnDamage(60,'Neutral')*1.15);
  if(['wave','tidalcrest'].includes(id))assert.ok(Math.abs(hit.enemies[0].push!.to-350-spellKnockback(60,id))<1e-8);
 }
 const b=setup();b.enemies[0].x=355;const guard=advance(launchSpell(b,60,'#fff','puddleGuard'),.01);
 assert.equal(guard.enemies[0].hp,1000);assert.ok(Math.abs(guard.enemies[0].push!.to-guard.enemies[0].push!.from-98.532)<1e-8);
});
test('Firestorm, Drudge Bog and Thistle snapshot their elemental damage bonus without amulet burn or roots',()=>{
 const oldRandom=Math.random;Math.random=()=>0;
 try{for(const [id,seconds,damage] of [['firestorm',2.5,3.22],['bog',1.5,1.725],['thistleBush',.5,2.5875]] as const){
  let b=setup();b.approachAt=1000;b.enemies[0].x=350;b=launchSpell(b,60,'#fff',id);b.amulets={sun:false,moon:false,twilight:false};b=advance(b,seconds);
  assert.ok(Math.abs(1000-b.enemies[0].hp-damage)<1e-8,id);assert.equal(b.enemies[0].burn,null);assert.equal(b.enemies[0].rootUntil,0);
 }}finally{Math.random=oldRandom;}
});
