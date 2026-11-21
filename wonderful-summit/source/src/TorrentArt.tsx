import React,{memo} from 'react';
import {decorativeTime} from './visualCadence';
import type {Torrent} from './torrent';
import {TORRENT_FALL_SECONDS,TORRENT_SPLASH_SECONDS,TORRENT_RADIUS_X,TORRENT_RADIUS_Y} from './torrent';
import {grayPaint} from './PaletteGroup';
const DROPS=Array.from({length:8},(_,i)=>({i,x:Math.cos(i*Math.PI/4)*TORRENT_RADIUS_X,y:Math.sin(i*Math.PI/4)*TORRENT_RADIUS_Y}));
export function TorrentArt({torrent,time,gray=0}:{torrent:Torrent|null;time:number;gray?:number}){
 if(!torrent)return null;
 return <g pointerEvents="none" aria-label="Torrent water orbs splashing the battlefield">{torrent.orbs.map((orb,i)=>{
  const age=time-orb.landsAt;if(age< -TORRENT_FALL_SECONDS||age>TORRENT_SPLASH_SECONDS)return null;
  return <TorrentOrbArt key={i} x={orb.x} y={orb.y} landsAt={orb.landsAt} time={age<0?time:Math.max(orb.landsAt,decorativeTime(time))} falling={age<0} gray={gray}/>;
 })}</g>;
}
export const TorrentOrbArt=memo(function TorrentOrbArt({x,y,landsAt,time,falling,gray}:{x:number;y:number;landsAt:number;time:number;falling:boolean;gray:number}){
 const orb={x,y},age=time-landsAt,paint=(color:string)=>grayPaint(color,gray) as string;
 if(falling){const t=1+age/TORRENT_FALL_SECONDS;
  return <g><ellipse cx={orb.x} cy={orb.y} rx={TORRENT_RADIUS_X} ry={TORRENT_RADIUS_Y} fill={paint('#69c2d6')} opacity={.06+.12*t}/><circle cx={orb.x} cy={orb.y-220*(1-t)} r={18} fill={paint('#69c2d6')} stroke={paint('#c5f3fa')} strokeWidth="3"/><ellipse cx={orb.x-5} cy={orb.y-220*(1-t)-5} rx="4" ry="6" fill={paint('#e6fbff')}/></g>;
 }
 const t=age/TORRENT_SPLASH_SECONDS;
 return <g opacity={1-t} transform={`translate(${orb.x} ${orb.y})`}><ellipse rx={TORRENT_RADIUS_X*(.3+.7*t)} ry={TORRENT_RADIUS_Y*(.3+.7*t)} fill={paint('#69c2d6')} fillOpacity=".35" stroke={paint('#c5f3fa')} strokeWidth={4*(1-t)}/>{DROPS.map(({i,x,y})=><circle key={i} cx={x*t} cy={y*t-24*Math.sin(Math.PI*t)} r={5*(1-t)} fill={paint('#9edfeb')}/>)}</g>;
});
