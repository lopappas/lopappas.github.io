import {test} from 'node:test';
import assert from 'node:assert/strict';
import {SPELLS,SPELL_VARIATIONS,recognize,type SpellId} from '../src/magic.ts';
import {nearDamage,nearKnockback,thistleStats} from '../src/nearSpells.ts';
import {newBattle,launchSpell,stepBattle,spellDamage,spellKnockback,hitWithSpell,drinkPotion,CONTACT_X,ENEMY_BACK_X,type Battle} from '../src/battle.ts';
import {rollSpellOffers,newRun,enterNode,finishBattle,battleForRun,camp,spellPrice} from '../src/run.ts';
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
 const endpoints=[[48,54.74,80,30.08],[59,87.584,90,45.12],[60,98.532,95,56.4],[69,142.324,110,82.72],[70,153.272,115,94],[79,197.064,130,127.84],[80,208.012,135,142.88],[100,273.7,150,188]];
 for(const [q,push,range,budget] of endpoints){assert.equal(nearKnockback('puddleGuard',q),push);assert.deepEqual(thistleStats(q),{range,budget});}
 for(const q of [0,47,NaN,Infinity])for(const id of ids)assert.equal(launchSpell(field(),q,'#fff',id).casts,0);
});
test('Flame Blade hits every present enemy within 110 units exactly once, without a projectile or distant fallback',()=>{
 const b=field([325,435,436,350]);b.enemies[3].spawnAt=5;const before=structuredClone(b),n=launchSpell(b,70,'#fff','flameBlade');
 assert.deepEqual(b,before);assert.equal(n.casts,1);assert.equal(n.projectile,null);
 assert.equal(n.enemies[0].hp,10000-61);assert.equal(n.enemies[1].hp,10000-61);assert.equal(n.enemies[2].hp,10000);assert.equal(n.enemies[3].hp,10000);
 assert.equal(n.enemies[0].push,null);
 const empty=launchSpell(field([500]),100,'#fff','flameBlade');assert.ok(empty.flameSwing);assert.equal(empty.enemies[0].hp,10000);assert.equal(advance(n,.4).enemies[0].hp,n.enemies[0].hp);
});
test('Puddle Guard persists, triggers only the first walking enemy, launches it, and then disappears',()=>{
 let b=launchSpell(field([400,400]),100,'#fff','puddleGuard');assert.equal(b.puddle!.x,CONTACT_X+30);assert.equal(advance(b,20).enemies[0].hp,10000);
 b={...b,approachAt:0,enemies:b.enemies.map(e=>({...e,x:365.1}))};b=advance(b,.1);
 assert.equal(b.puddle,null);assert.ok(b.puddleBurst);assert.equal(b.enemies[0].hp,10000);assert.equal(b.enemies[1].hp,10000);assert.ok(Math.abs(b.enemies[0].push!.to-b.enemies[0].push!.from-273.7)<1e-8);
 assert.equal(b.casts,1);assert.equal(advance(b,.5).enemies[1].hp,10000);
});
test('Thistle Bush ticks every half second, counts actual damage across enemies, and has no knockback',()=>{
 let b=launchSpell(field([350,360,500]),48,'#fff','thistleBush');assert.equal(advance(b,.49).thistle!.spent,0);
 b=advance(b,.5);assert.equal(b.thistle!.spent,2.5);assert.equal(b.enemies[0].hp,9998.75);assert.equal(b.enemies[1].hp,9998.75);assert.equal(b.enemies[2].hp,10000);assert.equal(b.enemies[0].push,null);
 b=advance(b,9.5);assert.equal(b.thistle,null);assert.equal(b.enemies[0].hp,9983.75);assert.equal(b.enemies[1].hp,9985);
 assert.equal(advance(b,5).enemies[0].hp,9983.75);assert.equal(b.casts,1);
});
test('Thistle has no timeout, replaces a better bush with a worse one, and cannot spend overkill as actual damage',()=>{
 let b=launchSpell(field([500]),100,'#fff','thistleBush');b=advance(b,100);assert.equal(b.thistle!.spent,0);assert.equal(b.thistle!.budget,188);
 b=launchSpell(b,48,'#fff','thistleBush');assert.equal(b.thistle!.budget,30.08);assert.equal(b.thistle!.range,80);assert.equal(b.thistle!.spent,0);
 b=launchSpell(field([350,360,600]),100,'#fff','thistleBush');b.enemies[0].hp=2;b.enemies[1].shield=woodenShield();b=advance(b,.5);
 assert.equal(b.thistle!.spent,4.625); // 2 actual HP + a 5.25-damage tick halved by wood.
 assert.equal(b.enemies[1].hp,9997.375);
});
test('ground spells snapshot upgrades/relic multipliers and stale casts, and pause/end states stop ticks',()=>{
 let b=field([350]);b.damageBonus=2;b.upgrades.thistleBush=1;
 for(let i=0;i<4;i++){if(i)b=advance(b,15);b=launchSpell(b,60,'#fff','thistleBush');}
 b.damageBonus=1;b.upgrades={};const hp=b.enemies[0].hp;b=advance(b,.5);
 assert.ok(Math.abs(hp-b.enemies[0].hp-3.975)<1e-8);assert.equal(b.thistle!.spent,3.975);
 for(const phase of ['ready','victory','defeat'] as const){const paused={...b,phase};assert.equal(stepBattle(paused,1),paused);}
 assert.equal(newBattle('active').thistle,null);assert.equal(newBattle('active').puddle,null);
});
test('all new spells retain elemental, rocky and shield defenses and upgrade damage scaling',()=>{
 for(const id of ids)for(const q of [48,60,70,100]){
  const base=nearDamage(id,q),precision=id==='thistleBush'?1e6:1;
  assert.equal(spellDamage({element:'Neutral'},q,id,1,1),Math.round((id==='thistleBush'?base+.4:base*1.25)*precision)/precision);
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
  assert.ok(enterNode(run,()=>0).stock.some(s=>s.kind==='randomSpell')&&rollSpellOffers(run,()=>0).includes(id));assert.equal(spellPrice(id),100);
  const reward=finishBattle({...run,screen:'battle',combats:4},{...battleForRun(run),phase:'victory'},()=>0);assert.deepEqual(reward.reward!.offers,[id]);
  assert.equal(camp({...run,screen:'camp',spells:[...run.spells,id]},id).upgrades[id],1);const preview=spellUpgradePreview(id)!;assert.ok(id==='puddleGuard'?preview.nextKnockback>preview.currentKnockback:preview.nextDamage>preview.currentDamage);
 }
 assert.equal(spellbookColumns([...known,...ids]).flatMap(c=>c.spells).filter(s=>ids.includes(s.id as typeof ids[number])).length,3);
});
test('near-distance practice makes melee and placed spells reachable without changing the journey',()=>{
 for(const id of ids){let b=restoreScarecrow(newPracticeBattle(practiceJourney()),false,true);b=launchSpell(b,100,'#fff',id);let damage=practiceDamage(b);b=restoreScarecrow(b,false,true);
  for(let i=0;i<60;i++){b=stepPracticeBattle(b,.01,false,-1,true).battle;damage+=practiceDamage(b);b=restoreScarecrow(b,false,true);}
  assert.ok(id==='puddleGuard'?damage===0&&b.puddle===null:damage>0,id);assert.equal(b.enemies[0].x,355);assert.equal(b.playerHP,100);
 }
});

