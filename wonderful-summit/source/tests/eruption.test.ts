import test from 'node:test';
import assert from 'node:assert/strict';
import {createSpider,drinkPotion,launchSpell,newBattle,spellCooldownRemaining,spellDamage,stepBattle,type Battle} from '../src/battle.ts';
import {COMBAT_LANE_Y,FILA_FOOT_Y} from '../src/combatLanes.ts';
import {magmaContains,magmaSize} from '../src/eruption.ts';
import {recognize,SPELLS} from '../src/magic.ts';
import {practiceLesson} from '../src/practiceLessons.ts';
import {MIN_CAST_QUALITY} from '../src/quality.ts';

function field(){
 const battle=newBattle('active','slime',()=>0);
 return {...battle,approachAt:Infinity,enemies:[
  {...createSpider(1,550),lane:0 as const},
  {...createSpider(2,556),lane:1 as const},
  {...createSpider(3,560),lane:2 as const},
  {...createSpider(4,635),lane:1 as const},
 ]};
}
function at(battle:Battle,time:number){
 while(battle.time<time-1e-9)battle=stepBattle(battle,Math.min(.1,time-battle.time));
 return battle;
}
const cast=(battle:Battle,quality=80)=>launchSpell(battle,quality,'#f0a068','eruption');

test('Eruption is an Uncommon Fire spell recognized from one closed, symmetric volcano outline',()=>{
 const spell=SPELLS.find(s=>s.id==='eruption')!;
 const [outline]=practiceLesson(spell.id)!.paths;
 assert.equal(spell.rarity,'Uncommon');
 assert.equal(spell.element,'Fire');
 assert.deepEqual(outline[0],outline.at(-1));
 const result=recognize([outline.map(({x,y})=>({x:x*2+17,y:y*2+9}))]);
 assert.equal(result.spell?.id,'eruption');
 assert.ok(result.quality>=98);
});

test('Eruption hits only the nearest enemy and its 80% pool ticks in all three lanes for five seconds',()=>{
 const battle=field();
 const state=cast(battle);
 const hit=spellDamage({element:'Neutral'},80,'fire')*1.5;
 assert.deepEqual(state.enemies.map(e=>e.hp),[100-hit,100,100,100]);
 assert.equal(state.magma[0].impactY,COMBAT_LANE_Y[0]);
 assert.equal(state.magma[0].x,550);
 assert.equal(state.enemies[0].push,null);
 assert.equal(spellCooldownRemaining(state,'eruption'),10);
 assert.equal(cast(at(state,9.99)).casts,1);
 assert.equal(cast(at(state,10)).casts,2);
 assert.deepEqual(at(state,.499).enemies.map(e=>e.hp),[100-hit,100,100,100]);
 assert.deepEqual(at(state,.5).enemies.map(e=>e.hp),[96-hit,96,96,100]);
 const cooled=at(state,5);
 assert.deepEqual(cooled.enemies.map(e=>e.hp),[60-hit,60,60,100]);
 assert.deepEqual(cooled.magma,[]);
 assert.deepEqual(at(cooled,6).enemies.map(e=>e.hp),cooled.enemies.map(e=>e.hp));
});

test('a Faint magma pool reaches all lanes and better casts increase size and duration',()=>{
 const faint=cast(field(),MIN_CAST_QUALITY).magma[0];
 for(const y of COMBAT_LANE_Y)assert.ok(magmaContains(faint,faint.x,y));
 assert.ok(!magmaContains(faint,faint.x+faint.radiusX+1,FILA_FOOT_Y));
 const sizes=[MIN_CAST_QUALITY,60,70,80,100].map(magmaSize);
 for(let i=1;i<sizes.length;i++){
  assert.ok(sizes[i].radiusX>sizes[i-1].radiusX);
  assert.ok(sizes[i].radiusY>sizes[i-1].radiusY);
  assert.ok(sizes[i].duration>sizes[i-1].duration);
 }
});

test('bottled Eruption uses the same ground hit and adds magma on impact',()=>{
 const battle=field();
 battle.potions.spellBottle=1;
 battle.bottledSpells=[{spellId:'eruption',quality:80}];
 const activated=drinkPotion(battle,'spellBottle');
 assert.deepEqual(activated.magma,[]);
 const impact=at(activated,.7);
 assert.equal(impact.magma.length,1);
 assert.equal(impact.enemies[0].hp,100-spellDamage({element:'Neutral'},80,'eruption'));
});
