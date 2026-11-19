import React,{memo} from 'react';
import {enemyArtY,type Battle} from './battle';
import {CENTER_LANE,COMBAT_LANE_Y,FILA_ART_SCALE,FILA_SPRITE_HEIGHT} from './combatLanes';
import {GUARDIAN_SHOT_FLIGHT_SECONDS,guardianStats} from './guardian';

const GROUND_Y=COMBAT_LANE_Y[CENTER_LANE];
const BODY_OFFSET_X=-67;
const FOOT_Y=2,ORIGINAL_HAT_TOP_Y=-105,HAT_BRIM_Y=-69;
const HAT_TOP_Y=HAT_BRIM_Y+(ORIGINAL_HAT_TOP_Y-HAT_BRIM_Y)*.75;
const BODY_SCALE=FILA_SPRITE_HEIGHT*FILA_ART_SCALE*.85/(FOOT_Y-ORIGINAL_HAT_TOP_Y);
const RELEASE_TIP={x:49,y:-49};
const LEFT_TWIG='M-24-24h-8v-4h-7v-5h-6v-4h-5';
const RIGHT_TWIG={
 idle:'M24-24h8v-4h7v-5h6v-4h5',
 flick:`M24-24h8v-6h6v-7h6v-6H${RELEASE_TIP.x}V${RELEASE_TIP.y}`,
 followThrough:'M24-24h9v3h8v-3h7v-4h5',
};
const COAL_SMILE=[[-12,-51],[-7,-48.5],[-1.5,-47],[4,-48.5],[9.5,-51]];

const SnowmanBody=memo(function SnowmanBody({pose}:{pose:keyof typeof RIGHT_TWIG}){
 const arms=LEFT_TWIG+RIGHT_TWIG[pose];
 return <g shapeRendering="crispEdges" transform={`scale(${BODY_SCALE}) translate(0 ${-FOOT_Y})`}>
  <path d={arms} fill="none" stroke="#382a27" strokeWidth="7"/>
  <path d={arms} fill="none" stroke="#97644c" strokeWidth="3.5"/>
  <path d="M-10-46h20v5h9v6h6v9h4v16h-4v8h-9v4h-32v-4h-9v-8h-4v-16h4v-9h6v-6h9z" fill="#334b68"/>
  <path d="M-12-39h24v4h8v9h4v16h-4v7h-39v-4h-5v-19h5v-9h7z" fill="#aaccdf"/>
  <path d="M-12-38h20v4h8v7h4v13h-4v6h-33v-4h-5v-14h5v-8h5z" fill="#e9f7ff"/>
  <path d="M-10-72h20v4h8v7h4v15h-5v7h-34v-7h-5v-15h4v-7h8z" fill="#334b68"/>
  <path d="M-10-67h20v4h7v7h3v9h-6v5h-27v-4h-5v-13h5v-5h3z" fill="#f4faff"/>
  <path d={`M-22 ${HAT_BRIM_Y}v-7h7V${HAT_TOP_Y+1}h3v-1h24v1h3V-76h7v7z`} fill="#233447"/>
  <path d={`M-9 ${HAT_TOP_Y+4}H9v3H-9zM-15-81h30v5h-30z`} fill="#6490a5"/>
  <path d="M-7-61h4v5h-4zm14 0h4v5h-4z" fill="#28354b"/>
  <path d="M3-55h12v3H9v3H3z" fill="#eb8652"/>
  <path d="M-17-54h5v3h-5zm32 0h4v3h-4z" fill="#e7aeb9"/>
  <g fill="#28354b" data-coal-smile="">
   {COAL_SMILE.map(([x,y])=><rect key={x} x={x} y={y} width="3" height="3"/>)}
  </g>
  <path d="M-19-44h6v3h28v-3h4v11H1v16h-11v-16h-9z" fill="#234d65"/>
  <path d="M-15-39h30v4h-30zm7 18h7v3h-7z" fill="#79aec3"/>
 </g>;
});

export function SnowmanArt({battle}:{battle:Battle}){
 const guardian=battle.snowman;
 if(!guardian)return null;
 const {time}=battle;
 const maxHP=guardianStats('snowman',guardian.quality,guardian.upgrade).hp;
 const healthFraction=Math.max(0,Math.min(1,guardian.hp/maxHP));
 const hatY=(HAT_TOP_Y-FOOT_Y)*BODY_SCALE;
 const shot=guardian.shot;
 const shotAge=shot?time-shot.started:Infinity;
 const pose=shotAge<.08?'flick':shotAge<.18?'followThrough':'idle';
 return <g pointerEvents="none" aria-label="Snowman guardian">
  <g transform={`translate(${guardian.x+BODY_OFFSET_X} ${GROUND_Y})`}>
   <ellipse rx="30" ry="4" fill="#8ebdd8" opacity=".28"/>
   <SnowmanBody pose={pose}/>
   {guardian.hurtUntil>time&&<path d="M47-50h10m-11-10 6-6m-5 24 6 6" fill="none" stroke="#f8f4ff" strokeWidth="3"/>}
   <g transform={`translate(0 ${hatY-12})`} role="meter" aria-label="Snowman health" aria-valuemin={0} aria-valuemax={maxHP} aria-valuenow={guardian.hp}>
    <rect x="-23" width="46" height="7" rx="2" fill="#233447" stroke="#dcecf7"/>
    <rect x="-21" y="2" width={42*healthFraction} height="3" rx="1" fill="#8be1f3"/>
   </g>
  </g>
 </g>;
}

export function SnowballArt({battle}:{battle:Battle}){
 const shot=battle.snowman?.shot;
 if(!shot)return null;
 const target=battle.enemies.find(e=>e.id===shot.targetId&&e.hp>0);
 if(!target)return null;
 const {time,encounter}=battle;
 const shotAge=time-shot.started;
 const t=Math.max(0,Math.min(1,shotAge/GUARDIAN_SHOT_FLIGHT_SECONDS));
 const fromX=shot.x+BODY_OFFSET_X+RELEASE_TIP.x*BODY_SCALE;
 const fromY=GROUND_Y+(RELEASE_TIP.y-FOOT_Y)*BODY_SCALE;
 const x=fromX+(target.x-fromX)*t;
 const y=fromY+(enemyArtY(target,encounter)-18-fromY)*t-90*t*(1-t);
 return <g transform={`translate(${x} ${y}) scale(2)`} pointerEvents="none" shapeRendering="crispEdges" aria-label="Snowball">
  <path d="M-6-4h2v-2h8v2h2v8H4v2h-8V4h-2z" fill="#516c90"/>
  <path d="M-3-4h6v2h2v5h-8v-2h-2v-3h2z" fill="#f1f9ff"/>
 </g>;
}
