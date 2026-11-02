import type {Battle} from './battle';
export function spellAmbience(battle:Pick<Battle,'time'|'phase'|'bog'|'firestorm'>,paused=false){
 const {time,bog,firestorm}=battle;
 if(paused||battle.phase!=='active')return{rain:0,swamp:0};
 return{
  rain:firestorm&&time>=firestorm.rainAt?Math.max(0,Math.min(1,(time-firestorm.rainAt)/.2,(firestorm.portions.at(-1)!.until-time)/.3)):0,
  swamp:bog&&time>=bog.arrives?Math.max(0,Math.min(1,(time-bog.arrives)/.2,(bog.portions.at(-1)!.until-time)/.4)):0
 };
}

export function shouldPlaySpellArrival(id:string|undefined,battle:Pick<Battle,'time'|'bog'|'firestorm'>){
 const active=id==='firestorm'?battle.firestorm:id==='bog'?battle.bog:null;
 return !active||active.portions.at(-1)!.until<=battle.time;
}

export function firestormRollInAge(battle:Pick<Battle,'time'|'phase'|'firestorm'>,paused=false):number|null{
 const storm=battle.firestorm;
 if(paused||battle.phase!=='active'||!storm||battle.time<storm.started||battle.time>=storm.rainAt)return null;
 return battle.time-storm.started;
}
