import React,{memo} from 'react';
import {enemyArtY,type Battle} from './battle';
import {CENTER_LANE,COMBAT_LANE_Y} from './combatLanes';
import {GUARDIAN_FADE_SECONDS,GUARDIAN_SHOT_FLIGHT_SECONDS,guardianStats} from './guardian';

const GROUND_Y=COMBAT_LANE_Y[CENTER_LANE];
const BODY_SCALE=3.5;
const STEM_TOP=-22;
const MOUTH={x:7,y:-6};
const SPIT_SECONDS=.12;
const bob=(time:number)=>Math.sin(time*2*Math.PI/1.45)*3;

const ScorchyBody=memo(function ScorchyBody({spitting}:{spitting:boolean}){
 return <g shapeRendering="crispEdges">
  <path d="M-5-17h10v1h3v2h2v3h1v5h-1v3H8v2H5v1H-5v-1h-3v-2h-2v-3h-1v-5h1v-3h2v-2h3z" fill="#35221b"/>
  <path d="M-5-16H5v1h3v2h1v3h1v3H9v3H7v2H4v1h-8v-1h-3v-2h-2v-3h-1v-3h1v-3h2v-2h2z" fill="#f6721d"/>
  <path d="M-5-16h2v2h-2v2h-1v6h1v3h1v2h-2v-2h-1v-3h-1v-6h1v-2h2zm9 14h3v-2h2v-3h1v3H9v2H6v1H4z" fill="#b54a1b"/>
  <path d="M-4-22h5v1h2v2h1v3h-5v-3h-3z" fill="#35221b"/>
  <path d="M-3-21h4v1h1v3H0v-3h-3z" fill="#9c772c"/>
  <path d="M-3-14h1v1h1v1h1v1h1v2h-6v-2h1v-2h1zm8 0h1v1h1v2h1v2H3v-2h1v-2h1z" fill="#35221b"/>
  <path d="M-3-12h1v1h1v1h-3v-1h1zm8 0h1v1h1v1H4v-1h1z" fill="#ffdd58"/>
  <path d={spitting?'M-3-8h12v4H7v2H1v-1h-3v-2h-1z':'M-3-8h3v1h5v-1h4v3H7v2H5v1H0v-1h-2v-2h-1z'} fill="#35221b"/>
  <path d={spitting?'M4-6h5v2H4z':'M2-4h2v1h1v1H1v-1h1z'} fill={spitting?'#ffdd58':'#b54a1b'}/>
 </g>;
});

export function ScorchyArt({battle}:{battle:Battle}){
 const guardian=battle.scorchy;
 if(!guardian)return null;
 const {time,encounter}=battle;
 const shot=guardian.shot;
 const target=shot&&battle.enemies.find(enemy=>enemy.id===shot.targetId&&enemy.hp>0);
 const age=shot?time-shot.started:Infinity;
 const spitting=!!target&&age<SPIT_SECONDS;
 const separation=battle.snowman?Math.max(0,1-Math.abs(guardian.x-battle.snowman.x)/75):0;
 // Give Scorchy room to hover beside Snowman when both reach the same line.
 const offsetX=-59+36*separation;
 const hoverY=GROUND_Y-17-55*separation;
 const bodyX=guardian.x+offsetX,bodyY=hoverY+bob(time);
 const facing=target&&target.x<bodyX?-1:1;
 const opacity=guardian.expiresAt===null?1:Math.max(0,Math.min(1,(guardian.expiresAt-time)/GUARDIAN_FADE_SECONDS));
 const maxHP=guardianStats('scorchy',guardian.quality,guardian.upgrade).hp;
 const hpFraction=Math.max(0,Math.min(1,guardian.hp/maxHP));

 return <g pointerEvents="none" aria-label="Scorchy guardian">
  <ellipse cx={bodyX} cy={GROUND_Y-1} rx="25" ry="4" fill="#203d32" opacity={.30*opacity}/>
  <g transform={`translate(${bodyX} ${bodyY})`} opacity={opacity}>
   <g transform={`scale(${facing*BODY_SCALE} ${BODY_SCALE})`} opacity={guardian.hurtUntil>time?.78:1}>
    <ScorchyBody spitting={spitting}/>
   </g>
   <g transform={`translate(0 ${STEM_TOP*BODY_SCALE-12})`} role="meter" aria-label="Scorchy health" aria-valuemin={0} aria-valuemax={maxHP} aria-valuenow={guardian.hp}>
    <rect x="-23" width="46" height="7" rx="2" fill="#3d2623" stroke="#ffe2b2"/>
    <rect x="-21" y="2" width={42*hpFraction} height="3" rx="1" fill="#ff9f47"/>
   </g>
  </g>
  {shot&&target&&(()=>{
   const progress=Math.max(0,Math.min(1,age/GUARDIAN_SHOT_FLIGHT_SECONDS));
   const fromX=shot.x+offsetX+MOUTH.x*BODY_SCALE*facing;
   const fromY=hoverY+bob(shot.started)+MOUTH.y*BODY_SCALE;
   const x=fromX+(target.x-fromX)*progress;
   const y=fromY+(enemyArtY(target,encounter)-18-fromY)*progress-24*progress*(1-progress);
   return <g transform={`translate(${x} ${y}) scale(${facing*2} 2)`} shapeRendering="crispEdges" aria-label="Scorchy fireball">
    <path d="M-10 2h4v-2h-6v-2h7v-2h3v-2h7v2h3v3h2v4H8v2H4v1h-8V4h-6z" fill="#b94a24"/>
    <path d="M-7 0h5v-2h3v-2h4v2h3v4H6v2H0V2h-7z" fill="#ff9e21"/>
    <path d="M-2 0h3v-2h4v2h2v2H2V1h-4z" fill="#ffeb82"/>
   </g>;
  })()}
 </g>;
}
