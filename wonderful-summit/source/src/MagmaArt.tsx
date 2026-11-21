import React from 'react';
import {FILA_FOOT_Y} from './combatLanes';
import type {Magma} from './eruption';

const EMBERS=[
 {x:-.69,y:.05,phase:0},{x:-.31,y:.43,phase:.3},{x:.05,y:-.55,phase:.65},
 {x:.52,y:.37,phase:.15},{x:.61,y:-.29,phase:.46},{x:-.53,y:-.37,phase:.8},
];

export function MagmaArt({pools,time}:{pools:Magma[];time:number}){
 return <g pointerEvents="none" aria-hidden="true">
  {pools.map((pool,index)=>{
   const age=time-pool.started;
   const cooling=Math.min(1,(pool.until-time)/.55);
   const burst=Math.max(0,1-age/.45);
   return <g key={`${pool.started}-${index}`} transform={`translate(${pool.x} ${FILA_FOOT_Y})`} opacity={.4+.6*cooling}>
    <ellipse rx={pool.radiusX} ry={pool.radiusY} fill="#662d38" stroke="#381e2a" strokeWidth="2"/>
    <ellipse rx={pool.radiusX*.91} ry={pool.radiusY*.84} fill="#ae4234"/>
    <path d="M-44 8 -34 8 -34 4 -14 4 -14 10 5 10 5 14 -23 14 -23 18 -44 18Z
      M-11-17H12v-4h18v4h11v6H17v4H-5v-5h-6Z
      M17 7h27v5h-7v8H26v-4h-9Z" fill="#fa7037" transform={`scale(${pool.radiusX/55} ${pool.radiusY/35})`}/>
    <g shapeRendering="crispEdges">
     {EMBERS.map(({x,y,phase},i)=>{
      const t=(age+phase)%1;
      return <rect key={i} x={x*pool.radiusX} y={y*pool.radiusY-18*t} width={i%2===0?4:3} height="3" fill="#ffcf73" opacity={1-t}/>;
     })}
     {burst>0&&<g transform={`translate(0 ${pool.impactY-FILA_FOOT_Y}) scale(${1+.35*(1-burst)})`} opacity={burst}>
      <path d="M-22 0v-6h8v-12h6v-10h5v-24h7v14h6v14h7v13h8V0Z" fill="#ed592e"/>
      <path d="M-12 0v-8h6v-15h6v-14h5v18h6v11h5V0Z" fill="#ffd16f"/>
      <path d="M-20-28h5v-5h-5zM15-38h5v-4h-5zM-10-54h4v-4h-4z" fill="#ffa953"/>
     </g>}
    </g>
   </g>;
  })}
 </g>;
}
