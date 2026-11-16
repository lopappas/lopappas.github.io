import test from 'node:test';
import assert from 'node:assert/strict';
import {CombatTrace} from '../src/combatTrace.ts';
import {finishOpening,newRun,selectMode,startRun,battleForRun,finishBattle,returnToMenu,bookWormBonus,runDamageBonus} from '../src/run.ts';
import {stepBattle,CONTACT_X,newBattle,ENEMY_BACK_X} from '../src/battle.ts';

test('both modes enter the same adventure, preserve mode across battles, and reset on a fresh menu',()=>{
 for(const mode of ['apprentice','expert'] as const){let run=selectMode(finishOpening(newRun()),mode,()=>.5);assert.equal(run.playMode,mode);assert.equal(run.screen,'sister');run=startRun(run,run.keepsakeOffers[0],()=>.5);assert.equal(run.playMode,mode);assert.equal(run.screen,'map');run={...run,screen:'battle'};const battle=battleForRun(run,()=>.5);assert.equal(battle.contactPushMultiplier,mode==='apprentice'?1.5:1);const won=finishBattle(run,{...battle,phase:'victory'},()=>.5);assert.equal(won.playMode,mode);}
 assert.equal(selectMode(finishOpening(newRun()),'new',()=>.5).playMode,'expert');assert.notEqual(returnToMenu().playMode,'apprentice');
});
test('Apprentice guides persist indefinitely and may be changed or hidden without a cooldown',()=>{
 const trace=new CombatTrace();assert.equal(trace.select('fire',['fire','water'],'apprentice',0),true);assert.equal(trace.advance(100000),false);assert.equal(trace.spellId,'fire');assert.equal(trace.select('water',['fire','water'],'apprentice',100000),true);trace.hide();assert.equal(trace.spellId,null);assert.equal(trace.select('fire',['fire'],'apprentice',100000),true);assert.equal(trace.select('nature',['fire'],'apprentice',100000),false);
});
test('Expert traces last exactly two active seconds then impose ten active seconds of cooldown',()=>{
 const trace=new CombatTrace();assert.equal(trace.select('fire',['fire','water'],'expert',5),true);assert.equal(trace.advance(6.999),false);assert.equal(trace.canSelect('expert',6.999),false);assert.equal(trace.advance(7),true);assert.equal(trace.spellId,null);assert.equal(trace.canSelect('expert',16.999),false);assert.equal(trace.canSelect('expert',17),true);assert.equal(trace.select('water',['fire','water'],'expert',17),true);
 // Repeated reads at paused battle time neither expire a guide nor consume cooldown.
 for(let i=0;i<100;i++)assert.equal(trace.advance(18),false);trace.hide();assert.equal(trace.canSelect('expert',19),false);assert.equal(trace.select('fire',['fire'],'expert',19),false);assert.equal(trace.canSelect('expert',29),true);
});
test('contact recoil is 1.5x in Apprentice with existing bonuses, without changing damage or spell push bonus',()=>{
 for(const bonuses of [{pushBonus:1,firstHitPush:0,rejectionUntil:0},{pushBonus:1.15,firstHitPush:80,rejectionUntil:10}]){
  const base=newBattle('active');base.approachAt=0;Object.assign(base,bonuses);base.enemies=[{...base.enemies[0],x:CONTACT_X,spawnAt:0,readyAt:0,clock:1,attackAt:0}];
  const expert=stepBattle({...structuredClone(base),contactPushMultiplier:1},.016),apprentice=stepBattle({...structuredClone(base),contactPushMultiplier:1.5},.016);
  const x=expert.enemies[0].push!,y=apprentice.enemies[0].push!;
  assert.equal(expert.playerHits,1);assert.equal(apprentice.playerHits,1);assert.equal(expert.playerHP,apprentice.playerHP);assert.equal(apprentice.pushBonus,expert.pushBonus);
  // Large stacked bonuses may reach the existing runway cap.
  assert.ok(y.to>=x.to);if(y.to<ENEMY_BACK_X)assert.ok(Math.abs((y.to-y.from)/(x.to-x.from)-1.5)<1e-9);
 }
});

test('Book Worm adds three percent per distinct non-starter spell and applies to both modes',()=>{
 for(const mode of ['apprentice','expert'] as const){const run={...newRun(),playMode:mode,relics:['bookWorm'] as const};
 const owned={...run,relics:['bookWorm'] as import('../src/run.ts').RelicId[]};assert.equal(bookWormBonus(owned),0);const more={...owned,spells:[...owned.spells,'leaf','bolt'] as import('../src/magic.ts').SpellId[]};assert.equal(bookWormBonus(more),6);assert.equal(runDamageBonus(more),1.06);assert.equal(battleForRun(more).damageBonus,1.06);assert.equal(bookWormBonus({...more,spells:[...more.spells,'leaf']}),6);assert.equal(bookWormBonus({...more,relics:[]}),0);}
});

test('quick spell table shows only acquired shapes and names, gates Expert traces and offers guide hiding',async()=>{
 const React=(await import('react')).default;const {renderToStaticMarkup}=await import('react-dom/server');const {loadArt}=await import('./helpers/loadArt.ts');const {fileURLToPath}=await import('node:url');const {SPELLS}=await import('../src/magic.ts');
 const {CombatSpells}=loadArt(fileURLToPath(new URL('../src/CombatSpells.tsx',import.meta.url)));
 const props={known:['fire'],apprentice:false,ready:false,hasGuide:true,onSelect(){},onHide(){},onClose(){}};
 const html=renderToStaticMarkup(React.createElement(CombatSpells,props));assert.match(html,/Trace Hearthspark/);assert.doesNotMatch(html,/Trace Dewdrop/);assert.match(html,/disabled/);assert.match(html,/Hide trace/);assert.ok(html.includes(SPELLS.find(s=>s.id==='fire')!.path));
 const free=renderToStaticMarkup(React.createElement(CombatSpells,{...props,apprentice:true,ready:true,hasGuide:false}));assert.doesNotMatch(free,/disabled/);assert.doesNotMatch(free,/Hide trace/);assert.match(free,/lasting guide/);
});
