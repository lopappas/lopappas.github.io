import React from 'react';
import {EventCanvas} from './EventCanvas';
import {HEART_TRACE_PATH,TRAIL_EVENTS,heartRockReward,trailEventDescription,type TrailEventState} from './events';

function Pines({x,y,scale,light}:{x:number;y:number;scale:number;light?:boolean}){
 return <g transform={`translate(${x} ${y}) scale(${scale})`} shapeRendering="crispEdges">
  <path d="M-3 0v-17h6V0z" fill="#614e48"/>
  <path d="M-21-13h5v-7h5v-7h-5v-3h5v-7h5v-7h4v-8h4v8h4v7h5v7h5v3h-5v7h5v7h5v4h-42z" fill={light?'#4f7961':'#304e48'}/>
  <path d="M-1-46h3v9h4v7H1v8h8v7H-7v-5h4v-8h-5v-3h4v-7h3z" fill={light?'#679475':'#3f6256'}/>
 </g>;
}

function RockScene({blessed}:{blessed:boolean}){
 return <svg className="heart-rock-scene" viewBox="0 0 320 108" role="img" aria-label="A rounded blue-gray rock in a quiet pine grove">
  <rect width="320" height="108" rx="5" fill="#91aeb1"/>
  <path d="M0 53h24v-8h32v-8h34v7h45v12h44V44h47V33h31v9h29v9h34v57H0z" fill="#799b96"/>
  <path d="M0 76h51v-5h52v4h95v-5h61v5h61v33H0z" fill="#446a58"/>
  <Pines x={76} y={83} scale={1.34} light/>
  <Pines x={37} y={89} scale={1.58}/>
  <Pines x={239} y={82} scale={1.25} light/>
  <Pines x={283} y={88} scale={1.55}/>
  <ellipse cx="160" cy="91" rx="66" ry="10" fill="#33554a"/>
  <g shapeRendering="crispEdges">
   <path d="M103 88v-9h4V66h7V54h9V45h11v-5h17v-3h30v4h15v6h9v9h8v13h5v18h-8v5H112v-4z" fill="#344d55"/>
   <path d="M109 84V70h8V57h9v-8h12v-5h17v-3h23v4h15v6h9v9h7v12h4v13h-12v3h-85v-4z" fill="#809aa4"/>
   <path d="M116 72h8V58h11v-7h16v-4h28v4h10v5h-31v3h-21v9h-11v11h-10z" fill="#a8bfc2"/>
   <path d="M159 78h24v-4h16v-9h7v10h7v10h-12v3h-85v-4h43z" fill="#617e8c"/>
   <path d="M78 92h5v-5h3v5h8v3H78zm152 4h5v-6h3v6h8v3h-16z" fill="#8aaa77"/>
  </g>
  {blessed&&<g aria-hidden="true">
   <path d={HEART_TRACE_PATH} transform="translate(141 42) scale(.39)" fill="#da9fb7" stroke="#f7d7e4" strokeWidth="5"/>
   <path d="M120 42h4v4h-4zm73 3h4v4h-4zm-5-15h3v3h-3zm-50-1h3v3h-3z" fill="#f4c9dd"/>
  </g>}
 </svg>;
}

export function HeartRock({event,onCast}:{event:Extract<TrailEventState,{id:'heartRock'}>;onCast:(quality:number)=>void}){
 const reward=heartRockReward(event.quality??0);
 return <section className="run-panel event-panel">
  <h1>{TRAIL_EVENTS.heartRock.name}</h1>
  <RockScene blessed={event.outcome==='blessed'}/>
  <p key={event.outcome} className="event-description" role="status">{trailEventDescription(event)}</p>
  {event.outcome==='pending'?<EventCanvas onHeartCast={onCast}/>:<>
   <p className="event-quality">Heart quality <strong>{event.quality??0}%</strong></p>
   <p className="heart-rock-reward" role="status">{reward>0?`+${reward} max HP`:'No max HP gained'}</p>
  </>}
 </section>;
}
