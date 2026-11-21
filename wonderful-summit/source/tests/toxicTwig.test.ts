import {woodenShield} from '../src/shields.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createSpider,drinkPotion,launchSpell,newBattle,spellCooldownRemaining,spellDamage,spellKnockback,spellTarget,stepBattle,toxicTwigCastPreview,toxicTwigTotalDamage,type Battle} from '../src/battle.ts';
import {gradeDrawnCast,recognize,SPELLS,type Strokes} from '../src/magic.ts';
import {practiceLesson} from '../src/practiceLessons.ts';

function field(upgrade=0){
 const battle=newBattle('active','slime',()=>0);
 return {...battle,approachAt:Infinity,upgrades:{toxicTwig:upgrade},enemies:[{...battle.enemies[0],element:'Neutral' as const,hp:1000,maxHP:1000}]};
}
function at(battle:Battle,time:number){
 while(battle.time<time-1e-9)battle=stepBattle(battle,Math.min(.1,time-battle.time));
 return battle;
}
const cast=(battle:Battle)=>launchSpell(battle,80,'#9bbe72','toxicTwig');

test('Cursed Twig is an Uncommon Nature spell recognized as a stem crossed by two short lines',()=>{
 const spell=SPELLS.find(s=>s.id==='toxicTwig')!;
 const lesson=practiceLesson(spell.id)!;
 assert.equal(spell.name,'Cursed Twig');
 assert.equal(spell.element,'Nature');
 assert.equal(spell.rarity,'Uncommon');
 assert.equal(lesson.paths.length,3);
 const result=recognize(lesson.paths.map(path=>path.map(({x,y})=>({x:x*1.4+7,y:y*1.4+9}))));
 assert.equal(result.spell?.id,spell.id);
 assert.ok(result.quality>=98);
});

test('slightly misplaced and wobbly Cursed Twig drawings still earn Wonderful',()=>{
 const twig=SPELLS.find(spell=>spell.id==='toxicTwig')!;
 const [stem,...bars]=twig.strokes;
 const highBars=[stem,...bars.map(stroke=>stroke.map(p=>({...p,y:p.y-5})))];
 const rough:Strokes=[
  [{x:50,y:10},{x:52,y:32},{x:49,y:50},{x:52,y:70},{x:53,y:90}],
  [{x:31,y:38},{x:47,y:40},{x:68,y:41}],
  [{x:32,y:55},{x:48,y:54},{x:69,y:56}],
 ];
 for(const strokes of [highBars,rough]){
  const match=gradeDrawnCast(recognize(strokes));
  assert.equal(match.spell,twig);
  assert.ok(match.quality>=80&&match.quality<100);
 }
});

test('Cursed Twig uses the separate-bar reference and penalizes a connecting line',()=>{
 const twig=SPELLS.find(spell=>spell.id==='toxicTwig')!;
 const [stem,upper,lower]=twig.strokes;
 const right=[upper[0],upper[1],lower[1],lower[0]];
 const left=[upper[1],upper[0],lower[0],lower[1]];
 for(const bars of [left,right]){
  const match=recognize([bars,stem]);
  assert.equal(match.spell,twig);
  assert.ok(match.quality<100);
 }
 assert.equal(recognize([stem,upper]).spell,null);
});

test('Cursed Twig targets the most current HP among living enemies already on the field',()=>{
 const battle=field();
 battle.enemies=[
  {...createSpider(1,410),hp:200,maxHP:900},
  {...createSpider(2,480),hp:300,maxHP:300},
  {...createSpider(3,530),hp:500,maxHP:500,spawnAt:2},
  {...createSpider(4,560),hp:300,maxHP:500},
 ];
 assert.equal(spellTarget(battle,'toxicTwig')?.id,2);
 const planted=cast(battle);
 assert.deepEqual(planted.enemies.map(e=>e.toxicTwig?.length??0),[0,1,0,0]);
 assert.deepEqual(planted.enemies.map(e=>e.hp),battle.enemies.map(e=>e.hp));
 assert.deepEqual(at(planted,1.5).enemies.map(e=>e.hp),[200,294,500,300]);
});