test('approved Flame Blade variant retains the blade and expands only guard and hilt',()=>{
 const spell=SPELLS.find(s=>s.id==='flameBlade')!,variant=SPELL_VARIATIONS.flameBlade![0];
 assert.deepEqual(variant[0],spell.strokes[0]);
 assert.ok(Math.abs(variant[1][1].x-variant[1][0].x-44*1.2)<1e-8);
 assert.ok(Math.abs(variant[2][1].y-variant[2][0].y-26*1.2)<1e-8);
 for(const scale of [.2,1,4]){const strokes=variant.slice().reverse().map(s=>s.slice().reverse().map(p=>({x:90+p.x*scale,y:-15+p.y*scale})));const match=recognize(strokes);assert.equal(match.spell?.id,'flameBlade');assert.equal(match.quality,100);}
});
test('Puddle Guard uses the approved symmetric one-stroke wave while its reduced push respects the far edge',()=>{
 const spell=SPELLS.find(s=>s.id==='puddleGuard')!;
 assert.equal(spell.strokes.length,1);assert.equal(SPELL_VARIATIONS.puddleGuard,undefined);
 const wave=spell.strokes[0];assert.deepEqual(wave[0],{x:6,y:55});assert.deepEqual(wave.at(-1),{x:94,y:55});
 for(let i=0;i<wave.length;i++){assert.ok(Math.abs(wave[i].x+wave[wave.length-1-i].x-100)<1e-8);assert.ok(Math.abs(wave[i].y-wave[wave.length-1-i].y)<1e-8);}
 assert.equal(Math.min(...wave.map(p=>p.y)),44);assert.equal(Math.max(...wave.map(p=>p.y)),56);
 for(const q of [48,59,60,69,70,79,80,100]){
  const b=advance(launchSpell(field([355]),q,'#fff','puddleGuard'),.01),push=b.enemies[0].push!;
  assert.equal(push.to,Math.min(ENEMY_BACK_X,push.from+nearKnockback('puddleGuard',q)));
  assert.ok(push.to<=ENEMY_BACK_X);
 }
});

