import {CONTACT_X,ENEMY_BACK_X,FILA_FOOT_Y} from './combatLanes.ts';
import {MIN_CAST_QUALITY} from './quality.ts';
const DROP_RATE=1.2;
export const TORRENT_FALL_SECONDS=.65,TORRENT_SPLASH_SECONDS=.4,TORRENT_INTERVAL=1/DROP_RATE;
const DROP_SPOT_COUNT=10;
const spotSpacing=(ENEMY_BACK_X-CONTACT_X)/DROP_SPOT_COUNT;
export const TORRENT_HALF_WIDTH=35,TORRENT_HALF_HEIGHT=35;
const dropSpots=Array.from({length:DROP_SPOT_COUNT},(_,index)=>({
 x:CONTACT_X+(index+.5)*spotSpacing,y:FILA_FOOT_Y,
}));

export function torrentOrbs(started:number,duration:number,random:()=>number):TorrentOrb[]{
 const count=Math.floor(duration*DROP_RATE);
 const orbs:TorrentOrb[]=[];
 while(orbs.length<count){
  const shuffled=[...dropSpots];
  for(let i=0;i<shuffled.length-1;i++){
   const offset=Math.max(0,Math.min(shuffled.length-i-1,Math.floor(random()*(shuffled.length-i))));
   const j=i+offset;
   [shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];
  }
  for(const spot of shuffled.slice(0,count-orbs.length)){
   orbs.push({...spot,landsAt:started+(orbs.length+1)*TORRENT_INTERVAL,applied:false});
  }
 }
 return orbs;
}
export type TorrentOrb={x:number;y:number;landsAt:number;applied:boolean};
export type Torrent={started:number;until:number;quality:number;damageBonus:number;pushBonus:number;upgrade:number;multiplier:number;midnight:number;orbs:TorrentOrb[]};
export function torrentDuration(quality:number){return !Number.isFinite(quality)||quality<MIN_CAST_QUALITY?0:quality<60?5:quality<70?8:quality<80?11:14;}
export function torrentContains(orb:Pick<TorrentOrb,'x'|'y'>,x:number,y:number){return Math.abs(x-orb.x)<=TORRENT_HALF_WIDTH&&Math.abs(y-orb.y)<=TORRENT_HALF_HEIGHT;}
