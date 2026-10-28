import {test} from 'node:test';
import assert from 'node:assert/strict';
import {newRun,enterNode,RELICS,ROUTE,battleForRun,buy,type Run} from '../src/run.ts';
import {SPELLS,power} from '../src/magic.ts';
import {newBattle,hitWithSpell,spellDamage,spellKnockback,stepBattle,burnDamage,CONTACT_X,drinkPotion} from '../src/battle.ts';

test('merchant always rolls two distinct options per category, preferring unowned items',()=>{
 for(const roll of [0,.25,.5,.85,.999])for(const complete of [false,true]){
  const run:Run={...newRun(),screen:'map',node:2,relics:complete?Object.keys(RELICS) as Run['relics']:[],spells:complete?SPELLS.map(s=>s.id):['water','fire','nature']};
  const shop=enterNode(run,()=>roll);assert.equal(shop.stock.length,6);
  for(const kind of ['potion','spell','relic']){const items=shop.stock.filter(s=>s.kind===kind);assert.equal(items.length,2);assert.equal(new Set(items.map(s=>s.item)).size,2);}
  if(!complete)assert.ok(shop.stock.filter(s=>s.kind==='spell').every(s=>!run.spells.includes(s.item as any)));
  assert.equal(enterNode(shop,()=>0),shop); // purchases never reroll stock
  if(complete)for(const item of shop.stock.filter(s=>s.kind!=='potion')){const rich={...shop,gold:1000};assert.equal(buy(rich,item.id),rich);}
 }
});
test('new trail encounter spawns one neutral rocky slime with 150 HP and opening grace',()=>{
 const node=ROUTE.findIndex(n=>n.kind==='battle'&&n.encounter==='rock');assert.ok(node>=0);
 const b=battleForRun({...newRun(),node},()=>0);assert.equal(b.enemies.length,1);assert.equal(b.enemies[0].element,'Neutral');assert.equal(b.enemies[0].hp,150);assert.equal(b.enemies[0].maxHP,150);assert.equal(b.enemies[0].rocky,true);assert.equal(b.approachAt,5);
 for(const spell of SPELLS)assert.equal(spellDamage(b.enemies[0],80,spell.id),spellDamage({element:'Neutral'},80,spell.id));
});
test('rocky trait halves Faint damage for every spell and removes all Faint knockback, even with bonuses',()=>{
 for(const spell of SPELLS)for(const quality of [48,59,60,69,70,79,80,100]){
  const b=newBattle('active','rock');b.enemies[0].x=350;
  const hit=hitWithSpell(b,quality,spell.id),rock=hit.enemies[0];const factor=spell.id==='bolt'?1.4:spell.id==='wave'?.8:spell.id==='leaf'?.75:1;
  assert.equal(b.enemies[0].hp-rock.hp,Math.round(power(quality)*factor*(quality<60?.5:quality<70?.75:1)));
  if(quality<60){assert.equal(rock.push,null);assert.equal(spellKnockback(quality,spell.id,9,'Neutral',true),0);}else assert.ok(rock.push&&rock.push.to>350);
 }
});
test('Faint casts cannot interrupt rocky attacks or restart existing push, but Steady casts can',()=>{
 const b=newBattle('active','rock');b.enemies[0]={...b.enemies[0],x:CONTACT_X,attackAt:.1};
 const faint=hitWithSpell(b,59,'water');assert.equal(faint.enemies[0].attackAt,.1);assert.equal(faint.enemies[0].push,null);
 const steady=hitWithSpell(b,60,'water');assert.equal(steady.enemies[0].attackAt,null);assert.ok(steady.enemies[0].push);
 const again=hitWithSpell(steady,59,'water');assert.deepEqual(again.enemies[0].push,steady.enemies[0].push);
});
test('any rocky enemy ignores Faint spell effects but still accepts potions',()=>{
 const b=newBattle('active','elite');b.enemies[0].rocky=true;
 const hit=hitWithSpell(b,59,'bolt');assert.equal(hit.enemies[0].burn,null);assert.equal(burnDamage(59,'Neutral',true),0);
 assert.equal(hitWithSpell(b,59,'leaf').enemies[0].slowUntil,0);
 const potion=drinkPotion(b,'freeze');let frozen=potion;for(let i=0;i<70;i++)frozen=stepBattle(frozen,.01);assert.ok(frozen.freezeUntil>frozen.time);
});

test('Steady rocky defense reduces damage and knockback by exactly 25 percent before rounding',()=>{
 for(const spell of SPELLS)for(const q of [60,69,70,79,80,100]){
  const b=newBattle('active','rock'),e=b.enemies[0];e.x=350;
  const hit=hitWithSpell(b,q,spell.id),mult=q<70?.75:1;
  const expected=spellKnockback(q,spell.id,1,'Neutral')*mult;
  assert.ok(Math.abs(hit.enemies[0].push!.to-e.x-expected)<1e-8);
  const factor=spell.id==='bolt'?1.4:spell.id==='wave'?.8:spell.id==='leaf'?.75:1;
  assert.equal(spellDamage(e,q,spell.id,1.15,2),Math.round(power(q)*factor*1.15*1.5*mult));
 }
});
test('rocky Faint immunity never applies or refreshes statuses, and does not cleanse earlier good casts',()=>{
 const b=newBattle('active','rock');b.amulets={sun:true,moon:true,twilight:true};
 for(const s of SPELLS){const hit=hitWithSpell(b,59,s.id,1,()=>0).enemies[0];assert.equal(hit.burn,null);assert.equal(hit.slowUntil,0);assert.equal(hit.rootUntil,0);}
 const strong=hitWithSpell(hitWithSpell(b,70,'bolt'),70,'leaf',1,()=>0);
 strong.time=.1;
 for(const s of SPELLS){const e=hitWithSpell(strong,59,s.id,1,()=>0).enemies[0];assert.deepEqual(e.burn,strong.enemies[0].burn);assert.equal(e.slowUntil,strong.enemies[0].slowUntil);assert.equal(e.rootUntil,strong.enemies[0].rootUntil);}
 for(const q of [60,69,70]){assert.ok(hitWithSpell(b,q,'bolt').enemies[0].burn);assert.equal(hitWithSpell(b,q,'leaf',1,()=>0).enemies[0].rootUntil,1.5);assert.equal(hitWithSpell(b,q,'leaf').enemies[0].slowUntil,4);}
 assert.equal(burnDamage(60,'Neutral',true),Math.round(power(60)*.25*.75));
});
test('rock slimes move 10 percent slower than regular slimes at the same difficulty, including while slowed',()=>{
 for(const slow of [false,true])for(const difficulty of [1,1.2]){
  const rock=newBattle('active','rock'),regular=newBattle('active','slime');
  for(const b of [rock,regular]){b.approachAt=0;b.difficulty=difficulty;if(slow)b.enemies[0].slowUntil=4;}
  const rockTravel=rock.enemies[0].x-stepBattle(rock,.1).enemies[0].x,regularTravel=regular.enemies[0].x-stepBattle(regular,.1).enemies[0].x;
  assert.ok(Math.abs(rockTravel-regularTravel*.9)<1e-8);
 }
});
