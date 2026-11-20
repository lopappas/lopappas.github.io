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

const ShroomyBody=memo(function ShroomyBody(){
 return <g shapeRendering="crispEdges">
  <path d="M-20 0h4v-2h5v-2h22v2h6v2h4v2h-41zm-6-1h3v2h-3zm49-1h3v2h-3z" fill="#745039"/>
  <path d="M-9-21H9V0H-9z" fill="#512d27"/>
  <path d="M-7-20H7v19H-7z" fill="#dab385"/>
  <path d="M-4-16H3v3h2v12H-5v-12h1z" fill="#ffdfad"/>
  <path d="M-26-22v-7h2v-4h3v-4h4v-4h5v-2h5v-2H7v2h5v2h5v4h4v4h3v4h2v7h-3v3h-5v3h-36v-3h-5v-3z" fill="#4e2827"/>
  <path d="M-24-23v-5h2v-4h3v-4h4v-4h5v-2h5v-1H5v1h5v2h5v4h4v4h3v4h2v5h-3v3h-5v2h-32v-2h-5v-3z" fill="#cf392f"/>
  <path d="M-23-27h4v4h6v2h27v-2h5v-4h4v4h-2v3h-5v2h-32v-2h-5v-3h-2z" fill="#a82e2b"/>
  <path d="M-19-33h3v-3h4v2h3v6h-3v2h-7v-2h-2v-3h2zm6-6h3v-2h4v4h-2v2h-4v-2h-1zm20-4h4v2h4v4h2v4h-3v2h-6v-2H5v-6h2zm14 11h2v4h1v3h-4v2h-3v-2h-2v-5h3v-2z" fill="#fff0c8"/>
  <path d="M-6-38h3v10h-3zm9 0h3v10H3z" fill="#43262c"/>
 </g>;
});

export function ShroomyArt({battle}:{battle:Battle}){
 const shroomy=battle.shroomy;
 if(!shroomy)return null;
 const x=shroomy.x+BODY_OFFSET_X;
 const puffing=!!shroomy.shot&&battle.time-shroomy.shot.started<.13;
 return <g transform={`translate(${x} ${GROUND_Y}) scale(${BODY_SCALE})`} pointerEvents="none" aria-label="Shroomy guardian">
  <ellipse rx="24" ry="4" fill="#203d32" opacity=".35"/>
  <g transform={puffing?'scale(1.08 .96)':undefined} opacity={shroomy.hurtUntil>battle.time?.75:1}>
   <ShroomyBody/>
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
