import test from 'node:test';
import assert from 'node:assert/strict';
import {CONTACT_X,ENEMY_BACK_X,ENCOUNTERS,enemyY,hitWithSpell,newBattle,presentEnemies,stepBattle,type Battle,type Encounter} from '../src/battle.ts';
import {COMBAT_LANE_Y,LANE_FOLLOW_GAP,combatLane} from '../src/combatLanes.ts';

function advance(battle:Battle,seconds:number){
 const end=battle.time+seconds;
 while(battle.time<end-1e-9&&battle.phase==='active')battle=stepBattle(battle,Math.min(.05,end-battle.time));
 return battle;
}
function tracks(battle:Battle){
 return presentEnemies(battle).map(e=>enemyY(e.id,battle.encounter,e.lane));
}

test('solos start in the center, pairs use the outer lanes and triple groups use all three',()=>{
 assert.deepEqual(COMBAT_LANE_Y,[392,420,448]);
 assert.deepEqual(tracks(newBattle('active','slime')),[420]);
 for(const encounter of ['pack','spiderGoblinElite'] as const)assert.deepEqual(tracks(newBattle('active',encounter)),[392,448]);
 assert.deepEqual(tracks(newBattle('active','rockWebNest')),[392,420,448]);
 for(const encounter of Object.keys(ENCOUNTERS) as Encounter[]){
  const battle=newBattle('active',encounter);
  assert.ok(battle.enemies.every(e=>[392,420,448].includes(enemyY(e.id,encounter,e.lane))));
 }
});

test('later enemies prefer an empty track and wait outside when all entrances are blocked',()=>{
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
 assert.equal(presentEnemies(battle).length,3);
 battle.enemies[2].x=ENEMY_BACK_X-LANE_FOLLOW_GAP;
 battle=advance(battle,.2);
 assert.equal(presentEnemies(battle).length,4);
 assert.equal(battle.enemies[3].lane,2);
 assert.equal(battle.enemies[3].x,ENEMY_BACK_X);
});

test('same-track enemies hold their gap through knockback and only the lead can attack',()=>{
 const battle=newBattle('active','pack');
 battle.approachAt=0;
 battle.enemies=battle.enemies.map((e,i)=>({...e,lane:1,element:'Neutral',x:CONTACT_X+i*LANE_FOLLOW_GAP}));
 let next=hitWithSpell(battle,100,'water',1);
 next=advance(next,.3);
 assert.ok(next.enemies[0].x>CONTACT_X);
 assert.ok(next.enemies[1].x-next.enemies[0].x>=LANE_FOLLOW_GAP-1e-8);
 assert.ok(next.enemies[1].x<=ENEMY_BACK_X);

 next=advance(battle,.56);
 assert.equal(next.playerHits,1);
 assert.equal(next.enemies[1].attackAt,null);
 assert.ok(next.enemies[1].x-next.enemies[0].x>=LANE_FOLLOW_GAP-1e-8);
 next.enemies[0].hp=0;
 next.enemies[1].x=CONTACT_X;
 next=advance(next,.56);
 assert.equal(next.playerHits,2);
});

test('close neighboring tracks stagger the approach while keeping the shared contact line',()=>{
 const battle=newBattle('active','pack');
 battle.approachAt=0;
 battle.enemies=battle.enemies.map((e,i)=>({...e,lane:i===0?0:1,x:470}));
 const next=advance(battle,1);
 assert.ok(next.enemies[0].x<455+1);
 assert.equal(next.enemies[1].x,470);
 const contact=advance(battle,13);
 assert.ok(contact.playerHits>0);
});

test('the five Webbed ambush enemies stay within three lanes and hold space as waves mix',()=>{
 let battle=newBattle('active','spiderGoblinElite');
 for(let i=0;i<400;i++){
  battle=stepBattle(battle,.05);
  const active=presentEnemies(battle);
  for(const lane of [0,1,2]){
   const column=active.filter(e=>combatLane(e.id,battle.encounter,e.lane)===lane).sort((a,b)=>a.x-b.x);
   for(let j=1;j<column.length;j++)assert.ok(column[j].x-column[j-1].x>=LANE_FOLLOW_GAP-1e-8);
  }
 }
 assert.equal(presentEnemies(battle).length,5);
 assert.ok(new Set(tracks(battle)).size<=3);
});
