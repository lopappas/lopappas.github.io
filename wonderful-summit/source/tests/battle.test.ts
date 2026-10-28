import {test} from 'node:test';
import assert from 'node:assert/strict';
import {newBattle as makeBattle,stepBattle,hitWithSpell,CONTACT_X,ENEMY_BACK_X,ENEMY_RUNWAY_SIZE,PLAYER_HIT_PUSH,SLIME_MAX_HP,CONTACT_DAMAGE,launchSpell,projectilePosition,presentEnemies,nearestEnemy,targetedEnemy,spellDamage,spellKnockback,drinkPotion,eliteRush,type Battle,type Enemy,type Encounter,burnDamage,potionPosition,POTION_FLIGHT_SECONDS,type BattlePhase} from '../src/battle.ts';
import {SPELLS,recognize} from '../src/magic.ts';
import {potionImpactIds} from '../src/battle.ts';

test('all thrown potions emit a break cue only on impact, including simultaneous bottles',()=>{
 let battle=makeBattle('active','slime',()=>.4);
 for(const potion of ['heal','freeze','ink'] as const)battle=drinkPotion(battle,potion);
 let impacts:number[]=[];
 for(let i=0;i<110;i++){
  const next=stepBattle(battle,.01),ids=potionImpactIds(battle,next);
  if(i<64)assert.deepEqual(ids,[]);
  impacts.push(...ids);assert.deepEqual(potionImpactIds(next,next),[]);
  battle=next;
 }
 assert.deepEqual(impacts,[1,2,3]);assert.equal(battle.potionFlights.length,0);
});
// Existing combat-rule fixtures skip the opening; pacing tests below use production defaults.
function newBattle(phase:BattlePhase='ready',encounter:Encounter='slime'){return{...makeBattle(phase,encounter,()=>.4),approachAt:0};}
function advance(state:Battle,seconds:number){for(let i=0;i<Math.round(seconds*100);i++)state=stepBattle(state,.01);return state;}
function firstEnemy(state:Battle,patch:Partial<Enemy>):Battle{return{...state,enemies:state.enemies.map((e,i)=>i===0?{...e,...patch}:e)};}
test('slime has 100 health and contact attack warns before damage with cooldown',()=>{
 let s=firstEnemy(newBattle('active'),{x:CONTACT_X});assert.equal(s.enemies[0].hp,100);s=stepBattle(s,.01);
 assert.ok(s.enemies[0].attackAt!==null);assert.equal(s.playerHP,100);
 s=advance(s,.5);assert.equal(s.playerHP,100-CONTACT_DAMAGE);
 s=advance(s,1.4);assert.equal(s.playerHP,100-CONTACT_DAMAGE);
 s=advance(s,.6);assert.equal(s.playerHP,100-CONTACT_DAMAGE);s=advance(s,5);assert.equal(s.playerHP,100-CONTACT_DAMAGE*2);
});
test('quality improves damage and smooth knockback while interrupting attacks',()=>{
 const s=firstEnemy(newBattle('active'),{x:CONTACT_X,attackAt:.2});const rough=hitWithSpell(s,50),good=hitWithSpell(s,100);
 assert.ok(good.enemies[0].hp<rough.enemies[0].hp);assert.ok(good.enemies[0].push!.to>rough.enemies[0].push!.to);assert.equal(good.enemies[0].x,s.enemies[0].x);assert.equal(good.enemies[0].attackAt,null);assert.equal(advance(good,1).playerHP,100);
});
test('a killing hit produces victory and terminal states cannot deal or take damage',()=>{
 const s=hitWithSpell(firstEnemy(newBattle('active'),{hp:5}),100);assert.equal(s.phase,'victory');assert.equal(s.enemies[0].hp,0);assert.deepEqual(advance(s,10),s);assert.deepEqual(hitWithSpell(s,100),s);
});
test('unattended combat reaches defeat, clamps HP, and cancels projectiles',()=>{
 const s=advance(newBattle('active'),90);assert.equal(s.phase,'defeat');assert.equal(s.playerHP,0);assert.equal(s.projectile,null);assert.deepEqual(advance(s,10),s);
});
test('ready state remains safe and restarting resets encounters and all consumables',()=>{
 const ready=newBattle();assert.deepEqual(advance(ready,5),ready);
 for(const id of ['slime','pack','elite'] as Encounter[]){const fresh=newBattle('active',id);assert.equal(fresh.playerHP,100);assert.equal(fresh.casts,0);assert.equal(fresh.time,0);assert.deepEqual(fresh.potions,{heal:1,freeze:1,ink:1});assert.equal(fresh.freezeUntil,0);assert.equal(fresh.unlimitedUntil,0);assert.ok(fresh.enemies.every(e=>e.hp===e.maxHP));}
});
test('long background gaps never cause catch-up contact damage',()=>{const s=stepBattle(firstEnemy(newBattle('active'),{x:CONTACT_X}),60);assert.equal(s.playerHP,100);assert.equal(s.time,.1);});
test('real recognized sigils win the reduced-health slime encounter',()=>{
 let s=newBattle('active');for(let i=0;i<8&&s.phase==='active';i++){s=advance(s,3);const match=recognize(SPELLS[i%3].strokes);assert.ok(match.spell);s=hitWithSpell(s,match.quality,match.spell!.id);}assert.equal(s.phase,'victory');assert.equal(s.enemies[0].hp,0);assert.ok(s.playerHP>0);
});
test('orb travels before damage and push, then clears on arrival',()=>{
 let s=launchSpell(newBattle('active'),100,'#69c2d6');assert.equal(s.enemies[0].hp,SLIME_MAX_HP);assert.equal(projectilePosition(s)?.x,300);s=advance(s,.15);assert.ok(projectilePosition(s)!.x>300);assert.equal(s.enemies[0].hp,SLIME_MAX_HP);s=advance(s,.2);assert.equal(s.projectile,null);assert.equal(s.enemies[0].hp,SLIME_MAX_HP-32);assert.ok(s.enemies[0].push);
});
test('knockback eases over time instead of teleporting',()=>{const start=hitWithSpell(firstEnemy(newBattle('active'),{x:400}),100);assert.equal(start.enemies[0].x,400);const middle=advance(start,.1);assert.ok(middle.enemies[0].x>400&&middle.enemies[0].x<start.enemies[0].push!.to);const end=advance(start,.28);assert.ok(Math.abs(end.enemies[0].x-start.enemies[0].push!.to)<.2);assert.equal(end.enemies[0].push,null);});
test('each player hit emits a quarter-second hit event',()=>{const s=stepBattle(firstEnemy(newBattle('active'),{x:CONTACT_X,attackAt:0}),.01);assert.equal(s.playerHits,1);assert.ok(Math.abs(s.playerHurtUntil-s.time-.25)<1e-9);});
test('element triangle grants 50% extra damage, with neutral unchanged and resisted matchups reduced',()=>{
 const base=newBattle('active').enemies[0];
 for(const [id,strong] of [['water','Fire'],['fire','Nature'],['nature','Water']] as const){assert.equal(spellDamage({...base,element:strong},100,id),96);assert.equal(spellDamage({...base,element:'Neutral'},100,id),64);}
 assert.equal(spellDamage({...base,element:'Water'},100,'fire'),48);
});
test('nearest living enemy is targeted, including after knockback changes ordering',()=>{
 let s=newBattle('active','pack');s.enemies[0].x=650;assert.equal(nearestEnemy(s)?.id,2);s=launchSpell(s,100,'#abc','nature');assert.equal(s.projectile?.targetId,2);s=advance(s,.4);assert.ok(s.enemies[1].hp<s.enemies[1].maxHP);assert.equal(s.enemies[0].hp,100);
});
test('dead enemies are skipped, and killing one pack member does not end combat',()=>{
 let s=newBattle('active','pack');s.enemies[0].hp=1;s=hitWithSpell(s,100);assert.equal(s.phase,'active');assert.equal(s.enemies[0].hp,0);assert.equal(nearestEnemy(s)?.id,2);s=launchSpell(s,100,'#abc');assert.equal(s.projectile?.targetId,2);
});
test('advanced spells trade damage and knockback and leaf applies timed slow',()=>{
 const base=firstEnemy(newBattle('active'),{x:400});const normal=hitWithSpell(base,100),wave=hitWithSpell(base,100,'wave'),bolt=hitWithSpell(base,100,'bolt'),leaf=hitWithSpell(base,100,'leaf');assert.ok(wave.enemies[0].hp>normal.enemies[0].hp);assert.ok(wave.enemies[0].push!.to>normal.enemies[0].push!.to);assert.ok(bolt.enemies[0].hp<normal.enemies[0].hp);assert.equal(leaf.enemies[0].slowUntil,8);
 const slowed=firstEnemy(base,{slowUntil:4}),regular=advance(base,1),slow=advance(slowed,1);assert.ok(slow.enemies[0].x>regular.enemies[0].x);assert.ok(advance(slowed,5).enemies[0].x<slow.enemies[0].x);
});
test('healing applies on bottle impact, is single-use, and cannot exceed max health',()=>{
 let s={...newBattle('active'),playerHP:90};s=drinkPotion(s,'heal');assert.equal(s.playerHP,90);assert.equal(s.potions.heal,0);assert.deepEqual(drinkPotion(s,'heal'),s);s=advance(s,.66);assert.equal(s.playerHP,100);assert.equal(advance(drinkPotion({...newBattle('active'),playerHP:20},'heal'),.66).playerHP,50);
});
test('freeze applies on impact, pauses enemy action clocks, and resumes without instant attack',()=>{
 let s=drinkPotion(newBattle('active'),'freeze');assert.equal(s.freezeUntil,0);s=advance(s,.66);assert.ok(s.freezeUntil>s.time);const clock=s.enemies[0].clock,x=s.enemies[0].x;s=advance(s,3.8);assert.equal(s.enemies[0].clock,clock);assert.equal(s.enemies[0].x,x);s=advance(s,.5);assert.ok(s.enemies[0].clock>clock);
});
test('projectiles can hit while enemies are frozen',()=>{let s=advance(drinkPotion(newBattle('active'),'freeze'),.66);const clock=s.enemies[0].clock;s=launchSpell(s,100,'#abc');s=advance(s,.4);assert.equal(s.enemies[0].hp,68);assert.equal(s.enemies[0].clock,clock);});
test('unlimited ink starts on impact and lasts fifteen seconds, without double use',()=>{let s=drinkPotion(newBattle('active'),'ink');assert.equal(s.unlimitedUntil,0);assert.equal(s.potions.ink,0);assert.deepEqual(drinkPotion(s,'ink'),s);s=advance(s,.66);assert.ok(Math.abs(s.unlimitedUntil-s.time-15)<.02);assert.ok(advance(s,14.9).time<s.unlimitedUntil);assert.ok(advance(s,15.1).time>s.unlimitedUntil);});
test('potions do nothing outside active combat',()=>{for(const phase of ['ready','victory','defeat'] as const){const s=newBattle(phase);assert.deepEqual(drinkPotion(s,'heal'),s);assert.deepEqual(drinkPotion(s,'freeze'),s);}});
test('elite goblin warns before rushing and deals heavier contact damage',()=>{
 let s=newBattle('active','elite');assert.equal(s.enemies[0].maxHP,200);const e=s.enemies[0];assert.equal(eliteRush({...e,clock:6.5}),'warning');assert.equal(eliteRush({...e,clock:7.5}),'rush');const walking=advance(s,.5),rushing=advance(firstEnemy(s,{clock:7.1}),.5);assert.ok(rushing.enemies[0].x<walking.enemies[0].x);s=stepBattle(firstEnemy(s,{x:CONTACT_X,attackAt:0}),.01);assert.equal(s.playerHP,82);
});
test('elemental pack is winnable using counter-elements and potions',()=>{
 let s=newBattle('active','pack');
 for(let i=0;i<40&&s.phase==='active';i++){
  if(s.playerHP<70&&s.potions.heal)s=drinkPotion(s,'heal');
  if(i===5)s=drinkPotion(s,'freeze');
  const target=nearestEnemy(s)!;const id=target.element==='Fire'?'water':target.element==='Water'?'nature':'bolt';
  s=launchSpell(s,85,'#abc',id);s=advance(s,1.5);
 }
 assert.equal(s.phase,'victory');assert.ok(s.enemies.every(e=>e.hp===0));
});

