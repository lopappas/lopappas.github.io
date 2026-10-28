import React from 'react';
import type {EnemyShield} from './shields';
import {SHIELD_BURN_SECONDS} from './shields';
import {PaletteGroup} from './PaletteGroup';
export function WoodenShieldArt({shield,time}:{shield:EnemyShield;time:number}){
 const burning=shield.burnUntil!==null,remaining=(shield.burnUntil??0)-time;
 return <PaletteGroup transform="translate(-34 -4)" aria-label={burning?'Wooden shield burning':'Wooden shield'} opacity={burning?Math.max(0,Math.min(1,remaining/.3)):1}>
  <g shapeRendering="crispEdges"><path d="M-18-24h36V9L0 28-18 9z" fill="#574332"/><path d="M-14-20h28V7L0 22-14 7z" fill={burning?'#8e5636':'#b28a54'}/><path d="M-5-20v36M5-20v36" stroke="#725034" strokeWidth="2"/><path d="M-14-8h28v5h-28zM-10 7h20v4h-20z" fill="#d0a56b"/><path d="M-10-15h3v2h-3zm17 0h3v2H7z" fill="#f0ce91"/></g>
  {burning&&[0,1,2,3,4].map(i=>{const t=((SHIELD_BURN_SECONDS-remaining)*1.5+i/5)%1;return <path key={i} d="M-5 4v-6h3v-8l5 5v4h3v5z" transform={`translate(${-14+i*7} ${8-t*47}) scale(${1-t*.5})`} fill={i%2?'#ffd275':'#ed864d'} opacity={Math.sin(t*Math.PI)}/>;})}
 </PaletteGroup>;
}
