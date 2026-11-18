import test from 'node:test';
import assert from 'node:assert/strict';
import {applyDeveloperCommand,parseDeveloperCommand} from '../src/developerCommands.ts';
import {newRun,battleForRun,finishBattle,camp,drinkTrailHealing} from '../src/run.ts';
import {drinkPotion,stepBattle} from '../src/battle.ts';
import {playerMaxHealth} from '../src/playerHealth.ts';
import {SPELLS,isUpgradableSpell} from '../src/magic.ts';
import {traceViewBox} from '../src/traceLayout.ts';
import {practiceLesson} from '../src/practiceLessons.ts';

test('developer max health persists between battles and healing respects the increased cap',()=>{
 assert.deepEqual(parseDeveloperCommand({type:'maxHealth'}),{type:'maxHealth'});
 const before={...newRun(),screen:'battle' as const,health:31};
 const run=applyDeveloperCommand(before,{type:'maxHealth'});assert.equal(run.health,999);assert.equal(playerMaxHealth(run),999);assert.equal(before.health,31);
 let b=battleForRun(run,()=>0);assert.equal(b.playerHP,999);assert.equal(playerMaxHealth(b),999);
 b={...b,playerHP:980,potions:{...b.potions,heal:1},approachAt:1000};b=drinkPotion(b,'heal');for(let i=0;i<8;i++)b=stepBattle(b,.1);assert.equal(b.playerHP,999);
 const won=finishBattle(run,{...b,phase:'victory'},()=>0);assert.equal(won.health,999);assert.equal(playerMaxHealth(battleForRun(won)),999);
 const trail={...run,screen:'map' as const,health:980,potions:{...run.potions,heal:1}};assert.equal(drinkTrailHealing(trail).health,999);
 assert.equal(camp({...trail,screen:'camp',campUsed:false}).health,999);
 assert.equal(playerMaxHealth(newRun()),100);
});
test('upgrade owned spells grants one valid upgrade without adding unknown or non-upgradable spells',()=>{
 assert.deepEqual(parseDeveloperCommand({type:'upgradeSpells'}),{type:'upgradeSpells'});
 const run={...newRun(),spells:SPELLS.map(s=>s.id),gold:12};const before=structuredClone(run);
 const result=applyDeveloperCommand(run,{type:'upgradeSpells'});for(const s of SPELLS)assert.equal(result.upgrades[s.id],isUpgradableSpell(s.id)?1:undefined);
 assert.deepEqual(result.spells,run.spells);assert.equal(result.gold,12);assert.deepEqual(run,before);
 const starters=applyDeveloperCommand(newRun(),{type:'upgradeSpells'});assert.equal(starters.upgrades.torrent,undefined);
 const b=battleForRun(starters);assert.deepEqual(b.upgrades,starters.upgrades);
 assert.deepEqual(applyDeveloperCommand(result,{type:'upgradeSpells'}).upgrades,result.upgrades);
});
test('complete reference and lesson shapes are centered without changing drawing geometry or scale',()=>{
 const snapshot=structuredClone(SPELLS);
 for(const spell of SPELLS)for(const paths of [spell.strokes,practiceLesson(spell.id)?.paths].filter(Boolean)){
  const p=paths!;const [x,y,w,h]=traceViewBox(p).split(' ').map(Number);const points=p.flat();
  const cx=(Math.min(...points.map(v=>v.x))+Math.max(...points.map(v=>v.x)))/2;
  const cy=(Math.min(...points.map(v=>v.y))+Math.max(...points.map(v=>v.y)))/2;
  assert.ok(Math.abs(cx-(x+w/2))<1e-8,spell.id+' horizontal');assert.ok(Math.abs(cy-(y+h/2))<1e-8,spell.id+' vertical');assert.equal(w,100);assert.equal(h,100);
 }
 assert.deepEqual(SPELLS,snapshot);
});


test('grant all spells includes every developer option without duplicating spells or replacing upgrades',()=>{
 const command={type:'grantAllSpells'} as const;
 assert.deepEqual(parseDeveloperCommand(command),command);
 const run={...newRun(),spells:['torrent','water'] as const,upgrades:{torrent:1}};
 const start={...run,spells:[...run.spells]};
 const granted=applyDeveloperCommand(start,command);
 assert.equal(granted.spells.length,SPELLS.length);
 assert.deepEqual(new Set(granted.spells),new Set(SPELLS.map(spell=>spell.id)));
 assert.deepEqual(granted.spells.slice(0,2),start.spells);
 assert.equal(granted.upgrades,start.upgrades);
 assert.equal(applyDeveloperCommand(granted,command),granted);
});
