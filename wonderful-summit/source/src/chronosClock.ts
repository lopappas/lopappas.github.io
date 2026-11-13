import type {Battle} from './battle.ts';
/** Recasts restart one hand over the remaining active field duration, never shorten it. */
export function chronosClockFrame(battle:Pick<Battle,'phase'|'time'|'chronosFields'|'chronosPulse'>){
 if(battle.phase!=='active'||!battle.chronosPulse)return null;
 const started=battle.chronosPulse.started;
 const until=battle.chronosFields.reduce((end,field)=>Math.max(end,field.until),started);
 if(until<=started||battle.time<started||battle.time>=until)return null;
 const progress=Math.max(0,Math.min(1,(battle.time-started)/(until-started)));
 return{started,until,remaining:until-battle.time,angle:progress*360};
}
