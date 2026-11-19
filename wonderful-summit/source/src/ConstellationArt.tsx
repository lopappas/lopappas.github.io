import React from 'react';
import {CONSTELLATION_FLIGHT_SECONDS,CONSTELLATION_HAT_SECONDS} from './constellation';

const GOLD='#ffd884',PURPLE='#a869ed';
const SKY_X=360,BRUSH_X=282,BRUSH_Y=390;

function flightPoint(progress:number,skyY:number){
 const angle=progress*Math.PI*3.5;
 const radius=Math.sin(progress*Math.PI)*29;
 const lift=progress*progress*(3-2*progress);
 return{
  x:BRUSH_X+(SKY_X-BRUSH_X)*progress+radius*Math.cos(angle),
  y:BRUSH_Y+(skyY-BRUSH_Y)*lift+radius*Math.sin(angle)*.55,
 };
}

export function ConstellationArt({castAt,time,skyY}:{castAt:number;time:number;skyY:number}){
 const age=time-castAt;
 if(age<0||age>=CONSTELLATION_FLIGHT_SECONDS+CONSTELLATION_HAT_SECONDS)return null;
 if(age<CONSTELLATION_FLIGHT_SECONDS){
  const progress=age/CONSTELLATION_FLIGHT_SECONDS;
  const tip=flightPoint(progress,skyY);
  return <g pointerEvents="none" aria-label="Constellation firework rising">
   {Array.from({length:11},(_,index)=>{
    const p=flightPoint(Math.max(0,progress-(index+1)*.026),skyY);
    return <circle key={index} cx={p.x} cy={p.y} r={4.7-index*.32} fill={index%2===0?GOLD:PURPLE} opacity={(1-index/11)*.82}/>;
   })}
   <circle cx={tip.x} cy={tip.y} r="11" fill={PURPLE} opacity=".33"/>
   <circle cx={tip.x} cy={tip.y} r="5.5" fill={GOLD}/>
  </g>;
 }
 const burstAge=age-CONSTELLATION_FLIGHT_SECONDS;
 const burst=Math.min(1,burstAge/.55),radius=30+120*burst;
 const scale=.86+.14*Math.min(1,burstAge/.22);
 return <g pointerEvents="none" aria-label="Purple and gold witch hat firework"
  transform={`translate(${SKY_X} ${skyY})`} opacity={Math.max(0,1-burstAge/CONSTELLATION_HAT_SECONDS)}>
  {burst<1&&Array.from({length:14},(_,index)=>{
   const angle=index*Math.PI/7,x=radius*Math.cos(angle),y=radius*.62*Math.sin(angle);
   const color=index%3===0?PURPLE:GOLD;
   return <g key={index} transform={`translate(${x} ${y})`} opacity={1-burst}>
    <path d="M0-6 2-2 6 0 2 2 0 6-2 2-6 0-2-2Z" fill={color}/>
   </g>;
  })}
  <g transform={`scale(${scale})`} strokeLinejoin="round">
   <path d="M-52 24Q-30 16-23-6Q-12-34 14-57L36-68 24-46Q30-16 48 23Q10 35-52 24Z" fill="#7846c3" stroke={PURPLE} strokeWidth="4"/>
   <path d="M-42 15Q-2 27 39 12L47 24Q7 38-51 25Z" fill={GOLD}/>
   <path d="M-66 25Q-89 39-57 48Q-9 61 55 44Q81 37 78 25Q78 18 49 23Q8 37-40 24Q-57 21-66 25Z" fill="#59379d" stroke={GOLD} strokeWidth="4"/>
   <path d="M4-34 7-27 14-24 7-21 4-14 1-21-6-24 1-27Z" fill="#fff0ae"/>
   <path d="M-23 0-21 4-17 6-21 8-23 12-25 8-29 6-25 4Z" fill={GOLD}/>
   <circle cx="23" cy="-8" r="2.3" fill={GOLD}/>
  </g>
 </g>;
}
