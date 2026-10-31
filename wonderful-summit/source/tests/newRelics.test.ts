import {test} from 'node:test';
import assert from 'node:assert/strict';
import {newRun,battleForRun,finishBattle,enterNode,RELICS,STARTER_RELICS,type RelicId} from '../src/run.ts';
import {newBattle,launchSpell,releaseMultiplier,fizzleSpell,stepBattle,hitWithSpell,CONTACT_X,PLAYER_HIT_PUSH,presentEnemies} from '../src/battle.ts';
import {parseDeveloperCommand,applyDeveloperCommand} from '../src/developerCommands.ts';
import {POTION_IDS} from '../src/battle.ts';
function advance(b:ReturnType<typeof newBattle>,seconds:number){for(let i=0;i<Math.round(seconds*100);i++)b=stepBattle(b,.01);return b;}
function setup(){const b=newBattle('active');b.approachAt=1000;b.enemies[0]={...b.enemies[0],element:'Neutral',hp:10000,maxHP:10000,x:400};return b;}
function contact(b:ReturnType<typeof newBattle>){b={...b,approachAt:0,enemies:b.enemies.map(e=>({...e,x:CONTACT_X,push:null,attackAt:0}))};return stepBattle(b,.01);}
test('Theodora keepsakes have updated names and stats, and never enter natural relic pools',()=>{
 assert.equal(RELICS.amber.name,'Madora’s Earring');assert.equal(RELICS.feather.name,'Heirloom inkwell');assert.equal(RELICS.moon.name,'Gravity Needle');
 for(let i=0;i<100;i++){const r={...newRun(),screen:'map' as const,node:2};assert.ok(enterNode(r,()=>i/100).stock.filter(s=>s.kind==='relic').every(s=>!STARTER_RELICS.includes(s.item as RelicId)));const reward=finishBattle({...r,screen:'battle',node:3},{...newBattle('active'),phase:'victory'},()=>i/100).reward!;assert.ok(!STARTER_RELICS.includes(reward.relic!));}
 const run={...newRun(),screen:'battle' as const,relics:['moss' as const]};assert.equal(finishBattle(run,{...battleForRun(run),phase:'victory',playerHP:54},()=>.99).health,66);
 const gravity=battleForRun({...newRun(),relics:['moon']});assert.equal(gravity.pushBonus,1.15);assert.ok(Math.abs(contact(gravity).enemies[0].push!.to-CONTACT_X-PLAYER_HIT_PUSH*1.15)<1e-8);
});
test('new relics enter merchant/elite pools while broken shale does not reappear naturally',()=>{
 for(const id of ['lotus','colorfulRock','impossibleShale'] as RelicId[]){const relics=(Object.keys(RELICS) as RelicId[]).filter(x=>x!==id),r={...newRun(),screen:'map' as const,node:2,relics};assert.ok(enterNode(r,()=>0).stock.some(s=>s.item===id));assert.equal(finishBattle({...r,screen:'battle',node:3},{...newBattle('active'),phase:'victory'},()=>0).reward?.relic,id);}
 const r={...newRun(),screen:'map' as const,node:2,shaleContacts:3};for(let i=0;i<30;i++)assert.ok(!enterNode(r,()=>i/30).stock.some(s=>s.item==='impossibleShale'));
});
test('Blooming Lotus boosts only the first offensive release; control spells and fizzles preserve it',()=>{
 let b=setup();b.lotus=true;b.lotusReady=true;assert.equal(releaseMultiplier(b,'water'),1.3);assert.equal(releaseMultiplier(b,'chronos'),1);assert.equal(fizzleSpell(b).lotusReady,true);
 b=advance(launchSpell(b,60,'#fff','chronos'),.33);assert.equal(b.lotusReady,true);b=launchSpell(b,60,'#fff','water');assert.equal(b.lotusReady,false);assert.equal(b.projectile?.damageMultiplier,1.3);b=advance(b,.33);b=launchSpell(b,60,'#fff','fire');assert.equal(b.projectile?.damageMultiplier,1);
 const run={...newRun(),relics:['lotus' as const]};assert.equal(battleForRun(run).lotusReady,true);
});
test('Colorful Rock compares successfully played elements and snapshots multipliers onto projectiles',()=>{
 let b=setup();b.colorful=true;assert.equal(releaseMultiplier(b,'fire'),1);b=advance(launchSpell(b,60,'#fff','water'),.33);assert.equal(b.lastElement,'Water');assert.equal(releaseMultiplier(b,'wave'),1);assert.equal(releaseMultiplier(b,'fire'),1.15);assert.equal(fizzleSpell(b).lastElement,'Water');b=launchSpell(b,60,'#fff','fire');assert.equal(b.projectile?.damageMultiplier,1.15);assert.equal(b.lastElement,'Fire');
 b=setup();b.colorful=true;b.lastElement='Water';b.lotus=true;b.lotusReady=true;b.furyReady=true;assert.equal(releaseMultiplier(b,'fire'),2*1.3*1.15);
});
test('Impossible Shale curses attackers permanently, counts contacts across fights, breaks once, and applies its internal recovery',()=>{
 let b=setup();b.shaleActive=true;b=contact(b);assert.equal(b.shaleContacts,1);assert.ok(b.enemies[0].curseTick);const hp=b.enemies[0].hp;b.freezeUntil=100;b=advance(b,2.01);assert.equal(hp-b.enemies[0].hp,10);
 b.freezeUntil=0;b=contact(b);assert.equal(b.shaleContacts,2);const before=b.playerHP;b=contact(b);assert.equal(b.shaleContacts,3);assert.equal(b.shaleActive,false);assert.equal(b.playerHP,Math.min(100,before-12+15));const tick=b.enemies[0].curseTick;b=contact(b);assert.equal(b.shaleContacts,3);assert.equal(b.enemies[0].curseTick,tick);
 const r={...newRun(),screen:'battle' as const,relics:['impossibleShale' as const]};const carried=finishBattle(r,{...b,phase:'victory'},()=>.99);assert.equal(carried.shaleContacts,3);assert.ok(carried.relics.includes('impossibleShale'));assert.equal(battleForRun(carried).shaleActive,false);
 const partial=finishBattle(r,{...newBattle('active'),phase:'victory',shaleContacts:2},()=>.99);assert.equal(battleForRun(partial).shaleContacts,2);assert.equal(battleForRun(partial).shaleActive,true);
 assert.ok(!/heal|health|regain|recover/i.test(RELICS.impossibleShale.description));
});
test('curse damage ignores elemental shields and ends combat when its final victim dies',()=>{
 let b=setup();b.shaleActive=true;b.enemies[0].hp=5;b=contact(b);b.freezeUntil=100;b=advance(b,1.01);assert.equal(b.enemies[0].hp,0);assert.equal(b.phase,'victory');
});
test('developer potion grants validate IDs, honor purse capacity, and reserve bottle capture',()=>{
 for(const id of POTION_IDS){assert.deepEqual(parseDeveloperCommand({type:'potion',id}),{type:'potion',id});const granted=applyDeveloperCommand(newRun(),{type:'potion',id});assert.equal(granted.potions[id],id==='theodoraHeal'?2:1);assert.equal(granted.pendingBottle,id==='spellBottle');}
 assert.equal(parseDeveloperCommand({type:'potion',id:'unknown'}),null);const r={...newRun(),potions:{heal:3,freeze:0,ink:0}};assert.equal(applyDeveloperCommand(r,{type:'potion',id:'fury'}),r);
});
test('Slime Mother offspring have all six possible orders and deal exactly 12 damage at every difficulty',()=>{
 const orders=new Set<string>();for(const a of [0,.4,.8])for(const c of [0,.8]){let call=0;let b=newBattle('active','mother',()=>call++===0?0:call===2?a:c);orders.add(b.offspringOrder.join('/'));b.enemies[0].hp=0;b=advance(b,2.01);assert.deepEqual(presentEnemies(b).map(e=>e.element),b.offspringOrder);for(const difficulty of [1,1.2,2]){const child={...presentEnemies(b)[0],x:CONTACT_X,push:null,attackAt:0,readyAt:0};const hit=stepBattle({...b,difficulty,approachAt:0,enemies:[child]},.01);assert.equal(b.playerHP-hit.playerHP,12);}}
 assert.equal(orders.size,6);
});