test('meadow slime elemental rolls divide equally into fire, water and nature',()=>{
 const counts={Fire:0,Water:0,Nature:0};
 for(let i=0;i<300;i++){const e=makeBattle('active','slime',()=>(i+.5)/300).enemies[0];assert.equal(e.hp,100);assert.equal(e.maxHP,100);assert.ok(e.element in counts);counts[e.element as keyof typeof counts]++;}
 assert.deepEqual(counts,{Fire:100,Water:100,Nature:100});
});
test('elemental pack always has exactly two different elements, with all six ordered pairs possible',()=>{
 const pairs=new Set<string>();
 for(let a=0;a<3;a++)for(let b=0;b<2;b++){const rolls=[(a+.5)/3,(b+.5)/2];const s=makeBattle('active','pack',()=>rolls.shift()!);assert.equal(s.enemies.length,2);assert.notEqual(s.enemies[0].element,s.enemies[1].element);assert.ok(s.enemies.every(e=>e.hp===100&&e.maxHP===100));pairs.add(s.enemies.map(e=>e.element).join(','));}
 assert.equal(pairs.size,6);
});
test('target marker follows the orb target in flight, then the nearest living enemy',()=>{
 let s=newBattle('active','pack');s=launchSpell(s,100,'#abc');assert.equal(targetedEnemy(s)?.id,s.projectile!.targetId);
 s={...s,enemies:s.enemies.map(e=>({...e,x:e.id===1?620:400}))};assert.equal(nearestEnemy(s)?.id,2);assert.equal(targetedEnemy(s)?.id,1);
 s={...s,projectile:null};assert.equal(targetedEnemy(s)?.id,2);s.enemies[1].hp=0;assert.equal(targetedEnemy(s)?.id,1);
});

