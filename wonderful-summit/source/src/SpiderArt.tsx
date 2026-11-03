import React from 'react';

export function SpiderArt({color,clock,moving}:{color:string;clock:number;moving:boolean}){
 return <g shapeRendering="crispEdges" aria-label="Retro eight-legged spider">
  {[-1,1].flatMap(side=>Array.from({length:4},(_,i)=>{
   const step=moving?Math.sin(clock*18+i*Math.PI/2)*3:0;
   return <path key={`${side}-${i}`} d={`M${-12+i*8} ${side*5} L${-26+i*15} ${side*19} L${-34+i*20+step} ${side*26}`} fill="none" stroke="#293f38" strokeWidth="5" strokeLinejoin="miter"/>;
  }))}
  <path d="M-4-15H14V-10H21V9H15V15H-4V10H-10V-9H-4Z" fill="#293f38"/>
  <path d="M0-11H12V-6H17V6H12V11H0V6H-5V-5H0Z" fill={color}/>
  <path d="M2-9H10V-5H2Z" fill="#e5e5be" opacity=".7"/>
  <path d="M-23-10H-9V-6H-5V7H-9V11H-23V7H-27V-6H-23Z" fill="#293f38"/>
  <path d="M-22-6H-11V6H-22Z" fill={color}/>
  <path d="M-24-5H-20V-1H-24ZM-24 3H-20V7H-24Z" fill="#fff3c6"/>
  <path d="M-29-1H-25V2H-29ZM-30 6H-25V9H-30Z" fill="#c6b996"/>
 </g>;
}
