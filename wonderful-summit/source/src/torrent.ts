import {CONTACT_X,ENEMY_BACK_X,FILA_FOOT_Y} from './combatLanes.ts';
import {MIN_CAST_QUALITY} from './quality.ts';
export const TORRENT_FALL_SECONDS=.65,TORRENT_SPLASH_SECONDS=.4,TORRENT_INTERVAL=1;
const DROP_SPOT_COUNT=6;
const columnWidth=(ENEMY_BACK_X-CONTACT_X)/DROP_SPOT_COUNT;
export const TORRENT_HALF_WIDTH=columnWidth/2,TORRENT_HALF_HEIGHT=35;
const dropSpots=Array.from({length:DROP_SPOT_COUNT},(_,index)=>({
 x:CONTACT_X+(index+.5)*columnWidth,y:FILA_FOOT_Y,
}));

export function torrentDropSpot(roll:number){
 const index=Math.max(0,Math.min(DROP_SPOT_COUNT-1,Math.floor(roll*DROP_SPOT_COUNT)));
 return dropSpots[index];
}
export type TorrentOrb={x:number;y:number;landsAt:number;applied:boolean};
export type Torrent={started:number;until:number;quality:number;damageBonus:number;pushBonus:number;upgrade:number;multiplier:number;midnight:number;orbs:TorrentOrb[]};
export function torrentDuration(quality:number){return !Number.isFinite(quality)||quality<MIN_CAST_QUALITY?0:quality<60?5:quality<70?8:quality<80?11:14;}
export function torrentContains(orb:Pick<TorrentOrb,'x'|'y'>,x:number,y:number){return Math.abs(x-orb.x)<=TORRENT_HALF_WIDTH&&Math.abs(y-orb.y)<=TORRENT_HALF_HEIGHT;}
