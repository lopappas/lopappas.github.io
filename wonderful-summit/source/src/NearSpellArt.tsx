import React from 'react';
import {PaletteGroup} from './PaletteGroup';
import {CONTACT_X,type Battle} from './battle';
import {FILA_FOOT_Y} from './combatLanes';
const PUDDLE_BUBBLES=[[-8,.04,.25],[-4,.28,.29],[2,.6,.24],[6,.12,.32],[9,.48,.27],[-1,.81,.3]];

export function NearSpellArt({battle,gray}:{battle:Battle;gray:number}){
 const {time,puddle,puddleBurst,thistle,flameSwing}=battle;
 const swing=flameSwing?Math.max(0,Math.min(1,(time-flameSwing.started)/.35)):1;
 const burst=puddleBurst?Math.max(0,Math.min(1,(time-puddleBurst.started)/.4)):1;
 const growth=thistle?1-(1-Math.max(0,Math.min(1,(time-thistle.started)/.5)))**3:0;
 return <PaletteGroup amount={gray}><g pointerEvents="none">
  {thistle&&<g aria-label="Thistle Bush, persistent thorny ground" opacity={Math.min(1,(thistle.budget-thistle.spent)/Math.max(1,thistle.budget*.12))}>
   <ellipse cx={CONTACT_X+thistle.range/2} cy={FILA_FOOT_Y+3} rx={thistle.range/2} ry="10" fill="#344e2d" opacity={.7*growth}/>
   {Array.from({length:Math.ceil(thistle.range/9)},(_,i)=><g key={i} transform={`translate(${CONTACT_X+4+i*9} ${FILA_FOOT_Y+i%2*3}) scale(1 ${growth})`}><path d="M-4 1 0-16 5-3 9-12" fill="none" stroke="#739a47" strokeWidth="4" strokeLinejoin="round"/><path d="M0-10-5-14M4-6 9-5" stroke="#cfdda1" strokeWidth="2"/></g>)}
  </g>}
  {puddle&&<g aria-label="Rapidly bubbling Puddle Guard" transform={`translate(${puddle.x} ${FILA_FOOT_Y}) scale(2.5)`}>
   <ellipse rx="12" ry="6" fill="#59b6cf" opacity=".8"/>
   <ellipse cx="-1" cy="-1" rx={7+Math.sin(time*23)} ry="3" fill="none" stroke="#c5f0f7" strokeWidth=".7"/>
   {PUDDLE_BUBBLES.map(([x,offset,period],i)=>{
    const phase=(time/period+offset)%1,y=i%2-8*phase;
    return <g key={i} opacity={1-phase}>
     <circle cx={x} cy={y} r={.65+phase*.85} fill="#b5ebf3" stroke="#f5feff" strokeWidth=".45"/>
     <circle cx={x-.35} cy={y-.35} r=".3" fill="#fff"/>
    </g>;
   })}
  </g>}
  {puddleBurst&&burst<1&&<g aria-label="Puddle Guard bursting" opacity={1-burst}>{Array.from({length:9},(_,i)=><ellipse key={i} cx={puddleBurst.x+(i-4)*burst*7} cy={FILA_FOOT_Y-Math.sin(i/8*Math.PI)*burst*60+burst*burst*20} rx="2.5" ry="4" fill="#9cdeee"/>)}</g>}
  {flameSwing&&swing<1&&<g aria-label="Flame Blade sword swing" opacity={Math.min(1,(1-swing)*4)} transform={`translate(${CONTACT_X} ${FILA_FOOT_Y-35}) rotate(${-65+swing*125}) scale(2.2 1)`}>
   <path d="M10-7Q40-20 52-4L43 7Q30 18 10 7Z" fill="#ec6d2d" opacity=".45"/>
   <path d="M11-4 43-4 50 0 43 4 11 4Z" fill="#ffad4d" stroke="#e95429" strokeWidth="2"/>
   <path d="M12 0H45" stroke="#fff0ab" strokeWidth="2"/><path d="M10-10V10M0 0H10" stroke="#c65727" strokeWidth="4"/>
  </g>}
 </g></PaletteGroup>;
}
