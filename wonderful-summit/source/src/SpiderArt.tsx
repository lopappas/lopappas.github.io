import React,{memo} from 'react';
import {SpiderBody} from './CharacterBodies';
import {sameSpiderPose} from './spiderPose';

export const SpiderArt=memo(function SpiderArt({color,clock,moving}:{color:string;clock:number;moving:boolean}){
 return <g shapeRendering="crispEdges" aria-label="Retro eight-legged spider">
  {[-1,1].flatMap(side=>Array.from({length:4},(_,i)=>{
   const step=moving?Math.sin(clock*18+i*Math.PI/2)*3:0;
   return <path key={`${side}-${i}`} d={`M${-12+i*8} ${side*5} L${-26+i*15} ${side*19} L${-34+i*20+step} ${side*26}`} fill="none" stroke="#293f38" strokeWidth="5" strokeLinejoin="miter"/>;
  }))}
  <SpiderBody color={color}/>
 </g>;
},sameSpiderPose);
