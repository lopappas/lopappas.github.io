import {test} from 'node:test';
import assert from 'node:assert/strict';
import {SPELLS} from '../src/magic.ts';
import {newBattle,hitWithSpell,launchSpell,stepBattle,spellDamage,spellKnockback,burnDamage,drinkPotion} from '../src/battle.ts';
import {newTutorial,beginTutorial,handleTutorialEvent,tutorialLessonInfo,TUTORIAL_LESSONS,stepTutorialBattle} from '../src/tutorial.ts';

test('all spells respect the complete elemental damage and knockback matrix, including neutral enemies',()=>{
 const beats={Water:'Fire',Fire:'Nature',Nature:'Water'} as const;
 for(const spell of SPELLS.filter(s=>s.id!=='chronos'))for(const element of ['Water','Fire','Nature','Neutral'] as const){
  const own=element===spell.element,weak=element!=='Neutral'&&beats[element]===spell.element;
  const factor=element==='Neutral'?1:own?.5:weak?.75:1.5;
  const base=spellDamage({element:'Neutral'},100,spell.id,1.15,2);
  // Use a value with the game's full damage modifiers before its single rounding.
  const spellFactor=spell.id==='wave'?.8:spell.id==='bolt'?1.4:spell.id==='leaf'?.75:1;
  const expected=Math.round(64*spellFactor*1.15*1.5*factor);
  assert.equal(spellDamage({element},100,spell.id,1.15,2),expected);
  const battle=newBattle('active');battle.damageBonus=1.15;battle.pushBonus=1.25;battle.upgrades[spell.id]=2;
  battle.enemies[0]={...battle.enemies[0],element,x:330,hp:1000,maxHP:1000};
  const hit=hitWithSpell(battle,100,spell.id),enemy=hit.enemies[0];
  assert.equal(1000-enemy.hp,expected);
  const push=spellKnockback(100,spell.id,1.25)*(own?.7:weak?.85:1);
  assert.equal(spellKnockback(100,spell.id,1.25,element),push);
  assert.ok(Math.abs(enemy.push!.to-Math.min(640,330+push))<1e-8);
  assert.ok(base>0);
 }
});

test('same-element spells cannot burn or slow; normal resistance preserves full spell effects',()=>{
 for(const [id,element] of [['bolt','Fire'],['leaf','Nature']] as const){
  const b=newBattle('active');b.enemies[0]={...b.enemies[0],element,hp:1000,maxHP:1000};
  let hit=hitWithSpell(b,100,id);assert.equal(hit.enemies[0].burn,null);assert.equal(hit.enemies[0].slowUntil,0);
  b.enemies[0]={...b.enemies[0],burn:{damage:7,nextTick:1,ticks:2},slowUntil:2};
  hit=hitWithSpell(b,100,id);assert.deepEqual(hit.enemies[0].burn,b.enemies[0].burn);assert.equal(hit.enemies[0].slowUntil,2);
 }
 assert.equal(burnDamage(100,'Fire'),0);assert.equal(burnDamage(100,'Water'),16);assert.equal(burnDamage(100,'Nature'),24);assert.equal(burnDamage(100,'Neutral'),16);
 const b=newBattle('active');b.enemies[0]={...b.enemies[0],element:'Fire'};
 assert.equal(hitWithSpell(b,60,'leaf').enemies[0].slowUntil,4);
 const frozen=drinkPotion(b,'freeze');let next=frozen;for(let i=0;i<70;i++)next=stepBattle(next,.01);assert.ok(next.freezeUntil>next.time);
});

test('projectile impacts apply resistance and same-element immunity',()=>{
 const b=newBattle('active');b.enemies[0]={...b.enemies[0],element:'Fire',x:400};
 let next=launchSpell(b,100,'#f0a068','bolt');for(let i=0;i<40;i++)next=stepBattle(next,.01);
 assert.equal(next.enemies[0].hp,100-spellDamage({element:'Fire'},100,'bolt'));assert.equal(next.enemies[0].burn,null);
});

test('goblin elites are neutral and receive full damage, knockback, burn and slow',()=>{
 for(const roll of [0,.4,.8]){
  const battle=newBattle('active','elite',()=>roll),goblin=battle.enemies[0];
  assert.equal(goblin.kind,'goblin');assert.equal(goblin.element,'Neutral');assert.equal(goblin.maxHP,200);
  for(const spell of SPELLS.filter(s=>s.id!=='chronos')){
   const b={...battle,enemies:[{...goblin,x:330}]},hit=hitWithSpell(b,60,spell.id),enemy=hit.enemies[0];
   assert.equal(goblin.hp-enemy.hp,spellDamage({element:'Neutral'},60,spell.id));
   assert.ok(Math.abs(enemy.push!.to-330-spellKnockback(60,spell.id))<1e-8);
   if(spell.id==='bolt')assert.equal(enemy.burn!.damage,burnDamage(60,'Neutral'));
   if(spell.id==='leaf')assert.equal(enemy.slowUntil,4);
  }
 }
});

test('normal resistance reduces direct damage and push but preserves full slow and burn effects',()=>{
 const fire=newBattle('active','slime',()=>0);fire.approachAt=0;fire.enemies[0].x=400;
 let slowed=hitWithSpell(fire,100,'leaf');
 assert.equal(slowed.enemies[0].hp,64); // 48 base leaf damage, reduced to 36.
 assert.equal(slowed.enemies[0].slowUntil,4);
 assert.ok(Math.abs(slowed.enemies[0].push!.to-400-160*.85)<1e-8);
 // Once the push ends, movement still uses the full 55% speed reduction.
 for(let i=0;i<30;i++)slowed=stepBattle(slowed,.01);
 const start=slowed.enemies[0].x;slowed=stepBattle(slowed,.1);
 assert.ok(Math.abs(start-slowed.enemies[0].x-18*.45*.1)<1e-8);
 const water=newBattle('active','slime',()=>.4);water.enemies[0].hp=1000;water.enemies[0].maxHP=1000;
 let burning=hitWithSpell(water,100,'bolt');assert.equal(burning.enemies[0].burn!.ticks,3);assert.equal(burning.enemies[0].burn!.damage,16);
 const afterDirect=burning.enemies[0].hp;for(let i=0;i<310;i++)burning=stepBattle(burning,.01);
 assert.equal(afterDirect-burning.enemies[0].hp,48);assert.equal(burning.enemies[0].burn,null);
});

test('resistance lesson follows advantages and completes via Continue with a safe pause',()=>{
 assert.deepEqual(TUTORIAL_LESSONS.slice(2,5),['elements','resistances','remember']);
 const s={...newTutorial(),lesson:'resistances' as const},info=tutorialLessonInfo(s.lesson,s.checkpoint.battle);
 assert.equal(info.title,'Elemental resistances');assert.ok(info.briefing.includes('Elemental creatures **strongly** resist their own element:'));
 assert.strictEqual(stepTutorialBattle(s.checkpoint.battle,20,true,s.lesson),s.checkpoint.battle);
 const completing=beginTutorial(s);assert.equal(completing.phase,'settling');
 const next=handleTutorialEvent(completing,{type:'settling-tick',deltaMs:1000},s.checkpoint);
 assert.equal(next.lesson,'remember');assert.equal(next.phase,'briefing');
});