test('burn scales with accuracy and elemental advantage, ticks three times, and expires',()=>{
 assert.ok(burnDamage(100,'Water')>burnDamage(48,'Water'));assert.ok(burnDamage(100,'Nature')>burnDamage(100,'Water'));
 const s=hitWithSpell(newBattle('active'),80,'bolt'),hp=s.enemies[0].hp,dmg=s.enemies[0].burn!.damage;
 assert.equal(advance(s,.9).enemies[0].hp,hp);assert.equal(advance(s,1.1).enemies[0].hp,hp-dmg);
 const end=advance(s,3.1);assert.equal(end.enemies[0].hp,hp-3*dmg);assert.equal(end.enemies[0].burn,null);
});
test('burn does not stack, keeps the stronger tick, continues during freeze, and can win',()=>{
 let s=hitWithSpell(firstEnemy(newBattle('active'),{hp:500,maxHP:500}),100,'bolt');s=hitWithSpell(s,48,'bolt');assert.equal(s.enemies[0].burn!.ticks,3);assert.equal(s.enemies[0].burn!.damage,burnDamage(100,s.enemies[0].element));
 s=firstEnemy(s,{hp:5});s={...s,freezeUntil:10};s=advance(s,1.1);assert.equal(s.phase,'victory');assert.equal(s.enemies[0].hp,0);
});
test('potion arc starts at purse, rises, and ends on Fila or the enemy field',()=>{
 for(const kind of ['heal','ink','freeze'] as const){let s=drinkPotion(newBattle('active'),kind);const f=s.potionFlights[0],start=potionPosition(f,0),mid=potionPosition(f,POTION_FLIGHT_SECONDS/2),end=potionPosition(f,POTION_FLIGHT_SECONDS);assert.equal(start.x,160);assert.equal(start.y,383);assert.ok(mid.y<start.y);assert.equal(end.x,f.toX);assert.equal(end.y,f.toY);assert.equal(f.toX,kind==='freeze'?580:245);s=advance(s,.66);assert.equal(s.potionFlights[0].applied,true);s=advance(s,.4);assert.equal(s.potionFlights.length,0);}
});
test('multiple potion throws are independent and effects cannot activate before impact',()=>{
 let s={...newBattle('active'),playerHP:50};s=drinkPotion(drinkPotion(drinkPotion(s,'heal'),'freeze'),'ink');assert.equal(new Set(s.potionFlights.map(f=>f.id)).size,3);s=advance(s,.5);assert.equal(s.playerHP,50);assert.equal(s.freezeUntil,0);assert.equal(s.unlimitedUntil,0);s=advance(s,.2);assert.equal(s.playerHP,80);assert.ok(s.freezeUntil>s.time&&s.unlimitedUntil>s.time);
});

