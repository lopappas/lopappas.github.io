import test from 'node:test';
import assert from 'node:assert/strict';
import {newBattle,drinkPotion,stepBattle,spellDamage,POTION_IDS,COMMON_POTIONS,RARE_POTIONS,potionPrice,potionName,POTIONS,ENEMY_BACK_X,type Battle,type Potion} from '../src/battle.ts';
import {newRun,battleForRun,RELICS,enterNode,finishBattle,type RelicId} from '../src/run.ts';
import {bookTiming,GuideCooldown} from '../src/guide.ts';
import {enemyStatusLabel} from '../src/timeVisuals.ts';
import {ENCYCLOPEDIA_ENTRIES} from '../src/encyclopedia.ts';

function field():Battle{
 const b=newBattle('active','pack',()=>0);
 return {...b,approachAt:1000,enemies:b.enemies.map((e,i)=>({...e,x:400+i*60,element:'Neutral',hp:1000,maxHP:1000}))};
}
function advance(b:Battle,seconds:number){for(let i=0;i<Math.round(seconds*100);i++)b=stepBattle(b,.01);return b;}
function throwPotion(b:Battle,id:Potion){return drinkPotion({...b,potions:{...b.potions,[id]:1}},id);}

test('Book Worm changes combat opening and trace timing without changing the guide cooldown',()=>{
 assert.deepEqual(bookTiming(),{openMs:500,traceMs:1500});
 assert.deepEqual(bookTiming(true),{openMs:250,traceMs:2000});
 const cooldown=new GuideCooldown();assert.equal(cooldown.tryStart(0),true);
 cooldown.finish(bookTiming(true).traceMs);assert.equal(cooldown.isReady(9999),false);assert.equal(cooldown.isReady(10000),true);
 assert.equal(RELICS.bookWorm.description,'Open spell book faster during combat and slightly increase perfect trace duration');
});

test('new relics are common, available from merchants and elite rewards, and enable combat vial effects',()=>{
 for(const id of ['bookWorm','hazardousVials'] as const){
  assert.equal(RELICS[id].rarity,'Common');
  const relics=(Object.keys(RELICS) as RelicId[]).filter(other=>other!==id);
  assert.ok(enterNode({...newRun(),screen:'map',node:2,relics},()=>0).stock.some(s=>s.item===id));
  assert.equal(finishBattle({...newRun(),screen:'battle',node:3,relics},{...newBattle('active'),phase:'victory'},()=>0).reward?.relic,id);
 }
 assert.equal(battleForRun({...newRun(),relics:['hazardousVials']}).hazardousVials,true);
 assert.equal(battleForRun(newRun()).hazardousVials,false);
});

test('curse potion rarities, prices, inventory and between-combat persistence use the existing potion flow',()=>{
 for(const [id,pool,price] of [['miasma',RARE_POTIONS,36]] as const){
  assert.ok(POTION_IDS.includes(id));assert.ok(pool.includes(id));assert.equal(potionPrice(id),price);
  const run={...newRun(),screen:'battle' as const,potions:{heal:0,freeze:0,ink:0,[id]:2}};
  const battle=battleForRun(run);assert.equal(battle.potions[id],2);
  const reward=finishBattle(run,{...battle,phase:'victory'},()=>.99);
  assert.equal(battleForRun(reward).potions[id],2);
 }
});

test('Miasma deals twelve ticks of three damage then clears its curse and status label',()=>{
 const input=field(),original=structuredClone(input);let b=advance(throwPotion(input,'miasma'),.64);
 assert.ok(b.enemies.every(e=>e.potionCurseTick===null&&e.hp===1000));
 b=advance(b,.02);assert.ok(b.enemies.every(e=>e.potionCurseTick!>b.time));
 assert.equal(enemyStatusLabel(b.enemies[0],b),'Cursed');
 b=advance(b,.98);assert.equal(b.enemies[0].hp,1000);
 b=advance(b,.02);assert.equal(b.enemies[0].hp,997);
 b=advance(b,11);assert.deepEqual(b.enemies.map(e=>e.hp),[964,964]);
 assert.ok(b.enemies.every(e=>e.potionCurseTick===null));assert.equal(enemyStatusLabel(b.enemies[0],b),null);
 b=advance(b,20);assert.deepEqual(b.enemies.map(e=>e.hp),[964,964]);assert.deepEqual(input,original);
});

test('repeat Miasma refreshes twelve seconds without stacking or postponing the next tick',()=>{
 let b=advance(throwPotion(field(),'miasma'),.66);const tick=b.enemies[0].potionCurseTick,until=b.enemies[0].potionCurseUntil;
 b=advance(b,3);b=advance(throwPotion(b,'miasma'),.66);
 assert.equal(b.enemies[0].potionCurseTick,tick!+3);assert.ok(b.enemies[0].potionCurseUntil>until+3.6);
 const hp=b.enemies[0].hp;b=advance(b,.34);assert.equal(b.enemies[0].hp,hp-3);
 b=advance(b,11.66);assert.equal(b.enemies[0].potionCurseTick,null);
 const end=b.enemies[0].hp;b=advance(b,10);assert.equal(b.enemies[0].hp,end);
});

