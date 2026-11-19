import React,{memo,useMemo} from 'react';
import {decorativeTime} from './visualCadence';
import type {Firestorm} from './firestorm';
import {grayPaint} from './PaletteGroup';

const RAIN=Array.from({length:41},(_,i)=>{const cycle=.65+(i%5)*.09;return{i,cycle,offset:(i*.197)%cycle,x:342+(i*67)%353};});
const CLOUDS=[0,1,2];
const FIRE_RAIN_FPS=60;
// Full-rate state controls presence and rain onset; only decorative motion is sampled.
export function FirestormArt({storm,time,gray=0,cloudY=210}:{storm:Firestorm|null;time:number;gray?:number;cloudY?:number}){
 if(!storm)return null;
 return <FirestormFrame started={storm.started} rainAt={storm.rainAt} end={storm.portions.at(-1)!.until} raining={time>=storm.rainAt} time={time} gray={gray} cloudY={cloudY}/>;
}
export const FirestormFrame=memo(function FirestormFrame({started,rainAt,end,raining,time,gray,cloudY}:{started:number;rainAt:number;end:number;raining:boolean;time:number;gray:number;cloudY:number}){
 const age=time-started,arrival=Math.min(1,Math.max(0,age/2)),ease=1-(1-arrival)**3;
 const opacity=Math.min(1,age/.3,Math.max(0,(end-time)/.3));
 return <g pointerEvents="none" opacity={opacity} aria-label={raining?'Firestorm raining fire across the enemy field':'Dark red storm clouds rolling in'}>
  <FirestormRain raining={raining} rainAt={rainAt} time={Math.max(rainAt,decorativeTime(time,FIRE_RAIN_FPS))} gray={gray} cloudY={cloudY}/>
  <g transform={`translate(${(1-ease)*420} 0)`} shapeRendering="crispEdges">
   {CLOUDS.map(i=><g key={i} transform={`translate(${390+i*119} ${cloudY+(i%2)*-13+Math.sin(age*1.4+i)*3})`}>
    <StormCloud gray={gray}/>
   </g>)}
  </g>
 </g>;
});

const StormCloud=memo(function StormCloud({gray}:{gray:number}){const paint=(c:string)=>grayPaint(c,gray) as string;return <>
    <path d="M-67 17V-1h10v-17h19v-13h34v-8h28v14h22v12h18v14h12v25H-55v-7z" fill={paint('#36343c')}/>
    <path d="M-55 9V-4h18v-14H-3v-8h25v14h22v12h18v15H-43v-6z" fill={paint('#594147')}/>
    <path d="M-43 16h91v8H-43zM-27 4h36v7h-36zM21 9h25v7H21z" fill={paint('#91504a')} opacity=".7"/>
    <path d="M-35-14h21v-5h16v6h-12v6h-25z" fill={paint('#76616a')} opacity=".5"/>
</>;});

/** Rain samples the battle clock at 60 Hz. */
export const FirestormRain=memo(function FirestormRain({raining,rainAt,time,gray,cloudY}:{raining:boolean;rainAt:number;time:number;gray:number;cloudY:number}){
 const rainShapes=useMemo(()=>RAIN.map(({i})=><>
  <path d="M0-7v12" stroke={grayPaint(i%3?'#ef8c58':'#ffb365',gray) as string} strokeWidth="2.5" strokeLinecap="round"/>
  <path d="M0-2v5" stroke={grayPaint('#ffe6a0',gray) as string} strokeWidth="1" strokeLinecap="round"/>
 </>),[gray]);
 if(!raining)return null;
 const rainAge=Math.max(0,time-rainAt);
 return <g>{RAIN.map(({i,cycle,offset,x})=>{
   const elapsed=rainAge-offset;
   if(elapsed<0)return null;
   const t=(elapsed%cycle)/cycle,y=cloudY+28+t*(495-cloudY-28);
   return <g key={i} transform={`translate(${x} ${y})`} opacity={Math.min(1,t*7,(1-t)*8)}>
    {rainShapes[i]}
   </g>;
  })}</g>;
});