test('taking contact damage pushes only the attacker back smoothly without negating damage',()=>{
 let s=newBattle('active','pack');s.enemies=s.enemies.map((e,i)=>({...e,x:i===0?CONTACT_X:590,attackAt:i===0?0:null}));
 s=stepBattle(s,.01);assert.equal(s.playerHP,88);assert.equal(s.playerHits,1);assert.equal(s.enemies[0].x,CONTACT_X);assert.equal(s.enemies[0].push!.to,CONTACT_X+105);assert.equal(s.enemies[1].push,null);
 const middle=advance(s,.1);assert.ok(middle.enemies[0].x>CONTACT_X&&middle.enemies[0].x<CONTACT_X+105);const end=advance(s,.28);assert.ok(Math.abs(end.enemies[0].x-(CONTACT_X+105))<.2);assert.equal(end.playerHP,88);
});

test('pairs start at the back with a stagger and walk 20 percent slower while both are alive',()=>{
 const pair=newBattle('active','pack'),solo=newBattle('active');
 assert.ok(pair.enemies[0].x>=solo.enemies[0].x);
 assert.ok(pair.enemies[1].x>pair.enemies[0].x);
 assert.ok(pair.enemies[1].x-pair.enemies[0].x<=80);
 const walked=advance(pair,1),soloWalk=advance(solo,1);
 const normalDistance=solo.enemies[0].x-soloWalk.enemies[0].x;
 for(let i=0;i<2;i++)assert.ok(Math.abs(pair.enemies[i].x-walked.enemies[i].x-normalDistance*.8)<1e-8);
 const survivor={...pair,enemies:pair.enemies.map((e,i)=>i===1?{...e,hp:0}:e)};
 assert.ok(Math.abs(survivor.enemies[0].x-advance(survivor,1).enemies[0].x-normalDistance)<1e-8);
 const final={...pair,difficulty:1.2};
 assert.ok(Math.abs(final.enemies[0].x-advance(final,1).enemies[0].x-normalDistance*.8*1.2)<1e-8);
});

