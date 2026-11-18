import type {Encounter,Enemy} from './battle.ts';

export const COMBAT_LANE_Y=[392,420,448] as const;
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

export const LANE_FOLLOW_GAP=104;

function sharesEntryLane(enemy:Enemy,encounter:Encounter){
 return (encounter==='rockWebNest'||encounter==='spiderGoblinElite')&&enemy.id>=4;
}

/** Keep later arrivals behind the rear enemy, even when their preferred track is busy. */
export function placeLaneArrivals(enemies:Enemy[],encounter:Encounter,time:number,backX:number){
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
  const options=THREE.map(lane=>{
   const rear=tails.get(lane);
   return {lane,clearance:rear?e.x-rear.x-LANE_FOLLOW_GAP:Infinity,x:rear?Math.max(e.x,rear.x+LANE_FOLLOW_GAP):e.x};
  }).filter(option=>option.x<=backX).sort((a,b)=>Number(b.clearance>a.clearance)-Number(a.clearance>b.clearance)||Number(b.lane===preferred)-Number(a.lane===preferred));
  const slot=options[0];
  const placed=slot?{...e,lane:slot.lane,x:slot.x}:{...e,spawnAt:time+.1};
  replacements.set(e.id,placed);
  if(slot)remember(placed);
 }
 return enemies.map(e=>replacements.get(e.id)??e);
}

export type LaneQueueSlot={ahead?:Enemy;maxX:number};

export function laneQueues(enemies:Enemy[],encounter:Encounter,backX:number){
 if(enemies.length<2||enemies.length<=3&&new Set(enemies.map(e=>combatLane(e.id,encounter,e.lane))).size===enemies.length)return null;
 const result=new Map<number,LaneQueueSlot>();
 for(const lane of THREE){
  const row=enemies.filter(e=>combatLane(e.id,encounter,e.lane)===lane).sort((a,b)=>a.x-b.x||a.id-b.id);
  if(row.length<2)continue;
  let maxX=backX;
  for(let i=row.length-1;i>=0;i--){
   const e=row[i];
   result.set(e.id,{ahead:row[i-1],maxX});
   maxX-=LANE_FOLLOW_GAP;
  }
 }
 return result;
}

const STAGGER_GAP=34;

/** Offset neighboring tracks during the approach. The offset tapers at contact. */
export function staggeredWalkX(enemy:Enemy,x:number,contactX:number,walkers:Enemy[],encounter:Encounter){
 if(x>=enemy.x)return x;
 const lane=combatLane(enemy.id,encounter,enemy.lane);
 for(const other of walkers){
  if(other.x>enemy.x||other.x===enemy.x&&other.id>=enemy.id)continue;
  if(Math.abs(combatLane(other.id,encounter,other.lane)-lane)!==1)continue;
  const gap=Math.min(STAGGER_GAP,Math.max(0,other.x-contactX-STAGGER_GAP));
  if(gap>0)x=Math.max(x,Math.min(enemy.x,other.x+gap));
 }
 return x;
}
