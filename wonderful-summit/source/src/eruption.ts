import {COMBAT_LANE_Y,FILA_FOOT_Y} from './combatLanes.ts';
import {MIN_CAST_QUALITY} from './quality.ts';

export const MAGMA_TICK_SECONDS=.5;
export const ERUPTION_WARNING_SECONDS=.8;
export function eruptionStunSeconds(quality:number){
 return quality>=70?1.15:quality>=60?.85:.6;
}
export const ERUPTION_KNOCKBACK=10;
export const MAGMA_SLOW=.12;
const MIN_MAGMA_RADIUS_Y=Math.max(...COMBAT_LANE_Y.map(y=>Math.abs(y-FILA_FOOT_Y)))+8;

export type EruptionWarning={targetId:number;x:number;impactY:number;started:number;quality:number;upgrade:number;damageBonus:number};

export type Magma={x:number;impactY:number;started:number;until:number;nextTick:number;radiusX:number;radiusY:number;quality:number;damage:number};

export function magmaSize(quality:number,upgrade=0){
 const q=Math.min(100,Math.max(MIN_CAST_QUALITY,quality));
 const growth=(q-MIN_CAST_QUALITY)/(100-MIN_CAST_QUALITY);
 const duration=q<80?3+4*(q-MIN_CAST_QUALITY)/(80-MIN_CAST_QUALITY):7+1.5*(q-80)/20;
 return{radiusX:44+32*growth,radiusY:MIN_MAGMA_RADIUS_Y+8*growth,duration:Math.round(duration*2)/2+(upgrade>=1?1.5:0),damage:upgrade>=1?4:3};
}

export function magmaContains(magma:Magma,x:number,y:number){
 return ((x-magma.x)/magma.radiusX)**2+((y-FILA_FOOT_Y)/magma.radiusY)**2<=1;
}
