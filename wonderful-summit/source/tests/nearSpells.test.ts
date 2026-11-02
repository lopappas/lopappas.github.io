import {test} from 'node:test';
import assert from 'node:assert/strict';
import {SPELLS,SPELL_VARIATIONS,recognize,type SpellId} from '../src/magic.ts';
import {nearDamage,nearKnockback,thistleStats} from '../src/nearSpells.ts';
import {newBattle,launchSpell,stepBattle,spellDamage,spellKnockback,hitWithSpell,drinkPotion,CONTACT_X,ENEMY_BACK_X,type Battle} from '../src/battle.ts';
import {newRun,enterNode,finishBattle,battleForRun,camp,spellPrice} from '../src/run.ts';
import {newPracticeBattle,practiceJourney,restoreScarecrow,stepPracticeBattle,practiceDamage} from '../src/practice.ts';
import {spellbookColumns,spellUpgradePreview} from '../src/spellbook.ts';
import {woodenShield} from '../src/shields.ts';
const ids=['flameBlade','puddleGuard','thistleBush'] as const;
function field(xs=[350,370,400]):Battle{const b=newBattle('active','pack');return{...b,approachAt:1000,enemies:xs.map((x,i)=>({...b.enemies[0],id:i+1,x,hp:10000,maxHP:10000,element:'Neutral'}))};}
function advance(b:Battle,seconds:number,dt=.01){for(let i=0;i<Math.round(seconds/dt);i++)b=stepBattle(b,dt);return b;}
test('approved shapes recognize uniquely across size, position and reversed stroke direction/order',()=>{
 for(const id of ids){const spell=SPELLS.find(s=>s.id===id)!;assert.equal(spell.rarity,'Uncommon');
  for(const scale of [.2,1,4]){const strokes=spell.strokes.slice().reverse().map(s=>s.slice().reverse().map(p=>({x:140+p.x*scale,y:-80+p.y*scale})));const match=recognize(strokes);assert.equal(match.spell?.id,id);assert.equal(match.quality,100);assert.equal(match.candidates.filter(c=>c.spell.id===id).length,1);assert.equal(recognize(strokes,['water','fire','nature']).spell,null);}
 }
 const thistle=SPELLS.find(s=>s.id==='thistleBush')!.strokes[0];for(let i=0;i<thistle.length;i++){assert.ok(Math.abs(thistle[i].x+thistle[thistle.length-1-i].x-100)<1e-5);assert.equal(thistle[i].y,thistle[thistle.length-1-i].y);}
});
test('quality endpoints set the promised puddle knockback and thistle reach/budget',()=>{
 const endpoints=[[48,100,80,40],[59,160,90,60],[60,180,95,75],[69,260,110,110],[70,280,115,125],[79,360,130,170],[80,380,135,190],[100,500,150,250]];
 for(const [q,push,range,budget] of endpoints){assert.equal(nearKnockback('puddleGuard',q),push);assert.deepEqual(thistleStats(q),{range,budget});}
 for(const q of [0,47,NaN,Infinity])for(const id of ids)assert.equal(launchSpell(field(),q,'#fff',id).casts,0);
});
test('Flame Blade hits every present enemy within 125 units exactly once, without a projectile or distant fallback',()=>{
 const b=field([325,450,451,350]);b.enemies[3].spawnAt=5;const before=structuredClone(b),n=launchSpell(b,70,'#fff','flameBlade');
 assert.deepEqual(b,before);assert.equal(n.casts,1);assert.equal(n.projectile,null);
 assert.equal(n.enemies[0].hp,10000-70);assert.equal(n.enemies[1].hp,10000-70);assert.equal(n.enemies[2].hp,10000);assert.equal(n.enemies[3].hp,10000);
 assert.ok(n.enemies[0].push);assert.equal(n.enemies[0].push!.to-325,20);
 const empty=launchSpell(field([500]),100,'#fff','flameBlade');assert.ok(empty.flameSwing);assert.equal(empty.enemies[0].hp,10000);assert.equal(advance(n,.4).enemies[0].hp,n.enemies[0].hp);
});
test('Puddle Guard persists, triggers only the first walking enemy, launches it, and then disappears',()=>{
 let b=launchSpell(field([400,400]),100,'#fff','puddleGuard');assert.equal(b.puddle!.x,CONTACT_X+30);assert.equal(advance(b,20).enemies[0].hp,10000);
 b={...b,approachAt:0,enemies:b.enemies.map(e=>({...e,x:365.1}))};b=advance(b,.1);
 assert.equal(b.puddle,null);assert.ok(b.puddleBurst);assert.equal(b.enemies[0].hp,9982);assert.equal(b.enemies[1].hp,10000);assert.equal(b.enemies[0].push!.to,ENEMY_BACK_X);
 assert.equal(b.casts,1);assert.equal(advance(b,.5).enemies[1].hp,10000);
});
test('Thistle Bush ticks every half second, counts actual damage across enemies, and has no knockback',()=>{
 let b=launchSpell(field([350,360,500]),48,'#fff','thistleBush');assert.equal(advance(b,.49).thistle!.spent,0);
 b=advance(b,.5);assert.equal(b.thistle!.spent,2);assert.equal(b.enemies[0].hp,9999);assert.equal(b.enemies[1].hp,9999);assert.equal(b.enemies[2].hp,10000);assert.equal(b.enemies[0].push,null);
 b=advance(b,9.5);assert.equal(b.thistle,null);assert.equal(b.enemies[0].hp,9980);assert.equal(b.enemies[1].hp,9980);
 assert.equal(advance(b,5).enemies[0].hp,9980);assert.equal(b.casts,1);
});
test('Thistle has no timeout, replaces a better bush with a worse one, and cannot spend overkill as actual damage',()=>{
 let b=launchSpell(field([500]),100,'#fff','thistleBush');b=advance(b,100);assert.equal(b.thistle!.spent,0);assert.equal(b.thistle!.budget,250);
 b=launchSpell(b,48,'#fff','thistleBush');assert.equal(b.thistle!.budget,40);assert.equal(b.thistle!.range,80);assert.equal(b.thistle!.spent,0);
 b=launchSpell(field([350,360,600]),100,'#fff','thistleBush');b.enemies[0].hp=2;b.enemies[1].shield=woodenShield();b=advance(b,.5);
 assert.equal(b.thistle!.spent,4.5); // 2 actual HP + a 5-damage tick halved by wood.
 assert.equal(b.enemies[1].hp,9997.5);
});
test('ground spells snapshot upgrades/relic multipliers and stale casts, and pause/end states stop ticks',()=>{
 let b=field([350]);b.damageBonus=2;b.upgrades.thistleBush=1;
 for(let i=0;i<4;i++)b=launchSpell(b,60,'#fff','thistleBush');
 b.damageBonus=1;b.upgrades={};const hp=b.enemies[0].hp;b=advance(b,.5);
 assert.equal(hp-b.enemies[0].hp,3.75);assert.equal(b.thistle!.spent,3.75);
 for(const phase of ['ready','victory','defeat'] as const){const paused={...b,phase};assert.equal(stepBattle(paused,1),paused);}
 assert.equal(newBattle('active').thistle,null);assert.equal(newBattle('active').puddle,null);
});
test('all new spells retain elemental, rocky and shield defenses and upgrade damage scaling',()=>{
 for(const id of ids)for(const q of [48,60,70,100]){
  const base=nearDamage(id,q),precision=id==='thistleBush'?1e6:1;
  assert.equal(spellDamage({element:'Neutral'},q,id,1,1),Math.round(base*1.25*precision)/precision);
  const rock=q<60?.5:q<70?.75:1;
  assert.equal(spellDamage({element:'Neutral',rocky:true},q,id),Math.round(base*rock*precision)/precision);
  assert.equal(spellKnockback(q,id,1,'Neutral',true),nearKnockback(id,q)*(q<60?0:rock));
  const own=SPELLS.find(s=>s.id===id)!.element;
  assert.equal(spellDamage({element:own},q,id),Math.round(base*.5*precision)/precision);
  assert.equal(spellDamage({element:'Neutral',shield:woodenShield()},q,id),Math.round(base*.5*precision)/precision);
 }
});
test('bottles deliver all three effects without changing cooldowns or stale streaks',()=>{
 for(const id of ids){let b=field([350,360]);b.stale={spellId:'water',count:4};b.cooldowns={chronos:24};b.potions.spellBottle=1;b.bottledSpells=[{spellId:id,quality:70}];b=advance(drinkPotion(b,'spellBottle'),.7);
  assert.deepEqual(b.stale,{spellId:'water',count:4});assert.equal(b.cooldowns.chronos,24);
  assert.ok(id==='flameBlade'?b.flameSwing:id==='puddleGuard'?b.puddleBurst:b.thistle);
 }
});
test('new spells are learnable, sold, upgraded and grouped by element in book order',()=>{
 const known=SPELLS.filter(s=>!ids.includes(s.id as typeof ids[number])).map(s=>s.id);
 for(const id of ids){const run={...newRun(),screen:'map' as const,node:2,spells:SPELLS.filter(s=>s.id!==id).map(s=>s.id)};
  assert.ok(enterNode(run,()=>0).stock.some(s=>s.item===id));assert.equal(spellPrice(id),45);
  const reward=finishBattle({...run,screen:'battle',combats:2},{...battleForRun(run),phase:'victory'},()=>0);assert.deepEqual(reward.reward!.offers,[id]);
  assert.equal(camp({...run,screen:'camp',spells:[...run.spells,id]},id).upgrades[id],1);assert.ok(spellUpgradePreview(id)!.nextDamage>spellUpgradePreview(id)!.currentDamage);
 }
 assert.equal(spellbookColumns([...known,...ids]).flatMap(c=>c.spells).filter(s=>ids.includes(s.id as typeof ids[number])).length,3);
});
test('near-distance practice makes melee and placed spells reachable without changing the journey',()=>{
 for(const id of ids){let b=restoreScarecrow(newPracticeBattle(practiceJourney()),false,true);b=launchSpell(b,100,'#fff',id);let damage=practiceDamage(b);b=restoreScarecrow(b,false,true);
  for(let i=0;i<60;i++){b=stepPracticeBattle(b,.01,false,-1,true).battle;damage+=practiceDamage(b);b=restoreScarecrow(b,false,true);}
  assert.ok(damage>0,id);assert.equal(b.enemies[0].x,355);assert.equal(b.playerHP,100);
 }
});

