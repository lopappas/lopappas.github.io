import React from 'react';
import type {Torrent} from './torrent';
import {TORRENT_FALL_SECONDS,TORRENT_SPLASH_SECONDS,TORRENT_RADIUS_X,TORRENT_RADIUS_Y} from './torrent';
import {grayPaint} from './PaletteGroup';
export function TorrentArt({torrent,time,gray=0}:{torrent:Torrent|null;time:number;gray?:number}){
 if(!torrent)return null;
 const paint=(color:string)=>grayPaint(color,gray) as string;
 return <g pointerEvents="none" aria-label="Torrent water orbs splashing the battlefield">{torrent.orbs.map((orb,i)=>{
  const age=time-orb.landsAt;if(age< -TORRENT_FALL_SECONDS||age>TORRENT_SPLASH_SECONDS)return null;
  if(age<0){const t=1+age/TORRENT_FALL_SECONDS;
   return <g key={i}><ellipse cx={orb.x} cy={orb.y} rx={TORRENT_RADIUS_X} ry={TORRENT_RADIUS_Y} fill={paint('#69c2d6')} opacity={.06+.12*t}/><circle cx={orb.x} cy={orb.y-220*(1-t)} r={18} fill={paint('#69c2d6')} stroke={paint('#c5f3fa')} strokeWidth="3"/><ellipse cx={orb.x-5} cy={orb.y-220*(1-t)-5} rx="4" ry="6" fill={paint('#e6fbff')}/></g>;
  }
  const t=age/TORRENT_SPLASH_SECONDS;
  return <g key={i} opacity={1-t} transform={`translate(${orb.x} ${orb.y})`}><ellipse rx={TORRENT_RADIUS_X*(.3+.7*t)} ry={TORRENT_RADIUS_Y*(.3+.7*t)} fill={paint('#69c2d6')} fillOpacity=".35" stroke={paint('#c5f3fa')} strokeWidth={4*(1-t)}/>{Array.from({length:8},(_,j)=>{const angle=j*Math.PI/4;return <circle key={j} cx={Math.cos(angle)*TORRENT_RADIUS_X*t} cy={Math.sin(angle)*TORRENT_RADIUS_Y*t-24*Math.sin(Math.PI*t)} r={5*(1-t)} fill={paint('#9edfeb')}/>;})}</g>;
 })}</g>;
}
