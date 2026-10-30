import React from 'react';
import {tidalWavePosition,type Battle} from './battle';
import {grayPaint} from './PaletteGroup';

export function TidalcrestArt({battle,gray=0}:{battle:Battle;gray?:number}){
 const paint=(c:string)=>grayPaint(c,gray) as string;
 return <g pointerEvents="none" aria-label="Tidalcrest waves sweeping the runway">
  {battle.tidalWaves.map(wave=>{
   const age=battle.time-wave.started,progress=Math.max(0,Math.min(1,age/wave.duration));
   return <g key={wave.id} transform={`translate(${tidalWavePosition(wave,battle.time)} 425)`} opacity={Math.min(1,age/.08,(1-progress)/.08)}>
    <path d="M-68 68Q-28 31-32-12Q-42-53-14-87Q-1-103 13-95Q-12-92-9-70Q3-48 2-19L2 68Z" fill={paint('#58b3ce')} opacity=".82"/>
    <path d="M-67 64Q-23 37-25-7Q-34-51-13-78Q-15-51-1-30L1 65Z" fill={paint('#8bd9e1')} opacity=".48"/>
    <path d="M-55 57Q-17 24-22-9M-13-86Q-7-99 9-95M-29-52l-4 11M-38 35l-7 10" stroke={paint('#e2f7e9')} strokeWidth="4" strokeLinecap="round" fill="none"/>
    {[0,1,2,3].map(i=><rect key={i} x={-48-i*9} y={39+i*7} width="8" height="4" fill={paint('#b5e9e7')} opacity={.65-i*.1}/>)}
   </g>;
  })}
 </g>;
}
