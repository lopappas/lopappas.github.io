import {COMBAT_LANE_Y,FILA_FOOT_Y} from './combatLanes.ts';
import {MIN_CAST_QUALITY} from './quality.ts';

export const MAGMA_TICK_SECONDS=.5;
export const MAGMA_DAMAGE=4;
const MIN_MAGMA_RADIUS_Y=Math.max(...COMBAT_LANE_Y.map(y=>Math.abs(y-FILA_FOOT_Y)))+8;

export type Magma={x:number;impactY:number;started:number;until:number;nextTick:number;radiusX:number;radiusY:number;quality:number;damage:number};

export function magmaSize(quality:number){
 const q=Math.min(100,Math.max(MIN_CAST_QUALITY,quality));
 const growth=(q-MIN_CAST_QUALITY)/(100-MIN_CAST_QUALITY);
 const duration=q<80?2+3*(q-MIN_CAST_QUALITY)/(80-MIN_CAST_QUALITY):5+(q-80)/20;
 return{radiusX:44+32*growth,radiusY:MIN_MAGMA_RADIUS_Y+8*growth,duration:Math.round(duration*2)/2};
}

export function magmaContains(magma:Magma,x:number,y:number){
 return ((x-magma.x)/magma.radiusX)**2+((y-FILA_FOOT_Y)/magma.radiusY)**2<=1;
}
