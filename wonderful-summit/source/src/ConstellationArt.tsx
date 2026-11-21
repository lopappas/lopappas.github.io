import React from 'react';
import {FILA_HAT_LAYERS} from './CharacterBodies';
import {CONSTELLATION_FLIGHT_SECONDS,constellationHatFrame} from './constellation';

const GOLD='#ffd884',PURPLE='#a869ed';
const SKY_X=360,BRUSH_X=282,BRUSH_Y=390;

const HAT_SCALE=8,HAT_CENTER_X=11,HAT_CENTER_Y=6;
const stars=[
 [9,1],[11,1],[12,1],[8,3],[10,3],[12,3],[14,3],
 [6,5],[8,5],[10,5],[12,5],[14,5],[16,5],
 [6,7],[8,7],[10,7],[12,7],[14,7],[16,7],
 [3,10],[5,10],[7,10],[9,10],[11,10],[13,10],[15,10],[17,10],[19,10],
];
const starColors=[GOLD,'#be97ff','#ffa9db','#92efe8','#fff3bb'];
const STAR='M0-6H2V-2H6V2H2V6H-2V2H-6V-2H-2V-6Z';

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
 if(age<0)return null;
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
 const {assembly,opacity}=constellationHatFrame(age-CONSTELLATION_FLIGHT_SECONDS);
 const assembling=assembly<1;
 const explosion=Math.min(1,assembly/.36);
 const gather=Math.max(0,(assembly-.28)/.72);
 const settle=gather*gather*(3-2*gather);
 return <g pointerEvents="none" aria-label="Filadora’s hat formed from fireworks"
  transform={`translate(${SKY_X} ${skyY})`} opacity={opacity} shapeRendering="crispEdges">
  {assembling&&<g aria-hidden="true" opacity={Math.min(1,(1-assembly)/.2)}>
   {stars.map(([hatX,hatY],index)=>{
    const angle=index*2.39996;
    const spread=(65+index%6*12)*explosion*(2-explosion);
    const x=Math.cos(angle)*spread*(1-settle)+(hatX-HAT_CENTER_X)*HAT_SCALE*settle;
    const y=Math.sin(angle)*spread*.64*(1-settle)+(hatY-HAT_CENTER_Y)*HAT_SCALE*settle;
    return <path key={index} d={STAR} transform={`translate(${x} ${y})`} fill={starColors[index%starColors.length]}/>;
   })}
  </g>}
  <g transform={`scale(${HAT_SCALE}) translate(${-HAT_CENTER_X} ${-HAT_CENTER_Y})`} opacity={Math.max(0,(assembly-.47)/.53)}>
   {FILA_HAT_LAYERS.map(path=><path key={path.fill} {...path}/>)}
  </g>
 </g>;
}
