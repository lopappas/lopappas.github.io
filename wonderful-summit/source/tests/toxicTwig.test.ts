import test from 'node:test';
import assert from 'node:assert/strict';
import {createSpider,drinkPotion,launchSpell,newBattle,spellCooldownRemaining,spellDamage,spellKnockback,spellTarget,stepBattle,toxicTwigCastPreview,toxicTwigTotalDamage,type Battle} from '../src/battle.ts';
import {recognize,SPELLS} from '../src/magic.ts';
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
  assert.equal(toxicTwigTotalDamage({element:'Water'},80,1,upgrade),total*1.5);
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

test('Cursed Twig can be recast immediately and each poison expires on its own',()=>{
 let battle=cast(field());
 assert.equal(spellCooldownRemaining(battle,'toxicTwig'),0);
 assert.equal(cast(battle).enemies[0].toxicTwig?.length,2);
 battle=cast(at(battle,3));
 assert.equal(battle.enemies[0].toxicTwig?.length,2);
 battle=at(battle,15);
 assert.equal(battle.enemies[0].hp,746);
 assert.equal(battle.enemies[0].toxicTwig?.length,1);
 battle=at(battle,18);
 assert.equal(battle.enemies[0].hp,700);
 assert.deepEqual(battle.enemies[0].toxicTwig,[]);
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

test('Cursed Twig damage follows elemental and rocky defenses on its ticks',()=>{
 for(const [element,damage] of [['Neutral',150],['Fire',112.5],['Water',225],['Nature',75]] as const){
  const battle=field();
  battle.enemies[0]={...battle.enemies[0],element};
  assert.equal(1000-at(cast(battle),15).enemies[0].hp,damage);
 }
 const battle=field();
 const enemy={...battle.enemies[0],rocky:true};
 battle.enemies[0]=enemy;
 const damage=toxicTwigTotalDamage({element:'Neutral'},60)*.75;
 const castAtSteady=launchSpell(battle,60,'#9bbe72','toxicTwig');
 assert.ok(Math.abs(1000-at(castAtSteady,15).enemies[0].hp-damage)<1e-5);
});
