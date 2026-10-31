import {test} from 'node:test';
import assert from 'node:assert/strict';
import {SPELLS,PLAYER_SPELLS,recognize,isUpgradableSpell} from '../src/magic.ts';
import {newBattle,spellDamage,spellKnockback,hitWithSpell,launchSpell,stepBattle,releaseMultiplier,drinkPotion} from '../src/battle.ts';
import {newRun,ROUTE,enterNode,finishBattle,camp} from '../src/run.ts';
import {applyDeveloperCommand,parseDeveloperCommand} from '../src/developerCommands.ts';
import {spellName,spellUpgradePreview,spellbookColumns} from '../src/spellbook.ts';
import {woodenShield} from '../src/shields.ts';
const ender=SPELLS.find(s=>s.id==='ender')!;
function advance(b:ReturnType<typeof newBattle>,seconds:number){for(let i=0;i<Math.round(seconds*100);i++)b=stepBattle(b,.01);return b;}
test('capital K is developer-only Ancient magic and works at different sizes, positions and stroke directions',()=>{
 assert.equal(ender.element,'Ancient');assert.equal(ender.developerOnly,true);assert.equal(PLAYER_SPELLS.some(s=>s.id==='ender'),false);assert.deepEqual(parseDeveloperCommand({type:'spell',id:'ender'}),{type:'spell',id:'ender'});
 const run=applyDeveloperCommand(newRun(),{type:'spell',id:'ender'});assert.ok(run.spells.includes('ender'));assert.equal(applyDeveloperCommand(run,{type:'spell',id:'ender'}),run);
 for(const scale of [.2,1,4]){const strokes=[...ender.strokes].reverse().map(s=>[...s].reverse().map(p=>({x:p.x*scale+41,y:p.y*scale-23})));const cast=recognize(strokes,run.spells);assert.equal(cast.spell?.id,'ender');assert.ok(cast.quality>=98);assert.equal(recognize(strokes,newRun().spells).spell,null);}
 assert.deepEqual(spellbookColumns(['ender']).find(c=>c.element==='Ancient')?.spells.map(s=>s.id),['ender']);
});
test('all valid Ender qualities deal 1000 base damage, with no upgrade, knockback, or effects from accuracy',()=>{
 for(const q of [48,59,60,69,70,79,80,100]){for(const element of ['Fire','Water','Nature','Neutral'] as const)assert.equal(spellDamage({element},q,'ender'),1000);assert.equal(spellDamage({element:'Neutral'},q,'ender',1,3),1000);assert.equal(spellKnockback(q,'ender',20),0);}
 for(const q of [0,47,NaN]){assert.equal(spellDamage({element:'Neutral'},q,'ender'),0);const b=newBattle('active');b.midnightStone=true;assert.equal(hitWithSpell(b,q,'ender',undefined,Math.random,2,55),b);}
 assert.equal(isUpgradableSpell('ender'),false);assert.equal(spellUpgradePreview('ender'),null);assert.equal(spellName('ender',4),'Ender');const run={...newRun(),screen:'camp' as const,spells:[...newRun().spells,'ender' as const]};assert.equal(camp(run,'ender'),run);assert.equal(camp(run,'fire').upgrades.fire,1);
});
test('Ender respects rocky/shield defenses, damage relics, Fury and final Midnight Stone damage',()=>{
 for(const [q,rocky,shield,direct] of [[48,false,false,1150],[48,true,false,575],[60,true,false,863],[80,true,false,1150],[48,true,true,288],[60,true,true,431],[80,false,true,575]] as const){
  const b=newBattle('active','pack');b.midnightStone=true;b.damageBonus=1.15;b.lotus=true;b.lotusReady=true;b.colorful=true;b.lastElement='Fire';b.furyReady=true;b.enemies[0]={...b.enemies[0],hp:100000,maxHP:100000,element:'Fire',rocky,shield:shield?woodenShield():null};
  const multiplier=2*1.3*1.15;const hit=hitWithSpell(b,q,'ender',1,()=>0,multiplier,55);assert.equal(100000-hit.enemies[0].hp,Math.round(direct*multiplier*1.2));assert.equal(releaseMultiplier(b,'ender'),multiplier);assert.equal(hit.enemies[1].hp,b.enemies[1].hp);
  const e=hit.enemies[0];assert.equal(e.push,null);assert.equal(e.burn,null);assert.equal(e.rootUntil,0);assert.equal(e.slowUntil,0);assert.equal(e.shield?.burnUntil??null,null);
 }
});
test('Ender preserves attack windups and existing control effects; projectiles and bottles use the same damage',()=>{
 let b=newBattle('active');b.enemies[0]={...b.enemies[0],element:'Neutral',hp:10000,maxHP:10000,attackAt:7,rootUntil:4,slowUntil:5};const hit=hitWithSpell(b,48,'ender');assert.equal(hit.enemies[0].attackAt,7);assert.equal(hit.enemies[0].rootUntil,4);assert.equal(hit.enemies[0].slowUntil,5);
 b.furyReady=true;b=launchSpell(b,48,ender.color,'ender');assert.equal(b.furyReady,false);b=advance(b,.33);assert.equal(b.enemies[0].hp,8000);
 b.potions.spellBottle=1;b.bottledSpells=[{spellId:'ender',quality:60}];b=advance(drinkPotion(b,'spellBottle'),.66);assert.equal(b.enemies[0].hp,7000);
});
test('Ender never appears in normal merchants or spell rewards, even when every natural spell is known',()=>{
 for(const roll of [0,.25,.5,.75,.999]){for(const node of ROUTE.flatMap((n,i)=>n.kind==='shop'?[i]:[])){const shop=enterNode({...newRun(),screen:'map',node},()=>roll);assert.ok(shop.stock.every(s=>s.item!=='ender'));}
  const run={...newRun(),screen:'battle' as const,combats:1,spells:PLAYER_SPELLS.map(s=>s.id)},reward=finishBattle(run,{...newBattle('active'),phase:'victory'},()=>roll).reward!;assert.deepEqual(reward.offers,[]);
 }
});
