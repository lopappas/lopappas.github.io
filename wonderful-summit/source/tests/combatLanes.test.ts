import test from 'node:test';
import assert from 'node:assert/strict';
import {CONTACT_X,ENEMY_BACK_X,ENCOUNTERS,createSpider,enemyArtY,enemyY,fizzleSpell,hitWithSpell,launchSpell,newBattle,presentEnemies,stepBattle,type Battle,type Encounter} from '../src/battle.ts';
import {BATTLEFIELD_BOTTOM_Y,COMBAT_LANE_Y,FILA_FOOT_Y,LANE_MIN_GAP,combatLane,enemyFootOffset} from '../src/combatLanes.ts';

function advance(battle:Battle,seconds:number){
 const end=battle.time+seconds;
 while(battle.time<end-1e-9&&battle.phase==='active')battle=stepBattle(battle,Math.min(.05,end-battle.time));
 return battle;
}
function tracks(battle:Battle){
 return presentEnemies(battle).map(e=>enemyY(e.id,battle.encounter,e.lane));
}

test('solos start in the center, pairs use the outer lanes and triple groups use all three',()=>{
 assert.deepEqual(COMBAT_LANE_Y,[FILA_FOOT_Y-28,FILA_FOOT_Y,FILA_FOOT_Y+28]);
 assert.deepEqual(tracks(newBattle('active','slime')),[FILA_FOOT_Y]);
 for(const encounter of ['pack','spiderGoblinElite'] as const)assert.deepEqual(tracks(newBattle('active',encounter)),[COMBAT_LANE_Y[0],COMBAT_LANE_Y[2]]);
 assert.deepEqual(tracks(newBattle('active','rockWebNest')),[...COMBAT_LANE_Y]);
 for(const encounter of Object.keys(ENCOUNTERS) as Encounter[]){
  const battle=newBattle('active',encounter);
  for(const e of battle.enemies){
   const track=enemyY(e.id,encounter,e.lane);
   assert.ok(COMBAT_LANE_Y.includes(track));
   assert.equal(enemyArtY(e,encounter)+enemyFootOffset(e),track);
  }
 }
 assert.ok(BATTLEFIELD_BOTTOM_Y-COMBAT_LANE_Y[2]>=35);
});

test('reinforcements prefer an empty lane and still arrive when each entrance is occupied',()=>{
 let battle=newBattle('active','rockWebNest');
 battle.approachAt=1000;
 battle.enemies[1].hp=0;
 battle=advance(battle,10);
 assert.equal(battle.enemies[3].lane,1);
 assert.equal(battle.enemies[3].x,ENEMY_BACK_X);

 battle=newBattle('active','rockWebNest');
 battle.approachAt=1000;
 battle.enemies=battle.enemies.map(e=>({...e,x:ENEMY_BACK_X}));
 battle=advance(battle,10);
 assert.equal(presentEnemies(battle).length,4);
 assert.equal(battle.enemies[3].lane,1);
 assert.equal(battle.enemies[3].x,ENEMY_BACK_X-LANE_MIN_GAP);
 assert.equal(battle.enemies[1].x,ENEMY_BACK_X);
});

test('a faster same-lane enemy can overtake and moves 10 units ahead',()=>{
 const battle=newBattle('active','pack');
 battle.approachAt=0;
 battle.enemies=[
  {...battle.enemies[0],x:400,lane:1},
  {...createSpider(2,411),lane:1},
 ];
 const next=stepBattle(battle,.1);
 assert.ok(next.enemies[0].x<400);
 assert.equal(next.enemies[1].x,next.enemies[0].x-LANE_MIN_GAP);
 const continued=stepBattle(next,.1);
 assert.ok(continued.enemies[1].x<next.enemies[1].x);
 assert.ok(continued.enemies[0].x<next.enemies[0].x);
});

test('single-target knockback leaves an adjacent lane-mate alone and area knockback moves each hit enemy',()=>{
 const battle=newBattle('active','pack');
 battle.approachAt=1000;
 battle.enemies=battle.enemies.map((e,i)=>({...e,lane:1,element:'Neutral',x:400+i*LANE_MIN_GAP}));
 const next=advance(hitWithSpell(battle,100,'water',1),.3);
 assert.ok(next.enemies[0].x>battle.enemies[0].x);
 assert.equal(next.enemies[1].x,battle.enemies[1].x);
 assert.equal(next.enemies[1].push,null);
 assert.ok(next.enemies[0].x-next.enemies[1].x>=LANE_MIN_GAP);
 const area=advance(fizzleSpell({...battle,castingRelics:{...battle.castingRelics,sphere:true}}),.3);
 assert.ok(area.enemies.every((e,i)=>e.x>battle.enemies[i].x));
 const wave=advance(launchSpell(battle,80,'#69c2d6','tidalcrest'),1.2);
 assert.ok(wave.enemies.every((e,i)=>e.x>battle.enemies[i].x));
});

test('both enemies at the end of a compact lane can attack without the front one leaving',()=>{
 const battle=newBattle('active','pack');
 battle.approachAt=0;
 battle.enemies=battle.enemies.map((e,i)=>({...e,lane:1,x:CONTACT_X+i*LANE_MIN_GAP}));
 const winding=stepBattle(battle,.05);
 assert.ok(winding.enemies.every(e=>e.attackAt!==null));
 const next=advance(winding,.5);
 assert.equal(next.playerHits,2);
});

test('the five Webbed ambush enemies stay within three lanes and hold space as waves mix',()=>{
 let battle=newBattle('active','spiderGoblinElite');
 for(let i=0;i<400;i++){
  battle=stepBattle(battle,.05);
  const active=presentEnemies(battle);
  for(const lane of [0,1,2]){
   const column=active.filter(e=>combatLane(e.id,battle.encounter,e.lane)===lane).sort((a,b)=>a.x-b.x);
   for(let j=1;j<column.length;j++)assert.ok(column[j].x-column[j-1].x>=LANE_MIN_GAP-1e-8);
  }
 }
 assert.equal(presentEnemies(battle).length,5);
 assert.ok(new Set(tracks(battle)).size<=3);
});
