import type {Encounter,Enemy} from './battle.ts';
import {GOBLIN_KING_SCALE} from './goblinKing.ts';

export const CONTACT_X=325,ENEMY_BACK_X=640;
export const FILA_ART_Y=320,FILA_ART_SCALE=5,FILA_SPRITE_HEIGHT=31;
export const FILA_FOOT_Y=FILA_ART_Y+FILA_ART_SCALE*FILA_SPRITE_HEIGHT;
export const COMBAT_LANE_Y=[FILA_FOOT_Y-28,FILA_FOOT_Y,FILA_FOOT_Y+28] as const;
export const BATTLEFIELD_BOTTOM_Y=540;
export const SLIME_FOOT_OFFSET=20;
export const MOTHER_ART_SCALE=2.1;

export function enemyFootOffset(enemy:Pick<Enemy,'kind'|'goblinKing'>){
 if(enemy.kind==='mother')return SLIME_FOOT_OFFSET*MOTHER_ART_SCALE;
 if(enemy.kind==='goblin')return 25*(enemy.goblinKing?GOBLIN_KING_SCALE:1);
 if(enemy.kind==='spider')return 28.5;
 return SLIME_FOOT_OFFSET;
}
export type CombatLane=0|1|2;
export const CENTER_LANE=1;
const BACK_LANE=0,FRONT_LANE=2;
const PAIR=[BACK_LANE,FRONT_LANE] as const;
const THREE=[BACK_LANE,CENTER_LANE,FRONT_LANE] as const;
const DEFAULT=[CENTER_LANE,FRONT_LANE,BACK_LANE] as const;
const ENCOUNTER_LANES:Partial<Record<Encounter,readonly CombatLane[]>>={
 pack:PAIR,
 upperMeadow:PAIR,
 rockSpider:PAIR,
 shieldPack:[...PAIR,CENTER_LANE],
 mother:[CENTER_LANE,...THREE],
 rockWebNest:THREE,
 spiderGoblinElite:[...PAIR,CENTER_LANE,BACK_LANE,FRONT_LANE],
};

export function combatLane(id:number,encounter:Encounter,lane?:CombatLane):CombatLane{
 return lane??ENCOUNTER_LANES[encounter]?.[id-1]??DEFAULT[(id-1)%3]??CENTER_LANE;
}

export const LANE_MIN_GAP=10;

function sharesEntryLane(enemy:Enemy,encounter:Encounter){
 return (encounter==='rockWebNest'||encounter==='spiderGoblinElite')&&enemy.id>=4;
}

/** Choose an entrance lane without delaying the scheduled arrival. */
export function placeLaneArrivals(enemies:Enemy[],encounter:Encounter,time:number){
 if(encounter!=='rockWebNest'&&encounter!=='spiderGoblinElite')return enemies;
 const arrivals=enemies.filter(e=>e.hp>0&&sharesEntryLane(e,encounter)&&e.lane===undefined&&e.spawnAt<=time+1e-9);
 if(!arrivals.length)return enemies;
 const tails=new Map<CombatLane,Enemy>();
 function remember(e:Enemy){
  const lane=combatLane(e.id,encounter,e.lane);
  if((tails.get(lane)?.x??-Infinity)<e.x)tails.set(lane,e);
 }
 for(const e of enemies)if(e.hp>0&&e.spawnAt<=time+1e-9&&!arrivals.includes(e))remember(e);
 const replacements=new Map<number,Enemy>();
 for(const e of arrivals){
  const preferred=combatLane(e.id,encounter);
  const options=THREE.map(lane=>({lane,clearance:e.x-(tails.get(lane)?.x??-Infinity)}))
   .sort((a,b)=>Number(b.clearance>a.clearance)-Number(a.clearance>b.clearance)||Number(b.lane===preferred)-Number(a.lane===preferred));
  const placed={...e,lane:options[0].lane};
  replacements.set(e.id,placed);
  remember(placed);
 }
 return enemies.map(e=>replacements.get(e.id)??e);
}

/** A compact row can reach its target without waiting for its front enemy to move. */
export function laneContactReach(enemy:Enemy,ordered:Enemy[],encounter:Encounter,frontX:number,contactX:number){
 const lane=combatLane(enemy.id,encounter,enemy.lane);
 let reach=contactX;
 for(const other of ordered){
  if(other.x>reach+1e-9)break;
  if(other.id!==enemy.id&&!other.push&&other.x>=frontX&&other.x<enemy.x&&combatLane(other.id,encounter,other.lane)===lane){
   reach=Math.max(reach,other.x+LANE_MIN_GAP);
  }
 }
 return reach;
}

/** Resolve tight gaps after independent movement. Knockback yields to other enemies' positions. */
export function spaceLaneEnemies(previous:Enemy[],enemies:Enemy[],encounter:Encounter,time:number,startX:number,endX:number){
 const present=enemies.filter(e=>e.hp>0&&e.spawnAt<=time+1e-9);
 if(present.length<2)return enemies;
 const earlier=new Map(previous.map(e=>[e.id,e]));
 const positions=new Map<number,number>();
 for(const lane of THREE){
  const row=present.filter(e=>combatLane(e.id,encounter,e.lane)===lane);
  if(row.length<2)continue;
  const occupied:number[]=[];
  const position=(enemy:Enemy,direction:1|-1)=>{
   let x=enemy.x;
   for(let i=0;i<occupied.length;i++){
    const other=occupied[direction===1?i:occupied.length-1-i];
    if(Math.abs(x-other)<LANE_MIN_GAP-1e-9)x=other+direction*LANE_MIN_GAP;
   }
   return x>=startX&&x<=endX?x:undefined;
  };
  const moves=row.map(e=>{
   const old=earlier.get(e.id)??e;
   const priority=old.push?2:old.x===e.x?0:1;
   return {e,old,priority};
  }).sort((a,b)=>a.priority-b.priority||(a.priority===2?b.old.x-a.old.x:a.old.x-b.old.x)||a.e.id-b.e.id);
  for(const {e,priority} of moves){
   const preference=priority===2?1:-1;
   const x=position(e,preference)??position(e,preference===1?-1:1)??e.x;
   occupied.push(x);
   occupied.sort((a,b)=>a-b);
   if(x!==e.x)positions.set(e.id,x);
  }
 }
 return positions.size?enemies.map(e=>positions.has(e.id)?{...e,x:positions.get(e.id)!}:e):enemies;
}
