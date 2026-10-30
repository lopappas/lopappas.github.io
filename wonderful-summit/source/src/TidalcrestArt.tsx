import React from 'react';
import {tidalWavePosition,type Battle} from './battle';
import {grayPaint} from './PaletteGroup';

export function TidalcrestArt({battle,gray=0}:{battle:Battle;gray?:number}){
 const paint=(c:string)=>grayPaint(c,gray) as string;
 return <g pointerEvents="none" aria-label="Tidalcrest waves sweeping the runway">
  {battle.tidalWaves.map(wave=>{
   const age=battle.time-wave.started,progress=Math.max(0,Math.min(1,age/wave.duration));
   const quality=(Math.max(48,Math.min(100,wave.quality))-48)/52,width=.85+.55*quality,height=.75+.35*quality;
   // Grow upward and backward from the waterline; the gameplay front stays at x=0.
   return <g key={wave.id} transform={`translate(${tidalWavePosition(wave,battle.time)} 493)`} opacity={Math.min(1,age/.08,(1-progress)/.08)}>
    <g transform={`scale(${width} ${height}) translate(0 -68)`}>
     <path d="M-170 68C-140 50-119 16-110-18C-103-51-85-80-54-88C-22-98 10-82 0-55C-8-32-34-30-47-48C-25-42-16-58-29-66C-49-79-67-56-57-29C-44 5-9 20 0 45V68Z" fill={paint('#378fac')} opacity=".92"/>
     <path d="M-155 65C-127 42-109 10-101-20C-90-57-70-77-47-76C-64-66-72-44-58-18C-42 15-15 29-4 63Z" fill={paint('#69c9d8')} opacity=".8"/>
     <path d="M-134 64C-100 38-91 7-84-17C-80 11-58 36-29 63Z" fill={paint('#9ce2e5')} opacity=".45"/>
     <path d="M-106-31C-93-67-75-84-52-88C-23-97 8-80-3-56C-11-38-31-35-43-47" stroke={paint('#e2f7e9')} strokeWidth="8" strokeLinecap="round" fill="none"/>
     <path d="M-146 55C-119 33-106 10-101-8M-114 58C-90 39-78 20-74 7M-60 57Q-36 45-19 55" stroke={paint('#b5e9e7')} strokeWidth="4" strokeLinecap="round" fill="none" opacity=".85"/>
     {[0,1,2,3,4,5].map(i=><rect key={i} x={-164+i*27} y={59+(i%2)*5} width="13" height="5" fill={paint('#e2f7e9')} opacity={.85-i*.07}/>)}
     <g fill={paint('#e2f7e9')} opacity=".85"><rect x="-77" y="-98" width="7" height="5"/><rect x="-40" y="-104" width="6" height="6"/><rect x="-4" y="-89" width="7" height="5"/></g>
    </g>
   </g>;
  })}
 </g>;
}
