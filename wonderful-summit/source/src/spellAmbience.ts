import type {Battle} from './battle';
import {ERUPTION_WARNING_SECONDS} from './eruption.ts';
export function spellAmbience(battle:Pick<Battle,'time'|'phase'|'bog'|'firestorm'|'eruptionWarnings'>,paused=false){
 const {time,bog,firestorm}=battle;
 if(paused||battle.phase!=='active')return{rain:0,swamp:0,sizzle:0};
 return{
  sizzle:battle.eruptionWarnings.reduce((level,warning)=>{
   const age=time-warning.started;
   return Math.max(level,Math.min(1,(age+.04)/.12,(ERUPTION_WARNING_SECONDS-age)/.12));
  },0),
  rain:firestorm&&time>=firestorm.rainAt?Math.max(0,Math.min(1,(time-firestorm.rainAt)/.2,(firestorm.portions.at(-1)!.until-time)/.3)):0,
  swamp:bog&&time>=bog.arrives?Math.max(0,Math.min(1,(time-bog.arrives)/.2,(bog.portions.at(-1)!.until-time)/.4)):0
 };
}

export function shouldPlaySpellArrival(id:string|undefined,battle:Pick<Battle,'time'|'bog'|'firestorm'>){
 if(id==='eruption')return false;
 const active=id==='firestorm'?battle.firestorm:id==='bog'?battle.bog:null;
 return !active||active.portions.at(-1)!.until<=battle.time;
}