test('an 80% cast waits 1.5 seconds, then ramps over ten ticks for 150 or 180 damage',()=>{
 for(const upgrade of [0,1]){
  const battle=field(upgrade);
  const total=upgrade?180:150;
  assert.equal(toxicTwigCastPreview(battle,80,0),total);
  assert.equal(toxicTwigTotalDamage({element:'Water'},80,1,upgrade),total);
  let state=cast(battle);
  assert.equal(spellDamage(state.enemies[0],80,'toxicTwig'),0);
  assert.equal(spellKnockback(80,'toxicTwig'),0);
  assert.equal(at(state,1.499).enemies[0].hp,1000);
  for(let i=0;i<10;i++){
   const previous=state.enemies[0].hp;
   state=at(state,(i+1)*1.5);
   const damage=(6+2*i)*(upgrade?1.2:1);
   assert.ok(Math.abs(previous-state.enemies[0].hp-damage)<1e-8);
   assert.equal(state.enemies[0].push,null);
  }
  assert.ok(Math.abs(1000-state.enemies[0].hp-total)<1e-8);
  assert.deepEqual(state.enemies[0].toxicTwig,[]);
  assert.equal(at(state,17).enemies[0].hp,state.enemies[0].hp);
 }
});

test('recasts skip cursed enemies until the curse expires',()=>{
 const base=field();
 base.enemies.push({...createSpider(2,530),hp:500,maxHP:500});
 const first=cast(base);
 assert.equal(spellCooldownRemaining(first,'toxicTwig'),0);
 const second=cast(at(first,3));
 assert.deepEqual(second.enemies.map(e=>e.toxicTwig?.length),[1,1]);
 assert.equal(spellTarget(second,'toxicTwig'),undefined);
 assert.equal(cast(second),second);
 const expired=at(second,15);
 assert.deepEqual(expired.enemies.map(e=>e.hp),[850,396]);
 assert.equal(spellTarget(expired,'toxicTwig')?.id,1);
 assert.deepEqual(cast(expired).enemies.map(e=>e.toxicTwig?.length),[1,1]);
});

test('a bottled Cursed Twig applies its poison on impact without starting a cooldown',()=>{
 const battle=field();
 battle.potions.spellBottle=1;
 battle.bottledSpells=[{spellId:'toxicTwig',quality:80}];
 const impact=at(drinkPotion(battle,'spellBottle'),.7);
 const poison=impact.enemies[0].toxicTwig![0];
 assert.equal(impact.enemies[0].hp,1000);
 assert.equal(spellCooldownRemaining(impact,'toxicTwig'),0);
 assert.equal(at(impact,poison.started+1.5).enemies[0].hp,994);
});

test('Cursed Twig ignores elemental matchups and respects rocky defense',()=>{
 for(const element of ['Neutral','Fire','Water','Nature'] as const){
  const battle=field();
  battle.enemies[0]={...battle.enemies[0],element};
  assert.equal(1000-at(cast(battle),15).enemies[0].hp,150);
 }
 const battle=field();
 const enemy={...battle.enemies[0],rocky:true};
 battle.enemies[0]=enemy;
 const damage=toxicTwigTotalDamage({element:'Neutral'},60)*.75;
 const castAtSteady=launchSpell(battle,60,'#9bbe72','toxicTwig');
 assert.ok(Math.abs(1000-at(castAtSteady,15).enemies[0].hp-damage)<1e-5);
});

test('Cursed Twig bypasses intact and burning wooden shields in previews and actual ticks',()=>{
 for(const burning of [false,true]){
  const battle=field();
  const shield={...woodenShield(),burnUntil:burning?2:null};
  battle.enemies[0]={...battle.enemies[0],shield};
  assert.equal(toxicTwigCastPreview(battle,80,0),150);
  const cursed=at(cast(battle),1.5);
  assert.equal(cursed.enemies[0].hp,994);
  assert.deepEqual(cursed.enemies[0].shield,shield);
  assert.equal(at(cursed,15).enemies[0].hp,850);
 }
});