test('extended Thistle range reaches 150 units, while enlarged Puddle art preserves its trigger area',()=>{
 const bush=advance(launchSpell(field([475,475.01,600]),100,'#fff','thistleBush'),.5);
 assert.equal(bush.enemies[0].hp,9994.75);assert.equal(bush.enemies[1].hp,10000);
 const guard=advance(launchSpell(field([380]),100,'#fff','puddleGuard'),1);
 assert.ok(guard.puddle);assert.equal(guard.enemies[0].hp,10000);
});

test('damage increases apply at every quality before upgrades and resistance rounding',()=>{
 for(let q=48;q<=100;q++){
  const tier=q<60?0:q<70?1:q<80?2:3,[lo,hi]=[[48,59],[60,69],[70,79],[80,100]][tier];
  const [a,b]=[[24,34],[45,58],[70,90],[105,140]][tier];
  const [c,d]=[[1,1.5],[2,2.5],[3,3.5],[4,5]][tier];
  assert.ok(Math.abs(nearDamage('flameBlade',q)-(a+(b-a)*(q-lo)/(hi-lo))*1.16*.79*.95)<1e-8);
  assert.ok(Math.abs(nearDamage('thistleBush',q)-(c+(d-c)*(q-lo)/(hi-lo)+.25))<1e-8);
 }
});

test('Puddle Guard deals zero damage even with upgrades and offensive relic bonuses',()=>{
 for(const q of [48,59,60,69,70,79,80,100]){
  let b=field([355]);b.damageBonus=99;b.furyReady=true;b.lotus=true;b.lotusReady=true;b.midnightStone=true;b.amulets={sun:true,moon:true,twilight:true};b.upgrades.puddleGuard=1;
  b=launchSpell(b,q,'#fff','puddleGuard',100);assert.equal(b.lotusReady,true);
  b=advance(b,.01);assert.equal(b.enemies[0].hp,10000);assert.equal(b.enemies[0].burn,null);assert.ok(b.enemies[0].push);
 }
});
test('Puddle upgrade snapshots a 20 percent knockback bonus and Flame Blade reaches only 110 units',()=>{
 for(const q of [48,60,70,100]){
  let b=field([355]);b.upgrades.puddleGuard=1;b=launchSpell(b,q,'#fff','puddleGuard');b.upgrades={};b=advance(b,.01);
  assert.ok(Math.abs(b.enemies[0].push!.to-Math.min(ENEMY_BACK_X,355+nearKnockback('puddleGuard',q)*1.2))<1e-8);
 }
 const preview=spellUpgradePreview('puddleGuard')!;assert.equal(preview.knockback,true);assert.equal(preview.nextBonus,20);assert.equal(preview.currentDamage,0);assert.equal(preview.nextDamage,0);assert.ok(Math.abs(preview.nextKnockback-preview.currentKnockback*1.2)<1e-8);
 const blade=launchSpell(field([435,435.01,600]),100,'#fff','flameBlade');assert.ok(blade.enemies[0].hp<10000);assert.equal(blade.enemies[1].hp,10000);
});

