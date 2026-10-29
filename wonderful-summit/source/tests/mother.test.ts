import {test} from 'node:test';
import assert from 'node:assert/strict';
import {newBattle,hitWithSpell,stepBattle,spellKnockback,presentEnemies,CONTACT_X,nearestEnemy} from '../src/battle.ts';
import {ROUTE,newRun,battleForRun,finishBattle} from '../src/run.ts';
function advance(b:ReturnType<typeof newBattle>,seconds:number){for(let i=0;i<Math.round(seconds*100);i++)b=stepBattle(b,.01);return b;}
function slain(){let b=newBattle('active','mother',()=>0);b.time=7;b.enemies[0]={...b.enemies[0],hp:1,x:401};return hitWithSpell(b,100,'water');}
test('Slime Mother is the final trail battle with 300 HP and every random starting element',()=>{
 assert.equal(ROUTE.at(-1)?.encounter,'mother');
 for(const [roll,element] of [[0,'Fire'],[.4,'Water'],[.8,'Nature']] as const){const b=newBattle('active','mother',()=>roll);assert.equal(b.enemies[0].element,element);assert.equal(b.enemies[0].hp,300);assert.equal(b.enemies[0].maxHP,300);assert.equal(b.enemies[0].kind,'mother');}
 const run={...newRun(),screen:'battle' as const,node:ROUTE.length-1};const b=battleForRun(run);assert.equal(b.encounter,'mother');assert.equal(finishBattle(run,b).screen,'battle');
});
test('Mother changes to a different element precisely every 15 combat seconds, even while stunned',()=>{
 let b=newBattle('active','mother',()=>0);b.approachAt=1000;b=advance(b,14.99);assert.equal(b.enemies[0].element,'Fire');b=stepBattle(b,.01);assert.equal(b.enemies[0].element,'Water');b=hitWithSpell(b,100,'chronos');b=advance(b,15);assert.equal(b.enemies[0].element,'Nature');b=advance(b,15);assert.equal(b.enemies[0].element,'Fire');
});
test('Mother takes exactly 20 contact damage at all route difficulties and resists 20 percent of spell knockback',()=>{
 for(const difficulty of [1,1.2]){let b=newBattle('active','mother');b.approachAt=0;b.difficulty=difficulty;b.enemies[0]={...b.enemies[0],x:CONTACT_X,attackAt:0};b=stepBattle(b,.01);assert.equal(b.playerHP,80);}
 for(const quality of [48,59,60,70,100])for(const id of ['water','wave','fire','bolt','nature','leaf'] as const){const b=newBattle('active','mother',()=>0);b.enemies[0].x=CONTACT_X;const hit=hitWithSpell(b,quality,id);assert.ok(Math.abs(hit.enemies[0].push!.to-CONTACT_X-spellKnockback(quality,id,1,'Fire')*.8)<1e-8);}
});
test('Mother waits two seconds after direct death, splits once at her death location, then children wait four seconds',()=>{
 let b=slain();assert.equal(b.phase,'active');assert.equal(presentEnemies(b).length,0);assert.equal(nearestEnemy(b),undefined);assert.equal(b.motherSplit?.at,7);assert.equal(b.motherSplit?.x,401);
 const paused=stepBattle({...b,phase:'ready'},.1);assert.equal(paused.time,7);assert.equal(paused.motherSplit?.spawned,false);
 b=advance(b,1.99);assert.equal(b.enemies.length,1);b=stepBattle(b,.01);assert.equal(b.enemies.length,4);assert.equal(b.phase,'active');
 const kids=presentEnemies(b);assert.equal(kids.length,3);assert.deepEqual([...kids.map(e=>e.element)].sort(),['Fire','Nature','Water']);assert.deepEqual(kids.map(e=>e.x),[365,401,437]);for(const e of kids){assert.equal(e.hp,100);assert.equal(e.spawnAt,9);assert.equal(e.readyAt,13);}
 b=advance(b,3.99);assert.equal(b.playerHP,100);for(const e of presentEnemies(b)){assert.equal(e.x,365+(e.id-2)*36);assert.equal(e.clock,0);assert.equal(e.attackAt,null);}
 b=advance(b,.03);assert.ok(presentEnemies(b).every(e=>e.x<365+(e.id-2)*36));assert.equal(b.enemies.length,4);
 for(const e of b.enemies)b={...b,enemies:b.enemies.map(x=>({...x,hp:x.id===e.id?0:x.hp}))};b=stepBattle(b,.01);assert.equal(b.phase,'victory');
});
test('offspring at contact cannot attack before their four-second pause ends',()=>{
 let b=slain();b={...b,motherSplit:{...b.motherSplit!,x:CONTACT_X}};b=advance(b,5.99);assert.equal(b.playerHP,100);assert.ok(presentEnemies(b).every(e=>e.attackAt===null));b=advance(b,.5);assert.ok(b.playerHP<100);
});
test('burn death triggers the same delayed split and children inherit remaining Chronos',()=>{
 let b=newBattle('active','mother',()=>.4);b=hitWithSpell(b,100,'chronos');b.enemies[0]={...b.enemies[0],hp:1,x:440,burn:{damage:1,nextTick:1,ticks:1}};b=advance(b,1);assert.equal(b.phase,'active');assert.ok(Math.abs(b.motherSplit!.at-1)<1e-8);b=advance(b,2);assert.equal(presentEnemies(b).length,3);for(const e of presentEnemies(b)){assert.equal(e.stunUntil,18);assert.equal(e.x,404+(e.id-2)*36);}b=advance(b,5);assert.ok(presentEnemies(b).every(e=>e.x===404+(e.id-2)*36));assert.equal(b.enemies.length,4);
});
test('children can be targeted during their arrival pause and final victory requires all three deaths',()=>{
 let b=advance(slain(),2);for(let i=0;i<2;i++){const e=presentEnemies(b)[0];b.enemies=b.enemies.map(x=>x.id===e.id?{...x,hp:1}:x);b=hitWithSpell(b,100,'chronos');b=hitWithSpell(b,100,'water');assert.equal(b.phase,'active');}
 const e=presentEnemies(b)[0];b.enemies=b.enemies.map(x=>x.id===e.id?{...x,hp:1}:x);b=hitWithSpell(b,100,'water');assert.equal(b.phase,'victory');
});
