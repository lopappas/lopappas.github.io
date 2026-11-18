import React,{memo} from 'react';
import {enemyY,type Battle} from './battle';
import {SNOWBALL_FLIGHT_SECONDS,SNOWMAN_MELT_SECONDS} from './snowman';

const GROUND_Y=420;
// Entity x marks the contact point. Place the sprite just left of it so both sides are visible.
const BODY_OFFSET_X=-34;

const SnowmanBody=memo(function SnowmanBody(){
 return <g shapeRendering="crispEdges">
  <path d="M-20-25h-7v-3h-6v-4h-6v-5h-4m64 11h6v-4h6v-6h6v-4h4" fill="none" stroke="#6f4536" strokeWidth="4"/>
  <path d="M-10-46h20v5h9v6h6v9h4v16h-4v8h-9v4h-32v-4h-9v-8h-4v-16h4v-9h6v-6h9z" fill="#334b68"/>
  <path d="M-12-39h24v4h8v9h4v16h-4v7h-39v-4h-5v-19h5v-9h7z" fill="#aaccdf"/>
  <path d="M-12-38h20v4h8v7h4v13h-4v6h-33v-4h-5v-14h5v-8h5z" fill="#e9f7ff"/>
  <path d="M-10-72h20v4h8v7h4v15h-5v7h-34v-7h-5v-15h4v-7h8z" fill="#334b68"/>
  <path d="M-10-67h20v4h7v7h3v9h-6v5h-27v-4h-5v-13h5v-5h3z" fill="#f4faff"/>
  <path d="M-20-69v-6h7v-13h26v4h4v9h6v6z" fill="#29384e"/>
  <path d="M-9-85h16v3h-16z" fill="#5a7689"/>
  <path d="M-13-76h30v4h-30z" fill="#bf484a"/>
  <path d="M-7-61h4v5h-4zm14 0h4v5h-4zm-9 30h4v4h-4zm0 11h4v4h-4z" fill="#28354b"/>
  <path d="M3-55h12v3H9v3H3z" fill="#eb8652"/>
  <path d="M-15-53h5v3h-5zm26 2h5v3h-5z" fill="#f5b0b8"/>
  <path d="M-5-49h3v2h6v-2h3v3H-5z" fill="#28354b"/>
  <path d="M-19-44h6v3h28v-3h4v10H3v18h-9v-18h-13z" fill="#be4248"/>
  <path d="M-10-39h23v3h-23zm6 17h6v3h-6z" fill="#f58a80"/>
 </g>;
});

export function SnowmanArt({battle}:{battle:Battle}){
 const guardian=battle.snowman;
 if(!guardian)return null;
 const {time,encounter}=battle;
 const remaining=guardian.expiresAt===null?Infinity:guardian.expiresAt-time;
 const melt=Math.max(0,1-remaining/SNOWMAN_MELT_SECONDS);
 const shot=guardian.snowball;
 const target=shot&&battle.enemies.find(e=>e.id===shot.targetId&&e.hp>0);
 return <g pointerEvents="none" aria-label="Snowman guardian">
  <g transform={`translate(${guardian.x+BODY_OFFSET_X} ${GROUND_Y})`}>
   <ellipse rx={23+melt*12} ry={3+melt*3} cy="2" fill="#8ebdd8" opacity={.28+melt*.45}/>
   <g transform={`scale(1 ${1-melt*.9})`} opacity={1-melt}>
    <SnowmanBody/>
    {guardian.hurtUntil>time&&<path d="M-34-54h-7m12-10-5-5m6 26-5 5" fill="none" stroke="#f8f4ff" strokeWidth="3"/>}
   </g>
  </g>
  {shot&&target&&(()=>{
   const t=Math.max(0,Math.min(1,(time-shot.started)/SNOWBALL_FLIGHT_SECONDS));
   const fromX=shot.x+BODY_OFFSET_X+14;
   const x=fromX+(target.x-fromX)*t;
   const y=GROUND_Y-54+(enemyY(target.id,encounter)-GROUND_Y+36)*t-90*t*(1-t);
   return <g transform={`translate(${x} ${y})`} shapeRendering="crispEdges" aria-label="Snowball">
    <path d="M-6-4h2v-2h8v2h2v8H4v2h-8V4h-2z" fill="#516c90"/>
    <path d="M-3-4h6v2h2v5h-8v-2h-2v-3h2z" fill="#f1f9ff"/>
   </g>;
  })()}
 </g>;
}
