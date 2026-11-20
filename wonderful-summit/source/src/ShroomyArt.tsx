import React,{memo} from 'react';
import {enemyArtY,type Battle,type Enemy} from './battle';
import {CENTER_LANE,COMBAT_LANE_Y} from './combatLanes';
import {GUARDIAN_SHOT_FLIGHT_SECONDS} from './guardian';
import {decorativeTime} from './visualCadence';

const GROUND_Y=COMBAT_LANE_Y[CENTER_LANE];
const BODY_OFFSET_X=-25;
const BODY_SCALE=1.1;
const SPORE_COLORS=['#e65a64','#fff4cf'];
const PARTICLE_ANGLES=Array.from({length:12},(_,index)=>index*Math.PI*(3-Math.sqrt(5)));

const ShroomyBody=memo(function ShroomyBody({puffing}:{puffing:boolean}){
 return <g shapeRendering="crispEdges">
  <path d="M-8-24H8v11h2v9H8v4H-8v-4h-2v-9h2z" fill="#4a302f"/>
  <path d="M-6-22H6v10h2v8H6v2H-6v-2h-2v-8h2z" fill="#f2d9ae"/>
  <path d="M3-19h3v8h2v7H6v2H3z" fill="#c9a47e"/>
  <path d="M-24-24v-8h4v-8h6v-5h8v-4H6v4h8v5h6v8h4v8h-5v4h-38v-4z" fill="#48252c"/>
  <path d="M-21-25v-7h4v-7h6v-5h7v-2h8v2h7v5h6v7h4v7h-4v2h-34v-2z" fill="#d9505b"/>
  <path d="M-20-30h4v4h32v-4h4v5h-4v2h-32v-2h-4z" fill="#9b334b"/>
  <path d="M-12-40h6v5h-6zm13-4h6v4H1zm10 9h6v4h-6z" fill="#fff0c8"/>
  <path d={puffing?'M-4-32h3v4h-3zm5 0h3v4H1z':'M-4-33h2v5h-2zm6 0h2v5H2z'} fill="#43262c"/>
 </g>;
});

export function ShroomyArt({battle}:{battle:Battle}){
 const shroomy=battle.shroomy;
 if(!shroomy)return null;
 const x=shroomy.x+BODY_OFFSET_X;
 const puffing=!!shroomy.shot&&battle.time-shroomy.shot.started<.13;
 return <g transform={`translate(${x} ${GROUND_Y}) scale(${BODY_SCALE})`} pointerEvents="none" aria-label="Shroomy guardian">
  <ellipse rx="24" ry="4" fill="#203d32" opacity=".35"/>
  <g transform={puffing?'translate(0 -2) scale(1.08 .96)':undefined} opacity={shroomy.hurtUntil>battle.time?.75:1}>
   <ShroomyBody puffing={puffing}/>
  </g>
 </g>;
}

export function ShroomyShotArt({battle}:{battle:Battle}){
 const shot=battle.shroomy?.shot;
 if(!shot)return null;
 const target=battle.enemies.find(enemy=>enemy.id===shot.targetId&&enemy.hp>0);
 if(!target)return null;
 const progress=Math.max(0,Math.min(1,(battle.time-shot.started)/GUARDIAN_SHOT_FLIGHT_SECONDS));
 const startX=shot.x+BODY_OFFSET_X,startY=GROUND_Y-32*BODY_SCALE;
 const x=startX+(target.x-startX)*progress;
 const y=startY+(enemyArtY(target,battle.encounter)-13-startY)*progress-70*progress*(1-progress);
 return <g transform={`translate(${x} ${y})`} pointerEvents="none" aria-label="Shroomy spore shot">
  <circle r="6" fill="#a2354a" stroke={SPORE_COLORS[1]} strokeWidth="2"/>
  <circle cx="-1" cy="-1" r="2.5" fill={SPORE_COLORS[0]}/>
 </g>;
}

const SporeParticles=memo(function SporeParticles({count,time,radius}:{count:number;time:number;radius:number}){
 return <g pointerEvents="none" aria-label={`${count} spore ${count===1?'stack':'stacks'}`}>
  {PARTICLE_ANGLES.slice(0,count*6).map((start,index)=>{
   const angle=start+time*(.9+index%3*.2);
   const x=Math.cos(angle)*(radius+index%3*4),y=-18+Math.sin(angle)*radius*.85;
   return <circle key={index} cx={x} cy={y} r={index%3===0?2.8:2} fill={SPORE_COLORS[index%2]} stroke="#713746" strokeWidth=".8"/>;
  })}
 </g>;
});

export function ShroomySporesArt({enemy,time}:{enemy:Enemy;time:number}){
 const count=enemy.spores?.length??0;
 if(!count)return null;
 return <SporeParticles count={count} time={decorativeTime(time)} radius={enemy.goblinKing||enemy.kind==='mother'?49:32}/>;
}
