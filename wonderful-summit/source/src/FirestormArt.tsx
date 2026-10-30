import React from 'react';
import type {Firestorm} from './firestorm';
import {grayPaint} from './PaletteGroup';

// Battle-clock animation stays in sync when the tab or a tutorial is paused.
export function FirestormArt({storm,time,gray=0}:{storm:Firestorm|null;time:number;gray?:number}){
 if(!storm)return null;
 const age=time-storm.started,arrival=Math.min(1,Math.max(0,age/2)),ease=1-(1-arrival)**3;
 const end=storm.portions.at(-1)!.until,opacity=Math.min(1,age/.3,Math.max(0,(end-time)/.3));
 const paint=(c:string)=>grayPaint(c,gray) as string;
 const rainAge=time-storm.rainAt;
 return <g pointerEvents="none" opacity={opacity} aria-label={rainAge<0?'Dark red storm clouds rolling in':'Firestorm raining fire across the enemy field'}>
  {rainAge>=0&&<g>{Array.from({length:42},(_,i)=>{
   const cycle=.65+(i%5)*.09,offset=(i*.197)%cycle,elapsed=rainAge-offset;
   if(elapsed<0)return null;
   const t=(elapsed%cycle)/cycle,x=342+(i*67)%353,y=290+t*205;
   return <g key={i} transform={`translate(${x} ${y})`} opacity={Math.min(1,t*7,(1-t)*8)}>
    <path d="M0-13 5-4 5 4 0 8-5 4-5-4z" fill={paint(i%3?'#ef8c58':'#ffb365')}/>
    <path d="M0-4 2 1 0 5-2 1z" fill={paint('#ffe6a0')}/>
    <path d="M0-19v-6" stroke={paint('#f27859')} strokeWidth="2" opacity=".4"/>
   </g>;
  })}</g>}
  <g transform={`translate(${(1-ease)*420} 0)`} shapeRendering="crispEdges">
   {[0,1,2].map(i=><g key={i} transform={`translate(${390+i*119} ${254+(i%2)*-13+Math.sin(age*1.4+i)*3})`}>
    <path d="M-67 17V-1h10v-17h19v-13h34v-8h28v14h22v12h18v14h12v25H-55v-7z" fill={paint('#36343c')}/>
    <path d="M-55 9V-4h18v-14H-3v-8h25v14h22v12h18v15H-43v-6z" fill={paint('#594147')}/>
    <path d="M-43 16h91v8H-43zM-27 4h36v7h-36zM21 9h25v7H21z" fill={paint('#91504a')} opacity=".7"/>
    <path d="M-35-14h21v-5h16v6h-12v6h-25z" fill={paint('#76616a')} opacity=".5"/>
   </g>)}
  </g>
 </g>;
}