test('Thistle upgrade adds 0.4 per tick and 15 percent actual-damage budget at every quality',()=>{
 for(let q=48;q<=100;q++){
  const base=spellDamage({element:'Neutral'},q,'thistleBush');
  assert.ok(Math.abs(spellDamage({element:'Neutral'},q,'thistleBush',1,1)-base-.4)<1e-8);
  const normal=thistleStats(q),upgraded=thistleStats(q,1);
  assert.equal(upgraded.range,normal.range);assert.ok(Math.abs(upgraded.budget-normal.budget*1.15)<1e-6);
  assert.equal(spellDamage({element:'Neutral'},q,'thistleBush',1,99),spellDamage({element:'Neutral'},q,'thistleBush',1,1));
 }
 const preview=spellUpgradePreview('thistleBush')!;
 assert.equal(preview.currentDamage,2.25);assert.equal(preview.nextDamage,2.65);
 assert.equal(preview.currentThreshold,56.4);assert.equal(preview.nextThreshold,64.86);
});

test('Thistle appearance time and upgraded budget snapshot on drawn and bottled casts and restart on replacement',()=>{
 for(const bottled of [false,true]){
  let b=advance(field([500]),2);b.upgrades.thistleBush=1;
  if(bottled){b.potions.spellBottle=1;b.bottledSpells=[{spellId:'thistleBush',quality:100}];b=advance(drinkPotion(b,'spellBottle'),.66);}
  else b=launchSpell(b,100,'#fff','thistleBush');
  assert.ok(b.time-b.thistle!.started<.011);assert.equal(b.thistle!.budget,216.2);
  const started=b.thistle!.started;b.upgrades={};b=advance(b,15);assert.equal(b.thistle!.started,started);assert.equal(b.thistle!.budget,216.2);
  b=launchSpell(b,48,'#fff','thistleBush');assert.equal(b.thistle!.started,b.time);assert.equal(b.thistle!.budget,30.08);assert.equal(b.thistle!.spent,0);
 }
});


test('Flame Blade has no knockback at every quality and upgrade, including bottled casts and push relics',()=>{
 for(let q=48;q<=100;q++)for(const upgrade of [0,1]){
  let b=field([350,360]);b.upgrades.flameBlade=upgrade;b.pushBonus=20;
  assert.equal(spellKnockback(q,'flameBlade',20,'Water',false,null,0,upgrade),0);
  const hit=launchSpell(b,q,'#fff','flameBlade');assert.ok(hit.enemies.every(e=>e.push===null));assert.ok(hit.enemies.every(e=>e.hp<10000));
  b.potions.spellBottle=1;b.bottledSpells=[{spellId:'flameBlade',quality:q}];const bottle=advance(drinkPotion(b,'spellBottle'),.66);assert.ok(bottle.enemies.every(e=>e.push===null));
 }
 const b=field([350]);b.enemies[0].push={from:350,to:500,started:0,ends:.28};const hit=launchSpell(b,100,'#fff','flameBlade');assert.deepEqual(hit.enemies[0].push,b.enemies[0].push);
});
