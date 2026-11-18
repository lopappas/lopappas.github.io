import React,{memo} from 'react';
import {enemyY,type Battle} from './battle';
import {SNOWBALL_FLIGHT_SECONDS,SNOWMAN_MELT_SECONDS} from './snowman';

const GROUND_Y=440;
// Entity x marks the contact point. Place the sprite just left of it so both sides are visible.
const BODY_OFFSET_X=-44;
const FIST_X=38,FIST_Y=-75;

const SnowmanBody=memo(function SnowmanBody(){
 return <g shapeRendering="crispEdges">
  {/* A resting slime is 56 world units tall. The guardian silhouette is 168. */}
  <path d="M-21-123H21v6h15v9h10v14h6v36h-8v12h-8v24h-7v13H17V0h-34v-9h-12v-13h-7v-24h-8v-12h-8v-36h6v-14h10v-9h15z" fill="#314757"/>
  <path d="M-18-117H18v6h15v10h9v12h4v27h-9v12h-8v25h-6v12H13v7h-26v-7h-10v-12h-6v-25h-8v-12h-9v-27h4v-12h9v-10h15z" fill="#a5bcc9"/>
  <path d="M-18-117H14v6h16v10h8v14h-9v12H18v16h-6v34h-9v10h-16v-6h-10v-12h-6v-22h-7v-16h-9v-18h4v-12h8v-10h15z" fill="#edf5f5"/>
  <path d="M-39-84h15v6h8v17h-6v7h-17v-6h-8v-18h8zM28-86h18v6h7v19h-7v7H29v-6h-8v-19h7z" fill="#314757"/>
  <path d="M-39-78h13v5h5v10h-18v-5h-4v-6h4zM29-80h15v5h5v10h-20v-5h-4v-5h4z" fill="#d8e7eb"/>
  <path d="M-13-168H13v5h10v8h7v28h-7v9H13v5h-26v-5h-10v-9h-7v-28h7v-8h10z" fill="#314757"/>
  <path d="M-13-162H12v5h8v9h4v19h-7v7H8v4h-18v-4h-10v-8h-5v-21h6v-7h6z" fill="#f0f6f6"/>
  <path d="M17-155h3v7h4v19h-7v7H8v4h-18v-4H6v-5h8v-13h3z" fill="#beced7"/>
  <path d="M-17-146h9v4h6v5h-12v-4h-3zM8-142h6v-4h8v5h-4v4H8zM-1-128h11v3H-1z" fill="#314757"/>
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
   <ellipse rx={30+melt*16} ry={4+melt*3} cy="2" fill="#8ebdd8" opacity={.28+melt*.45}/>
   <g transform={`scale(1 ${1-melt*.9})`} opacity={1-melt}>
    <SnowmanBody/>
    {guardian.hurtUntil>time&&<path d="M47-103h10m-11-10 6-6m-5 24 6 6" fill="none" stroke="#f8f4ff" strokeWidth="3"/>}
   </g>
  </g>
  {shot&&target&&(()=>{
   const t=Math.max(0,Math.min(1,(time-shot.started)/SNOWBALL_FLIGHT_SECONDS));
   const fromX=shot.x+BODY_OFFSET_X+FIST_X;
   const fromY=GROUND_Y+FIST_Y;
   const x=fromX+(target.x-fromX)*t;
   const y=fromY+(enemyY(target.id,encounter)-18-fromY)*t-90*t*(1-t);
   return <g transform={`translate(${x} ${y})`} shapeRendering="crispEdges" aria-label="Snowball">
    <path d="M-6-4h2v-2h8v2h2v8H4v2h-8V4h-2z" fill="#516c90"/>
    <path d="M-3-4h6v2h2v5h-8v-2h-2v-3h2z" fill="#f1f9ff"/>
   </g>;
  })()}
 </g>;
}
