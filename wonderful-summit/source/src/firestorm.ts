export const FIRESTORM_ARRIVAL_SECONDS=2,FIRESTORM_TICK_SECONDS=.5;
export type FirestormPortion={until:number;quality:number;baseDamage:number;damageBonus:number;multiplier:number;midnightBonus:number};
export type Firestorm={started:number;rainAt:number;nextTick:number;portions:FirestormPortion[]};
export function firestormDuration(quality:number){
 if(!Number.isFinite(quality)||quality<48)return 0;
 const q=Math.min(100,quality),[lo,hi,min,max]=q<60?[48,59,3.5,4.5]:q<70?[60,69,5,7]:q<80?[70,79,8,10]:[80,100,12,16];
 return Math.round((min+(max-min)*(q-lo)/(hi-lo))*1000)/1000;
}
export function firestormBaseDamage(upgrade=0){return upgrade>=1?3:2;}
export function extendFirestorm(storm:Firestorm|null,time:number,quality:number,upgrade=0,damageBonus=1,multiplier=1,midnightBonus=0):Firestorm|null{
 const duration=firestormDuration(quality);if(!duration)return storm;
 const current=storm&&(storm.portions.at(-1)?.until??0)>time+1e-9?storm:null;
 const rainAt=current?.rainAt??time+FIRESTORM_ARRIVAL_SECONDS;
 const until=(current?.portions.at(-1)?.until??rainAt)+duration;
 return{started:current?.started??time,rainAt,nextTick:current?.nextTick??rainAt+FIRESTORM_TICK_SECONDS,portions:[...(current?.portions??[]),{until,quality,baseDamage:firestormBaseDamage(upgrade),damageBonus,multiplier,midnightBonus}]};
}
