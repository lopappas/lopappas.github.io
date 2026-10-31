import {test} from 'node:test';
import assert from 'node:assert/strict';
import {SPELLS,recognize} from '../src/magic.ts';
import {chronosEffect,newBattle,hitWithSpell,stepBattle,spellDamage,spellKnockback,elementalMatchup,launchSpell} from '../src/battle.ts';
import {spellbookColumns,spellUpgradePreview} from '../src/spellbook.ts';
import {camp,newRun} from '../src/run.ts';
function advance(b:ReturnType<typeof newBattle>,seconds:number){for(let i=0;i<Math.round(seconds*100);i++)b=stepBattle(b,.01);return b;}
test('Chronos quality thresholds interpolate to every requested endpoint',()=>{
 for(const [q,kind,duration] of [[48,'slow',1],[59,'slow',2.4],[60,'slow',2.5],[69,'slow',5],[70,'stun',5.1],[79,'stun',9],[80,'stun',9.1],[100,'stun',18]] as const)assert.deepEqual(chronosEffect(q),{kind,duration});
 assert.equal(chronosEffect(47).duration,0);assert.equal(chronosEffect(NaN).duration,0);assert.equal(chronosEffect(101).duration,18);
});
test('Chronos is recognizable at any size and location, with either stroke order and direction',()=>{
 const spell=SPELLS.find(s=>s.id==='chronos')!;assert.equal(spell.element,'Ancient');assert.equal(spell.description,'A lost spell that distorts time itself to hinder enemy movements. Strong casts make time stand still.');
 for(const scale of [.2,1,4]){const strokes=[...spell.strokes].reverse().map(st=>[...st].reverse().map(p=>({x:p.x*scale+100,y:p.y*scale+37})));const r=recognize(strokes);assert.equal(r.spell?.id,'chronos');assert.ok(r.quality>=98);}
 assert.equal(recognize(spell.strokes,['water','fire','nature']).spell,null);assert.notEqual(recognize([spell.strokes[0]],['chronos']).spell?.id,'chronos');
 assert.ok(spellbookColumns(['chronos']).some(c=>c.element==='Ancient'&&c.spells[0].id==='chronos'));
 assert.ok(spellUpgradePreview('chronos'));const r={...newRun(),screen:'camp' as const,spells:SPELLS.map(s=>s.id)};assert.equal(camp(r,'chronos').upgrades.chronos,1);
});
test('Chronos deals zero damage and knockback and affects every element without triggering elemental amulets',()=>{
 for(const q of [48,60,70,100])for(const element of ['Fire','Water','Nature','Neutral'] as const){const b=newBattle('active','pack');b.enemies.forEach(e=>e.element=element);b.amulets={sun:true,moon:true,twilight:true};b.damageBonus=8;b.pushBonus=8;b.upgrades.chronos=2;
 const hit=hitWithSpell(b,q,'chronos');for(let i=0;i<hit.enemies.length;i++){const e=hit.enemies[i];assert.equal(e.hp,b.enemies[i].hp);assert.equal(e.x,b.enemies[i].x);assert.equal(e.push,null);assert.equal(e.burn,null);assert.equal(e.rootUntil,0);assert.equal(q<70?e.slowUntil:e.stunUntil,chronosEffect(q,2).duration);}
 assert.equal(spellDamage({element},q,'chronos',8,2),0);assert.equal(spellKnockback(q,'chronos',8,element),0);assert.deepEqual(elementalMatchup('Ancient',element),{damage:1,knockback:1,immuneEffects:false});}
});
test('rocky enemies ignore Faint Chronos but keep full Steady slow and stronger stun durations',()=>{
 for(const q of [48,59,60,69,70,79,80,100]){const b=newBattle('active','rock');const hit=hitWithSpell(b,q,'chronos');assert.equal(hit.enemies[0].hp,150);assert.equal(q<70?hit.enemies[0].slowUntil:hit.enemies[0].stunUntil,q<60?0:chronosEffect(q).duration);}
});
test('stun stops movement, windups and elite action clocks, then resumes safely; slow uses 55 percent reduction',()=>{
 for(const encounter of ['slime','elite'] as const){let b=newBattle('active',encounter);b.approachAt=0;b.enemies[0].x=400;const clock=b.enemies[0].clock;b=hitWithSpell(b,70,'chronos');b=advance(b,5.09);assert.equal(b.enemies[0].x,400);assert.equal(b.enemies[0].clock,clock);assert.equal(b.playerHP,100);b=advance(b,.1);assert.ok(b.enemies[0].x<400);}
 let b=newBattle('active');b.approachAt=0;b=hitWithSpell(b,60,'chronos');const x=b.enemies[0].x;b=stepBattle(b,.1);assert.ok(Math.abs(x-b.enemies[0].x-18*.45*.1)<1e-8);
});
test('Chronos impacts all present enemies on orb arrival, skips reinforcements/dead enemies and never shortens statuses',()=>{
 let b=newBattle('active','pack');b.enemies[1].spawnAt=10;const before=b.enemies[1];b=launchSpell(b,100,'#8b9099','chronos');assert.equal(b.enemies[0].stunUntil,0);b=advance(b,.33);assert.ok(b.enemies[0].stunUntil>18);assert.deepEqual(b.enemies[1],before);
 const stun=b.enemies[0].stunUntil;b.time=.5;b=hitWithSpell(b,70,'chronos');assert.equal(b.enemies[0].stunUntil,stun);
 b.enemies[0].slowUntil=10;b=hitWithSpell(b,48,'chronos');assert.equal(b.enemies[0].slowUntil,10);
 const snapshot=structuredClone(b);assert.equal(stepBattle({...b,phase:'ready'},1).time,b.time);assert.deepEqual(b,snapshot);
 b.enemies[1]={...b.enemies[1],hp:0,spawnAt:0};assert.deepEqual(hitWithSpell(b,100,'chronos').enemies[1],b.enemies[1]);
});

test('Chronos upgrades once for a 20 percent duration bonus with no damage or knockback',()=>{
 const run={...newRun(),screen:'camp' as const,spells:SPELLS.map(s=>s.id)};
 const upgraded=camp(run,'chronos'),preview=spellUpgradePreview('chronos')!;
 assert.equal(upgraded.upgrades.chronos,1);assert.equal(preview.duration,true);assert.equal(preview.currentBonus,0);assert.equal(preview.nextBonus,20);assert.equal(preview.currentDamage,0);assert.equal(preview.nextDamage,0);
 for(const q of [48,59,60,69,70,79,80,100]){
  const b=newBattle('active','pack');b.upgrades={...upgraded.upgrades};const effect=chronosEffect(q,1),base=chronosEffect(q);
  assert.equal(effect.duration,Math.round(base.duration*1.2*1000)/1000);assert.deepEqual(chronosEffect(q,2),effect);
  for(const e of hitWithSpell(b,q,'chronos').enemies){assert.equal(effect.kind==='slow'?e.slowUntil:e.stunUntil,effect.duration);assert.equal(e.hp,100);assert.equal(e.push,null);}
  const rock=newBattle('active','rock');rock.upgrades={...upgraded.upgrades};const e=hitWithSpell(rock,q,'chronos').enemies[0];assert.equal(effect.kind==='slow'?e.slowUntil:e.stunUntil,q<60?0:effect.duration);
 }
 assert.equal(chronosEffect(100,1).duration,21.6);
 const secondCamp={...upgraded,campUsed:false};assert.equal(camp(secondCamp,'chronos'),secondCamp);assert.equal(spellUpgradePreview('chronos',1),null);
});