test('Small curse is removed and Miasma has the same single name in every display',()=>{
 assert.ok(!POTION_IDS.some(id=>String(id)==='smallCurse'));assert.ok(!COMMON_POTIONS.some(id=>String(id)==='smallCurse'));
 assert.equal(POTIONS.miasma.name,'Miasma');assert.equal(potionName('miasma'),'Miasma');
 assert.equal(ENCYCLOPEDIA_ENTRIES.find(e=>e.key==='potions:miasma')?.name,'Miasma');assert.ok(!ENCYCLOPEDIA_ENTRIES.some(e=>e.key==='potions:smallCurse'));
});

test('Miasma affects present enemies only, ignores defenses and persists during freeze',()=>{
 let b=newBattle('active','shieldPack',()=>0);b.approachAt=1000;
 b.enemies=b.enemies.map(e=>({...e,hp:1000,maxHP:1000,rocky:true}));
 b=advance(throwPotion(b,'miasma'),.66);assert.ok(b.enemies.slice(0,2).every(e=>e.potionCurseTick!==null));assert.equal(b.enemies[2].potionCurseTick,null);
 b.freezeUntil=20;b=advance(b,15);
 assert.deepEqual(b.enemies.map(e=>e.hp),[964,964,1000]);assert.equal(b.enemies[2].potionCurseTick,null);
});

test('potion curses coexist with Impossible Shale and can finish combat',()=>{
 let b=field();b.enemies=b.enemies.slice(0,1);b.enemies[0].curseTick=1.65;
 b=advance(throwPotion(b,'miasma'),1.66);assert.equal(b.enemies[0].hp,992);
 b.enemies[0].hp=3;b.enemies[0].curseTick=null;b=advance(b,1);
 assert.equal(b.enemies[0].hp,0);assert.equal(b.phase,'victory');
 assert.equal(newBattle('active').enemies[0].potionCurseTick,null);
});

test('Hazardous Vials triggers once for every potion, including empty bottles, with flat damage and slight push',()=>{
 for(const id of POTION_IDS){
  let b=field();b.hazardousVials=true;b.damageBonus=10;b.pushBonus=10;
  b.enemies=b.enemies.map(e=>({...e,rocky:true,shield:{...newBattle('active','shieldPack').enemies[0].shield!}}));
  if(id==='spellBottle')b.bottledSpells=[{spellId:null,quality:10}];
  const before=structuredClone(b);b=throwPotion(b,id);b=advance(b,.64);
  assert.ok(b.enemies.every(e=>e.hp===1000));b=advance(b,.02);
  assert.deepEqual(b.enemies.map(e=>e.hp),[990,990]);assert.deepEqual(b.enemies.map(e=>e.push!.to),[425,485]);
  b=advance(b,.5);assert.deepEqual(b.enemies.map(e=>e.hp),[990,990]);assert.deepEqual(before.enemies.map(e=>e.hp),[1000,1000]);
 }
});

test('vial pops exclude future arrivals, add up across simultaneous pops and stop at the far edge',()=>{
 let b=field();b.hazardousVials=true;b.enemies[0].x=ENEMY_BACK_X-5;b.enemies[1].spawnAt=10;
 b=throwPotion(throwPotion(b,'heal'),'ink');b=advance(b,.66);
 assert.deepEqual(b.enemies.map(e=>e.hp),[980,1000]);assert.equal(b.enemies[0].push!.to,ENEMY_BACK_X);assert.equal(b.enemies[1].push,null);
 const paused={...b,phase:'ready' as const};assert.equal(stepBattle(paused,10),paused);
});

test('bottled spells keep their stronger knockback while also triggering Hazardous Vials',()=>{
 let b=field();b.bottledSpells=[{spellId:'water',quality:60}];b.hazardousVials=true;
 b=advance(throwPotion(b,'spellBottle'),.66);
 assert.equal(b.enemies[0].hp,1000-spellDamage({element:'Neutral'},60,'water')-10);
 assert.ok(b.enemies[0].push!.to>425);assert.equal(b.enemies[1].hp,990);
});

test('lethal vial pops start the Slime Mother split and curses can kill the mother without cursing offspring',()=>{
 for(const vial of [false,true]){
  let b=newBattle('active','mother',()=>0);b.approachAt=1000;b.enemies[0].hp=vial?10:3;b.hazardousVials=vial;
  b=advance(throwPotion(b,vial?'heal':'miasma'),vial?.66:1.66);
  assert.ok(b.motherSplit);assert.equal(b.enemies[0].hp,0);assert.equal(b.phase,'active');
  b=advance(b,2.1);assert.equal(b.enemies.length,4);assert.ok(b.enemies.slice(1).every(e=>e.potionCurseTick===null));
 }
});
