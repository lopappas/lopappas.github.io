import {test} from 'node:test';
import assert from 'node:assert/strict';
import {newBattle,hitWithSpell,stepBattle,spellDamage,spellKnockback,burnDamage,type Battle,type Enemy} from '../src/battle.ts';
import {newRun,battleForRun,enterNode,finishBattle,RELICS} from '../src/run.ts';
function setup(element:Enemy['element']='Neutral'){
 const b=newBattle('active','elite');return {...b,approachAt:0,enemies:b.enemies.map(e=>({...e,element,hp:1000,maxHP:1000})),amulets:{sun:true,moon:true,twilight:true}};
}
function advance(b:Battle,seconds:number){for(let i=0;i<Math.round(seconds*100);i++)b=stepBattle(b,.01);return b;}
test('amulets require Steady and affect only their element',()=>{
 for(const id of ['water','fire','nature'] as const){const b=setup(),hit=hitWithSpell(b,59,id,1,()=>0);assert.equal(hit.enemies[0].hp,1000-spellDamage(b.enemies[0],59,id));assert.equal(hit.enemies[0].burn,null);assert.equal(hit.enemies[0].rootUntil,0);}
});
test('Sun adds 30 percent burn, stacks with Flare Bolt and never burns Fire enemies',()=>{
 for(const id of ['fire','bolt'] as const){for(const element of ['Neutral','Water','Nature','Fire'] as const){const b=setup(element),hit=hitWithSpell(b,60,id);const direct=1000-hit.enemies[0].hp;
 if(element==='Fire'){assert.equal(hit.enemies[0].burn,null);continue;}
 const extra=Math.round(direct*.3),bolt=id==='bolt'?burnDamage(60,element)*3:0;
 const after=advance(hit,3.01);assert.equal(hit.enemies[0].hp-after.enemies[0].hp,extra+bolt);assert.equal(after.enemies[0].burn,null);
 }}
});
test('Moon boosts both water spells before elemental resistance and preserves knockback resistance',()=>{
 for(const id of ['water','wave'] as const)for(const element of ['Neutral','Water','Nature','Fire'] as const){const b=setup(element);b.enemies[0].x=350;const hit=hitWithSpell(b,60,id);assert.equal(hit.enemies[0].hp,1000-spellDamage(b.enemies[0],60,id,1.15));assert.equal(hit.enemies[0].push?.to,Math.min(640,b.enemies[0].x+spellKnockback(60,id,1.15,element)));}
});
test('Twilight rolls once at 50 percent, roots for 1.5 seconds, and Nature resists roots but takes bonus damage',()=>{
 for(const id of ['nature','leaf'] as const){const b=setup(),hit=hitWithSpell(b,60,id,1,()=>.499);assert.equal(hit.enemies[0].rootUntil,1.5);
 const pushed=advance(hit,.4),held=advance(pushed,1.09);assert.equal(held.enemies[0].x,pushed.enemies[0].x);assert.equal(held.enemies[0].clock,pushed.enemies[0].clock);assert.ok(advance(held,.1).enemies[0].x<held.enemies[0].x);
 assert.equal(hitWithSpell(b,60,id,1,()=>.5).enemies[0].rootUntil,0);
 const nature=hitWithSpell(setup('Nature'),60,id,1,()=>0);assert.equal(nature.enemies[0].rootUntil,0);assert.equal(nature.enemies[0].hp,1000-spellDamage({element:'Nature'},60,id,1.15));
 const fire=hitWithSpell(setup('Fire'),60,id,1,()=>0);assert.equal(fire.enemies[0].rootUntil,1.5);if(id==='leaf')assert.equal(fire.enemies[0].slowUntil,4.1);
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
