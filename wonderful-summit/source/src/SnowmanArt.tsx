import React,{memo} from 'react';
import {enemyY,type Battle} from './battle';
import {CENTER_LANE,COMBAT_LANE_Y} from './combatLanes';
import {SNOWBALL_FLIGHT_SECONDS,SNOWMAN_MELT_SECONDS} from './snowman';

const GROUND_Y=COMBAT_LANE_Y[CENTER_LANE]+20;
const BODY_OFFSET_X=-67;
// Filadora is 31 sprite pixels tall at 5 world units per pixel.
const BODY_SCALE=31*5*.85/40;
const RELEASE_TIP={x:20,y:-29};
const LEFT_TWIG='M-10-19h-4v-2h-3v-2h-2m2 2v-4';
const RIGHT_TWIG={
 idle:'M10-19h4v-2h3v-2h2m-2 2v-4',
 flick:`M10-19h3v-3h2v-3h3V${RELEASE_TIP.y}H${RELEASE_TIP.x}m-4 4v-4`,
 followThrough:'M10-19h4v1h4v-1h3m-4 1v-4',
};

function meltProgress(expiresAt:number|null,time:number){
 return expiresAt===null?0:Math.max(0,Math.min(1,1-(expiresAt-time)/SNOWMAN_MELT_SECONDS));
}

const SnowmanBody=memo(function SnowmanBody({pose}:{pose:keyof typeof RIGHT_TWIG}){
 const arms=LEFT_TWIG+RIGHT_TWIG[pose];
 return <g shapeRendering="crispEdges" transform={`scale(${BODY_SCALE})`}>
  <path d={arms} fill="none" stroke="#22313a" strokeWidth="3.5" strokeLinecap="square"/>
  <path d={arms} fill="none" stroke="#89634c" strokeWidth="1.5" strokeLinecap="square"/>
  <path d="M-5-25H5v2h4v3h3v4h2v8h-2v4h-3v2h-4V0H-5v-2h-4v-2h-3v-4h-2v-8h2v-4h3v-3h4z" fill="#202c3a"/>
  <path d="M-5-23H5v2h4v2h2v4h1v6h-2v4H8v2H4v1h-8v-1h-4v-2h-2v-4h-2v-6h1v-4h2v-2h4z" fill="#a2c3db"/>
  <path d="M-5-23H3v2h4v3h2v8H8v3H6v2H2v1h-7v-1h-3v-2h-2v-3h-2v-5h1v-4h2v-2h4z" fill="#f2f7fa"/>
  <path d="M-4-40H4v1h3v2h2v3h1v5H9v3H7v2H4v1h-8v-1h-3v-2h-2v-3h-1v-5h1v-3h2v-2h3z" fill="#202c3a"/>
  <path d="M-4-38H4v1h3v3h1v5H7v2H5v2H-5v-2h-2v-2h-1v-5h1v-3h3z" fill="#a2c3db"/>
  <path d="M-4-38H3v1h3v3h1v5H5v2H2v1h-6v-1h-3v-2h-1v-5h1v-3h3z" fill="#f2f7fa"/>
  <path d="M-4-34h1.5v2H-4zM3-34h1.5v2H3zM-2.5-31H-1v1h2v-1h1.5v1.5H1v1h-2v-1h-1.5z" fill="#202c3a"/>
 </g>;
});

export function SnowmanArt({battle}:{battle:Battle}){
 const guardian=battle.snowman;
 if(!guardian)return null;
 const {time,encounter}=battle;
 const melt=meltProgress(guardian.expiresAt,time);
 const shot=guardian.snowball;
 const shotAge=shot?time-shot.started:Infinity;
 const pose=shotAge<.08?'flick':shotAge<.18?'followThrough':'idle';
 const target=shot&&battle.enemies.find(e=>e.id===shot.targetId&&e.hp>0);
 return <g pointerEvents="none" aria-label="Snowman guardian">
  <g transform={`translate(${guardian.x+BODY_OFFSET_X} ${GROUND_Y})`}>
   <ellipse rx={30+melt*16} ry={4+melt*3} cy="2" fill="#8ebdd8" opacity={.28+melt*.45}/>
   <g transform={`scale(1 ${1-melt*.9})`} opacity={1-melt}>
    <SnowmanBody pose={pose}/>
    {guardian.hurtUntil>time&&<path d="M47-50h10m-11-10 6-6m-5 24 6 6" fill="none" stroke="#f8f4ff" strokeWidth="3"/>}
   </g>
  </g>
  {shot&&target&&(()=>{
   const t=Math.max(0,Math.min(1,shotAge/SNOWBALL_FLIGHT_SECONDS));
   const fromX=shot.x+BODY_OFFSET_X+RELEASE_TIP.x*BODY_SCALE;
   const fromY=GROUND_Y+RELEASE_TIP.y*BODY_SCALE*(1-meltProgress(guardian.expiresAt,shot.started)*.9);
   const x=fromX+(target.x-fromX)*t;
   const y=fromY+(enemyY(target.id,encounter,target.lane)-18-fromY)*t-90*t*(1-t);
   return <g transform={`translate(${x} ${y}) scale(2)`} shapeRendering="crispEdges" aria-label="Snowball">
    <path d="M-6-4h2v-2h8v2h2v8H4v2h-8V4h-2z" fill="#516c90"/>
    <path d="M-3-4h6v2h2v5h-8v-2h-2v-3h2z" fill="#f1f9ff"/>
   </g>;
  })()}
 </g>;
}
