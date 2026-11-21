import React from 'react';
import {FILA_FOOT_Y} from './combatLanes';
import {ERUPTION_WARNING_SECONDS,type EruptionWarning,type Magma} from './eruption';

const EMBERS=[
 {x:-.69,y:.05,phase:0},{x:-.31,y:.43,phase:.3},{x:.05,y:-.55,phase:.65},
 {x:.52,y:.37,phase:.15},{x:.61,y:-.29,phase:.46},{x:-.53,y:-.37,phase:.8},
];

export function EruptionArt({warnings,pools,time}:{warnings:EruptionWarning[];pools:Magma[];time:number}){
 return <g pointerEvents="none" aria-hidden="true">
  {warnings.map((warning,index)=><g key={`smoke-${warning.started}-${index}`} transform={`translate(${warning.x} ${warning.impactY})`} shapeRendering="crispEdges">
   <ellipse rx="13" ry="4" fill="#4f3c3b" opacity=".6"/>
   {[-.16,-.04,.09,.23].map((offset,i)=>{
    const age=(time-warning.started-offset)/ERUPTION_WARNING_SECONDS;
    if(age<0||age>=1)return null;
    const drift=age*(i%2===0?-12:14);
    return <g key={offset} transform={`translate(${drift} ${-5-47*age}) scale(${.55+age})`} opacity={.9*(1-age)}>
     <path d="M-13 3v-7h4v-5h10v-3h7v4h5v10H8v4H-7V3Z" fill="#51474d"/>
     <path d="M-8-4h6v-3h8v3h4v3H3v3h-8v-3h-3Z" fill="#a39799"/>
    </g>;
   })}
  </g>)}
  {pools.map((pool,index)=>{
   const burst=1-(time-pool.started)/.45;
   if(burst<=0)return null;
   return <g key={`burst-${pool.started}-${index}`} transform={`translate(${pool.x} ${pool.impactY}) scale(${1+.35*(1-burst)})`} opacity={burst} shapeRendering="crispEdges">
    <path d="M-22 0v-6h8v-12h6v-10h5v-24h7v14h6v14h7v13h8V0Z" fill="#ed592e"/>
    <path d="M-12 0v-8h6v-15h6v-14h5v18h6v11h5V0Z" fill="#ffd16f"/>
    <path d="M-20-28h5v-5h-5zM15-38h5v-4h-5zM-10-54h4v-4h-4z" fill="#ffa953"/>
   </g>;
  })}
 </g>;
}

export function MagmaArt({pools,time}:{pools:Magma[];time:number}){
 return <g pointerEvents="none" aria-hidden="true">
  {pools.map((pool,index)=>{
   const age=time-pool.started;
   const cooling=Math.min(1,(pool.until-time)/.55);
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

    </g>
   </g>;
  })}
 </g>;
}
