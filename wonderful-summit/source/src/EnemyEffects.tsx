import React from 'react';
import {PaletteGroup} from './PaletteGroup';
import type {Enemy} from './battle';

/** Follow combat time so effects stop naturally while the game is paused. */
export function EnemyEffects({enemy,time}:{enemy:Enemy;time:number}){
 const rooted=enemy.rootUntil>time,growth=Math.min(1,Math.max(0,(1.5-enemy.rootUntil+time)/.25));
 return <PaletteGroup pointerEvents="none">

  {enemy.curseTick!==null&&<g aria-label="Cursed enemy" opacity=".8"><ellipse cy="19" rx="34" ry="7" fill="none" stroke="#b393d9" strokeWidth="3" strokeDasharray="9 7"/><path d="m-23-40 4-7 4 7-4 7zM20-55l4-7 4 7-4 7z" fill="#b393d9"/></g>}
  {enemy.burn&&<g aria-label="Burning enemy">{Array.from({length:7},(_,i)=>{
   const t=(time*.95+i/7)%1,x=-25+i*8+Math.sin(t*6+i)*5,y=12-t*70;
   return <g key={i} transform={`translate(${x} ${y}) scale(${1-t*.65})`} opacity={Math.sin(t*Math.PI)*.95}>
    <path d="M0 5h-4V0h-2v-5h3v-6h3v4h3v4h2v6H0z" fill={i%2?'#f4a452':'#ee7547'}/>
    <path d="M-2 3v-5h3v5z" fill="#ffe2a0"/>
   </g>;
  })}</g>}
  {rooted&&<g aria-label="Trapped in roots" transform={`translate(0 20) scale(1 ${growth})`}>
   <path d="M-42 6q17-9 22-24l7-11M-20-18l-12-3M-17-25l3-10M42 6q-17-9-22-24l-7-11M20-18l12-3M17-25l-3-10M-28 5q12-15 28-11T28 5M-33 1q16-7 28 2t34-2" fill="none" stroke="#354b32" strokeWidth="7" strokeLinecap="round"/>
   <path d="M-42 5q17-9 22-24l7-11M42 5q-17-9-22-24l-7-11M-28 4q12-15 28-11T28 4M-33 0q16-7 28 2t34-2" fill="none" stroke="#a3b873" strokeWidth="3" strokeLinecap="round"/>
   <path d="M-25-18q-12-13-14-2 4 7 14 2M25-18q12-13 14-2-4 7-14 2" fill="#83ad67"/>
  </g>}
 </PaletteGroup>;
}