test('approved Flame Blade variant retains the blade and expands only guard and hilt',()=>{
 const spell=SPELLS.find(s=>s.id==='flameBlade')!,variant=SPELL_VARIATIONS.flameBlade![0];
 assert.deepEqual(variant[0],spell.strokes[0]);
 assert.ok(Math.abs(variant[1][1].x-variant[1][0].x-44*1.2)<1e-8);
 assert.ok(Math.abs(variant[2][1].y-variant[2][0].y-26*1.2)<1e-8);
 for(const scale of [.2,1,4]){const strokes=variant.slice().reverse().map(s=>s.slice().reverse().map(p=>({x:90+p.x*scale,y:-15+p.y*scale})));const match=recognize(strokes);assert.equal(match.spell?.id,'flameBlade');assert.equal(match.quality,100);}
});
test('Puddle Guard requires the circle and centered Dewdrop while its doubled push respects the far edge',()=>{
 const spell=SPELLS.find(s=>s.id==='puddleGuard')!,water=SPELLS.find(s=>s.id==='water')!;
 assert.equal(spell.strokes.length,2);const circle=spell.strokes[0];
 for(const p of circle)assert.ok(Math.abs(Math.hypot(p.x-50,p.y-50)-42)<.02);
 for(const [i,p] of spell.strokes[1].entries()){const w=water.strokes[0][i];assert.ok(Math.abs(p.x-(50+(w.x-50)*.5))<1e-8);assert.ok(Math.abs(p.y-(50+(w.y-51)*.5))<1e-8);}
 assert.notEqual(recognize([circle],['puddleGuard']).spell?.id,'puddleGuard');
 for(const q of [48,59,60,69,70,79,80,100]){
  const b=advance(launchSpell(field([355]),q,'#fff','puddleGuard'),.01),push=b.enemies[0].push!;
  assert.equal(push.to,Math.min(ENEMY_BACK_X,push.from+nearKnockback('puddleGuard',q)));
  assert.ok(push.to<=ENEMY_BACK_X);
 }
});

test('extended Thistle range reaches 150 units, while enlarged Puddle art preserves its trigger area',()=>{
 const bush=advance(launchSpell(field([475,475.01,600]),100,'#fff','thistleBush'),.5);
 assert.equal(bush.enemies[0].hp,9995);assert.equal(bush.enemies[1].hp,10000);
 const guard=advance(launchSpell(field([380]),100,'#fff','puddleGuard'),1);
 assert.ok(guard.puddle);assert.equal(guard.enemies[0].hp,10000);
});
