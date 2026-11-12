import {ROUTE} from './run.ts';
// The run-specific boss can be Slime Mother or Goblin King at this same stop.
export const ACT_ONE_BOSS=ROUTE.findIndex(node=>node.kind==='battle'&&node.encounter==='mother');
export const TRAIL_ACTS=[
 {number:1,title:'The Summit Skirt',start:0,end:ACT_ONE_BOSS},
 {number:2,title:'The Summit Saddle',start:ACT_ONE_BOSS+1,end:ROUTE.length-1},
] as const;
export function trailAct(node:number){return TRAIL_ACTS[node<=ACT_ONE_BOSS?0:1];}
export function actEncounters(node:number){const act=trailAct(node);return ROUTE.map((encounter,index)=>({encounter,index})).slice(act.start,act.end+1);}
