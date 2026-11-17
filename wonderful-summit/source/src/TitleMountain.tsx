import React from 'react';
import bounds from './art/aurora-bounds.json';

// The blur is baked into these lossless layers; only their existing transforms/opacity animate.
const auroraLayers=[
 {color:'red',href:new URL('./art/aurora-red.webp',import.meta.url).href,...bounds.red},
 {color:'green',href:new URL('./art/aurora-green.webp',import.meta.url).href,...bounds.green},
 {color:'blue',href:new URL('./art/aurora-blue.webp',import.meta.url).href,...bounds.blue},
];

export function TitleMountain(){
 return <svg className="title-mountain" viewBox="0 0 360 300" aria-hidden="true">
  <AuroraSky/>
  <path d="M-40 300 175 25 400 300" fill="#779b8b"/>
  <path d="m175 25-54 69 36-13 22 18 13-31 33 23z" fill="#e0dfbe"/>
  <path d="M-40 300 45 172l110 128 95-121 150 121" fill="#446c54"/>
  <g className="summit-beacon"><circle cx="175" cy="25" r="34" fill="url(#summit-white)"/><circle cx="175" cy="25" r="9" fill="url(#summit-white)"/><path d="M175 16v18M166 25h18" stroke="#fff" strokeWidth="1" strokeLinecap="round" opacity=".55"/></g>
 </svg>;
}

export function AuroraSky(){return <>
  <defs><radialGradient id="summit-white"><stop stopColor="#fff" stopOpacity=".95"/><stop offset=".2" stopColor="#f8ffff" stopOpacity=".65"/><stop offset="1" stopColor="#fff" stopOpacity="0"/></radialGradient></defs>
  <g className="title-aurora">
   {auroraLayers.map(({color,href,x,y,width,height})=><g key={color} className={`aurora-ribbon aurora-${color}`}><image href={href} x={x} y={y} width={width} height={height} preserveAspectRatio="none"/></g>)}
  </g>
 </>;}
