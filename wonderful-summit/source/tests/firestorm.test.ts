import {test} from 'node:test';
import assert from 'node:assert/strict';
import {SPELLS,SPELL_VARIATIONS,PLAYER_SPELLS,recognize,type SpellId} from '../src/magic.ts';
import {firestormDuration,firestormBaseDamage} from '../src/firestorm.ts';
import {newBattle,launchSpell,hitWithSpell,stepBattle,firestormTickDamage,spellDamage,spellKnockback,releaseMultiplier,drinkPotion} from '../src/battle.ts';
import {woodenShield} from '../src/shields.ts';
import {newRun,enterNode,camp,finishBattle,battleForRun} from '../src/run.ts';
import {spellUpgradePreview,spellbookColumns,spellName} from '../src/spellbook.ts';
import {parseDeveloperCommand} from '../src/developerCommands.ts';
function advance(b:ReturnType<typeof newBattle>,seconds:number,dt=.01){for(let i=0;i<Math.round(seconds/dt);i++)b=stepBattle(b,dt);return b;}
function setup(encounter:Parameters<typeof newBattle>[1]='elite'){
 const b=newBattle('active',encounter,()=>0);b.approachAt=1000;
 b.enemies=b.enemies.map(e=>({...e,hp:10000,maxHP:10000,element:'Neutral',shield:null}));return b;
}
test('Firestorm has a symmetric three-stroke reference, recognizes independently of size, order and direction',()=>{
 const spell=SPELLS.find(s=>s.id==='firestorm')!;assert.equal(spell.element,'Fire');assert.equal(spell.strokes.length,3);
 const [line,left,right]=spell.strokes;assert.equal(line[0].x+line[1].x,100);
 const mirrored=left.slice(0,3).map(p=>`${100-p.x},${p.y}`).sort();assert.deepEqual(mirrored,right.slice(0,3).map(p=>`${p.x},${p.y}`).sort());
 for(const scale of [.15,1,6]){const strokes=[...spell.strokes].reverse().map(st=>[...st].reverse().map(p=>({x:321+p.x*scale,y:-80+p.y*scale})));const result=recognize(strokes);assert.equal(result.spell?.id,'firestorm');assert.equal(result.quality,100);}
 assert.notEqual(recognize([line,left]).spell?.id,'firestorm');assert.equal(recognize(spell.strokes,['fire','bolt']).spell,null);
});
test('approved lower triangles are canonical while the previous Firestorm remains a perfect recognition-only variation',()=>{
 const spell=SPELLS.find(s=>s.id==='firestorm')!;
 assert.equal(spell.path,'M10 18 L90 18 M12 38 L44 38 L28 70 Z M56 38 L88 38 L72 70 Z');
 const oldShape=[[{x:10,y:18},{x:90,y:18}],[{x:12,y:30},{x:44,y:30},{x:28,y:62},{x:12,y:30}],[{x:56,y:30},{x:88,y:30},{x:72,y:62},{x:56,y:30}]];
 assert.deepEqual(SPELL_VARIATIONS.firestorm,[oldShape]);
 for(const shape of [oldShape,spell.strokes])for(const scale of [.15,1,6]){
  const drawing=[...shape].reverse().map(st=>[...st].reverse().map(p=>({x:120+p.x*scale,y:-43+p.y*scale})));
  const result=recognize(drawing);assert.equal(result.spell,spell);assert.equal(result.quality,100);
  assert.equal(result.candidates.filter(c=>c.spell.id==='firestorm').length,1);
  assert.equal(recognize(drawing,['firestorm']).spell,spell);
  assert.equal(recognize(drawing,['water','fire','nature']).spell,null);
 }
});
test('duration follows revised endpoints and interpolates monotonically within and between grades',()=>{
 for(const [q,seconds] of [[48,3.5],[59,4.5],[60,5],[69,7],[70,8],[79,10],[80,12],[100,16]])assert.equal(firestormDuration(q),seconds);
 for(const q of [-1,0,47,NaN,Infinity])assert.equal(firestormDuration(q),0);
 assert.equal(firestormDuration(101),16);for(let q=49;q<=100;q++)assert.ok(firestormDuration(q)>=firestormDuration(q-1));
});
test('clouds arrive for two full seconds, first rain damage is at 2.5, then each half-second through the final tick',()=>{
 let b=launchSpell(setup(),48,'#f0a068','firestorm');assert.equal(b.projectile,null);assert.equal(b.casts,1);assert.equal(b.firestorm?.rainAt,2);assert.equal(b.firestorm?.portions[0].until,5.5);assert.equal(b.enemies[0].hp,10000);
 b=advance(b,2.49);assert.equal(b.enemies[0].hp,10000);b=advance(b,.01);assert.equal(b.enemies[0].hp,9998);
 b=advance(b,.49);assert.equal(b.enemies[0].hp,9998);b=advance(b,.01);assert.equal(b.enemies[0].hp,9996);
 b=advance(b,2.5);assert.equal(b.enemies[0].hp,9986);assert.equal(b.firestorm,null);b=advance(b,2);assert.equal(b.enemies[0].hp,9986);
});
test('rain damages all living present foes, including reinforcements at a tick, but not before arrival',()=>{
 let b=setup('shieldPack');b.enemies[1].spawnAt=3;b.enemies[2].spawnAt=3.01;b.enemies[2].rocky=false;b=launchSpell(b,60,'#f0a068','firestorm');
 b=advance(b,2.5);assert.deepEqual(b.enemies.map(e=>e.hp),[9998,10000,10000]);
 b=advance(b,.5);assert.deepEqual(b.enemies.map(e=>e.hp),[9996,9998,10000]);
 b=advance(b,.5);assert.deepEqual(b.enemies.map(e=>e.hp),[9994,9996,9998]);
 // A storm can be started while the field is temporarily empty.
 b=setup();b.enemies[0].spawnAt=3;b=launchSpell(b,48,'#f0a068','firestorm');assert.ok(b.firestorm);b=advance(b,3);assert.equal(b.enemies[0].hp,9998);
});
test('ticks use full elemental, rocky and wooden-shield defenses without rounding away small resistances',()=>{
 for(const [element,factor] of [['Fire',.5],['Water',.75],['Nature',1.5],['Neutral',1]] as const)for(const [q,rockFactor] of [[48,.5],[60,.75],[70,1],[100,1]])for(const shield of [false,true]){
  const target={element,rocky:true,shield:shield?woodenShield():null};assert.equal(firestormTickDamage(target,q),2*factor*rockFactor*(shield?.5:1));
  let b=setup();b.enemies[0]={...b.enemies[0],...target};b=advance(launchSpell(b,q,'#f0a068','firestorm'),2.5);assert.equal(10000-b.enemies[0].hp,firestormTickDamage(target,q));
 }
});
test('rain ignites wooden shields on first contact for any Firestorm grade and element, stopping the bearer for two seconds',()=>{
 for(const q of [48,60,70,100])for(const element of ['Fire','Water','Nature','Neutral'] as const){
  let b=setup();b.enemies[0]={...b.enemies[0],element,shield:woodenShield(),attackAt:.2};b=launchSpell(b,q,'#f0a068','firestorm');assert.equal(b.enemies[0].shield?.burnUntil,null);
  b=advance(b,2.5);assert.equal(b.enemies[0].shield?.burnUntil,4.5);assert.equal(b.enemies[0].attackAt,null);b.approachAt=0;const x=b.enemies[0].x;
  b=advance(b,1.99);assert.equal(b.enemies[0].x,x);b=advance(b,.01);assert.equal(b.enemies[0].shield,null);assert.equal(b.enemies[0].x,x);b=advance(b,.1);assert.ok(b.enemies[0].x<x);
 }
});
test('Firestorm has no impact, knockback, generic attack interruption, Sun burn or Midnight flat damage',()=>{
 let b=setup();b.midnightStone=true;b.amulets={sun:true,moon:true,twilight:true};b.enemies[0].attackAt=50;
 b=launchSpell(b,100,'#f0a068','firestorm',100);assert.equal(b.enemies[0].hp,10000);assert.equal(b.enemies[0].attackAt,50);
 b=advance(b,2.5);assert.equal(b.enemies[0].hp,9998);assert.equal(b.enemies[0].attackAt,50);assert.equal(b.enemies[0].burn,null);assert.equal(b.enemies[0].push,null);assert.equal(b.enemies[0].rootUntil,0);
 for(const q of [48,60,70,100]){assert.equal(spellDamage({element:'Neutral'},q,'firestorm',99,1),0);assert.equal(spellKnockback(q,'firestorm',99),0);}
});
test('damage multipliers and upgrade are snapshotted for the entire cast, consuming Fury and Lotus once',()=>{
 let b=setup();b.damageBonus=1.15;b.furyReady=true;b.lotus=true;b.lotusReady=true;b.colorful=true;b.lastElement='Water';b.upgrades.firestorm=1;
 const multiplier=releaseMultiplier(b,'firestorm');assert.equal(multiplier,2*1.3*1.15);
 b=launchSpell(b,60,'#f0a068','firestorm');assert.equal(b.furyReady,false);assert.equal(b.lotusReady,false);assert.equal(b.lastElement,'Fire');
 b.damageBonus=1;b.upgrades.firestorm=0;b=advance(b,2.5);const expected=firestormTickDamage({element:'Neutral'},60,1.15,1,multiplier);assert.ok(Math.abs(10000-b.enemies[0].hp-expected)<1e-8);
 b=advance(b,.5);assert.ok(Math.abs(10000-b.enemies[0].hp-2*expected)<1e-8);
});
test('recasts during arrival or rain append duration, retain cadence and per-cast damage, then a fresh storm rolls in after expiry',()=>{
 let b=launchSpell(setup(),48,'#f0a068','firestorm');b=advance(b,1);b.upgrades.firestorm=1;b=launchSpell(b,60,'#f0a068','firestorm');assert.equal(b.firestorm?.rainAt,2);assert.equal(b.firestorm?.portions.at(-1)?.until,10.5);
 b=advance(b,1.5);assert.equal(b.enemies[0].hp,9998);b=advance(b,.5);b=launchSpell(b,70,'#f0a068','firestorm');assert.equal(b.firestorm?.portions.at(-1)?.until,18.5);assert.equal(b.firestorm?.nextTick,3.5);
 b=advance(b,2.5);assert.equal(b.enemies[0].hp,9986);b=advance(b,.5);assert.equal(b.enemies[0].hp,9983);
 b=advance(b,12.5);assert.equal(b.firestorm,null);assert.equal(b.enemies[0].hp,9908);b=launchSpell(b,48,'#f0a068','firestorm');assert.ok(Math.abs(b.firestorm!.rainAt-20.5)<1e-8);
});
test('rain resolves boss death, split children, ordinary victory and stops on defeat',()=>{
 let b=setup('mother');b.enemies[0].hp=1;b=launchSpell(b,100,'#f0a068','firestorm');b=advance(b,2.5);assert.equal(b.enemies[0].hp,0);assert.ok(b.motherSplit);assert.equal(b.phase,'active');
 b=advance(b,2);assert.equal(b.enemies.length,4);assert.ok(b.enemies.slice(1).every(e=>e.hp<100));
 b.enemies.slice(1).forEach(e=>e.hp=1);b=advance(b,.5);assert.equal(b.phase,'victory');
 b=setup();b.enemies[0].hp=1;b=advance(launchSpell(b,48,'#f0a068','firestorm'),2.5);assert.equal(b.phase,'victory');
 const defeated={...b,phase:'defeat' as const};assert.equal(stepBattle(defeated,.1),defeated);
});
test('stored Firestorm starts on bottle impact and retains its quality and rain effects',()=>{
 let b=setup();b.furyReady=true;b.potions.spellBottle=1;b.bottledSpells=[{spellId:'firestorm',quality:80,inkUsed:100}];b.midnightStone=true;
 b=drinkPotion(b,'spellBottle');b=advance(b,.66);assert.equal(b.furyReady,true);assert.ok(b.firestorm);assert.equal(b.firestorm?.portions[0].quality,80);assert.equal(b.enemies[0].hp,10000);
 b=advance(b,2.5);assert.equal(b.enemies[0].hp,9998);
});
test('storm is frame-rate independent, does not mutate previous states, and resets each encounter',()=>{
 const original=setup(),before=structuredClone(original),launched=launchSpell(original,100,'#f0a068','firestorm');assert.deepEqual(original,before);
 const snapshot=structuredClone(launched),fine=advance(launched,18,.01),coarse=advance(launched,18,.1);assert.deepEqual(launched,snapshot);assert.equal(fine.enemies[0].hp,9936);assert.equal(coarse.enemies[0].hp,9936);assert.equal(fine.firestorm,null);assert.equal(newBattle('active').firestorm,null);
 for(const quality of [0,47,NaN])assert.equal(launchSpell(original,quality,'#f0a068','firestorm').firestorm,null);
});
test('Firestorm is naturally learnable, sold, developer-grantable and upgrades once with an accurate rain preview',()=>{
 assert.ok(PLAYER_SPELLS.some(s=>s.id==='firestorm'));assert.deepEqual(parseDeveloperCommand({type:'spell',id:'firestorm'}),{type:'spell',id:'firestorm'});
 const spells=PLAYER_SPELLS.filter(s=>s.id!=='firestorm').map(s=>s.id);const shop=enterNode({...newRun(),screen:'map',node:2,spells},()=>0);assert.ok(shop.stock.some(s=>s.kind==='spell'&&s.item==='firestorm'));
 const r={...newRun(),screen:'battle' as const,spells,combats:2};assert.deepEqual(finishBattle(r,{...battleForRun(r),phase:'victory'},()=>0).reward?.offers,['firestorm']);
 const c={...newRun(),screen:'camp' as const,spells:['firestorm' as SpellId]},upgraded=camp(c,'firestorm');assert.equal(upgraded.upgrades.firestorm,1);assert.equal(camp({...upgraded,campUsed:false},'firestorm').campUsed,false);assert.equal(spellName('firestorm',1),'Firestorm+');
 const preview=spellUpgradePreview('firestorm')!;assert.equal(preview.firestorm,true);assert.equal(preview.currentTick,2);assert.equal(preview.nextTick,3);assert.equal(spellUpgradePreview('firestorm',1),null);assert.equal(firestormBaseDamage(10),3);assert.equal(spellbookColumns(['firestorm','fire']).find(c=>c.element==='Fire')?.spells[0].id,'fire');
});
