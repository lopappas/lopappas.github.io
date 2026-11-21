import test from 'node:test';
import assert from 'node:assert/strict';
import {createSpider,drinkPotion,launchSpell,newBattle,spellCooldownRemaining,spellDamage,spellSlow,stepBattle,type Battle} from '../src/battle.ts';
import {COMBAT_LANE_Y,FILA_FOOT_Y} from '../src/combatLanes.ts';
import {magmaContains,magmaSize} from '../src/eruption.ts';
import {recognize,SPELLS} from '../src/magic.ts';
import {practiceLesson} from '../src/practiceLessons.ts';
import {combatTraceScale} from '../src/combatTracePresentation.ts';
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
 assert.equal(combatTraceScale('eruption'),1.5);
 assert.deepEqual(outline[0],outline.at(-1));
 const result=recognize([outline.map(({x,y})=>({x:x*2+17,y:y*2+9}))]);
 assert.equal(result.spell?.id,'eruption');
 assert.ok(result.quality>=98);
});

test('Eruption warns the nearest enemy for 0.8 seconds, then stuns it and leaves magma across all lanes',()=>{
 const state=cast(field());
 const warned=at(state,.799);
 assert.deepEqual(warned.enemies.map(e=>e.hp),[100,100,100,100]);
 assert.equal(warned.eruptionWarnings[0].targetId,1);
 assert.deepEqual(warned.magma,[]);
 assert.equal(spellCooldownRemaining(state,'eruption'),10);
 assert.equal(cast(at(state,9.99)).casts,1);
 assert.equal(cast(at(state,10)).casts,2);

 const impact=at(warned,.8);
 const hit=spellDamage({element:'Neutral'},80,'fire')*1.5;
 assert.deepEqual(impact.enemies.map(e=>e.hp),[100-hit,100,100,100]);
 assert.deepEqual(impact.eruptionWarnings,[]);
 assert.equal(impact.magma[0].impactY,COMBAT_LANE_Y[0]);
 assert.equal(impact.magma[0].x,550);
 assert.equal(impact.enemies[0].push,null);
 assert.equal(impact.enemies[0].eruptionStunUntil,1.8);
 assert.equal(impact.enemies[1].eruptionStunUntil,undefined);
 assert.deepEqual(impact.enemies.map(e=>spellSlow(impact,e,.8)),[.12,.12,.12,0]);
 assert.deepEqual(at(impact,1.299).enemies.map(e=>e.hp),[100-hit,100,100,100]);
 assert.deepEqual(at(impact,1.3).enemies.map(e=>e.hp),[96-hit,96,96,100]);
 const cooled=at(impact,5.8);
 assert.deepEqual(cooled.enemies.map(e=>e.hp),[60-hit,60,60,100]);
 assert.deepEqual(cooled.magma,[]);
 assert.deepEqual(at(cooled,6).enemies.map(e=>e.hp),cooled.enemies.map(e=>e.hp));
});

test('smoke tracks its target and the stunned enemy resumes marching at 88% speed in magma',()=>{
 const battle=field();
 battle.enemies=battle.enemies.slice(0,1);
 battle.approachAt=0;
 const state=cast(battle);
 const warning=at(state,.4);
 assert.ok(warning.enemies[0].x<state.enemies[0].x);
 assert.equal(warning.eruptionWarnings[0].x,warning.enemies[0].x);
 const impact=at(warning,.8);
 const x=impact.enemies[0].x;
 assert.equal(impact.magma[0].x,x);
 assert.equal(at(impact,1.8).enemies[0].x,x);
 assert.ok(Math.abs(x-at(impact,1.9).enemies[0].x-36*.88*.1)<1e-7);
 const outside={...impact.enemies[0],x:x-impact.magma[0].radiusX-1};
 assert.equal(spellSlow(impact,outside,1.8),0);
});

test('Eruption+ deals 20% more direct damage and twelve 6-damage ticks at 80% quality',()=>{
 const state=cast({...field(),upgrades:{eruption:1}});
 const impact=at(state,.8);
 assert.equal(impact.enemies[0].hp,36.1);
 assert.equal(impact.magma[0].damage,6);
 assert.equal(impact.magma[0].until,6.8);
 assert.equal(at(impact,1.3).enemies[1].hp,94);
 assert.equal(at(impact,6.8).enemies[1].hp,28);
});

test('a Faint magma pool reaches all lanes and better casts increase size and duration',()=>{
 const faint=at(cast(field(),MIN_CAST_QUALITY),.8).magma[0];
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
 const warning=at(activated,.7);
 assert.equal(warning.enemies[0].hp,100);
 const hitAt=warning.eruptionWarnings[0].started+.8;
 assert.deepEqual(at(warning,hitAt-.001).magma,[]);
 const impact=at(warning,hitAt);
 assert.equal(impact.magma.length,1);
 assert.equal(impact.enemies[0].hp,100-spellDamage({element:'Neutral'},80,'eruption'));
});
