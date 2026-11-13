export const TORRENT_FALL_SECONDS=.65,TORRENT_SPLASH_SECONDS=.4,TORRENT_INTERVAL=1;
export const TORRENT_RADIUS_X=65,TORRENT_RADIUS_Y=35;
export type TorrentOrb={x:number;y:number;landsAt:number;applied:boolean};
export type Torrent={started:number;until:number;quality:number;damageBonus:number;pushBonus:number;upgrade:number;multiplier:number;midnight:number;orbs:TorrentOrb[]};
export function torrentDuration(quality:number){return !Number.isFinite(quality)||quality<48?0:quality<60?5:quality<70?8:quality<80?11:14;}
export function torrentContains(orb:Pick<TorrentOrb,'x'|'y'>,x:number,y:number){return ((x-orb.x)/TORRENT_RADIUS_X)**2+((y-orb.y)/TORRENT_RADIUS_Y)**2<=1+1e-9;}