test('accuracy curve flows through direct hits, spell push modifiers and burn',()=>{
 const base=firstEnemy(newBattle('active'),{x:CONTACT_X,element:'Neutral'});
 const faint=hitWithSpell(base,59),steady=hitWithSpell(base,60),beautiful=hitWithSpell(base,70),wonderful=hitWithSpell(base,100);
 assert.equal(base.enemies[0].hp-faint.enemies[0].hp,12);
 assert.equal(base.enemies[0].hp-steady.enemies[0].hp,19);
 assert.equal(base.enemies[0].hp-beautiful.enemies[0].hp,27);
 assert.equal(base.enemies[0].hp-wonderful.enemies[0].hp,64);
 assert.equal(wonderful.enemies[0].push!.to-CONTACT_X,160);
 assert.equal(faint.enemies[0].push!.to-CONTACT_X,26);
 assert.equal(spellKnockback(100,'wave'),160*1.7);
 assert.equal(spellKnockback(100,'bolt',1.25),160*.65*1.25);
 assert.equal(burnDamage(59,'Neutral'),3);assert.equal(burnDamage(100,'Neutral'),16);
 assert.equal(spellDamage({...base.enemies[0],element:'Nature'},100,'bolt',1.15,2),179);
});

test('contact push covers one-third of the runway for every enemy and only the first hit gets bell bonus',()=>{
 assert.equal(ENEMY_RUNWAY_SIZE,ENEMY_BACK_X-CONTACT_X);assert.equal(PLAYER_HIT_PUSH,ENEMY_RUNWAY_SIZE/3);
 for(const encounter of ['slime','pack','elite'] as const){
  let s=firstEnemy(newBattle('active',encounter),{x:CONTACT_X,attackAt:0});
  s=stepBattle(s,.01);assert.equal(s.enemies[0].push!.to-CONTACT_X,ENEMY_RUNWAY_SIZE/3);
  assert.ok(s.playerHP<100);assert.equal(s.enemies[0].x,CONTACT_X);
 }
 let s={...firstEnemy(newBattle('active'),{x:CONTACT_X,attackAt:0}),firstHitPush:80};
 s=stepBattle(s,.01);assert.equal(s.enemies[0].push!.to,CONTACT_X+PLAYER_HIT_PUSH+80);
 s=firstEnemy(s,{x:CONTACT_X,attackAt:0,push:null});s=stepBattle(s,.01);assert.equal(s.playerHits,2);assert.equal(s.enemies[0].push!.to,CONTACT_X+PLAYER_HIT_PUSH);
});

test('all encounters hold position and action clocks for five seconds before approaching',()=>{
 for(const encounter of ['slime','pack','elite'] as const){
  const start=makeBattle('active',encounter,()=>.4),waiting=advance(start,5);
  assert.equal(start.approachAt,5);assert.equal(waiting.playerHP,100);
  waiting.enemies.forEach((e,i)=>{assert.equal(e.x,start.enemies[i].x);assert.ok(Math.abs(e.clock)<1e-8);assert.equal(e.attackAt,null);});
  const moving=advance(waiting,.02);assert.ok(moving.enemies.every((e,i)=>e.x<waiting.enemies[i].x));
 }
});
test('a frame crossing the opening deadline advances only the time after five seconds',()=>{
 const start={...makeBattle('active','slime',()=>.4),time:4.98};
 const moved=stepBattle(start,.05);assert.ok(Math.abs(start.enemies[0].x-moved.enemies[0].x-18*.03)<1e-8);assert.ok(Math.abs(moved.enemies[0].clock-.03)<1e-8);
});
test('player spells and potions work during the opening pause',()=>{
 let s=makeBattle('active','slime',()=>.4);s=launchSpell(s,70,'#abc','water');s=advance(s,.4);
 assert.ok(s.enemies[0].hp<100);assert.equal(s.enemies[0].clock,0);assert.ok(s.enemies[0].x>=580);
 s=advance(drinkPotion({...s,playerHP:50},'heal'),.7);assert.equal(s.playerHP,80);assert.equal(s.enemies[0].clock,0);
});
