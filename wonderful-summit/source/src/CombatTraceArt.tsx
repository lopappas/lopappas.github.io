import {traceViewBox} from './traceLayout';
import React,{useLayoutEffect,useState} from 'react';
import type {Spell} from './magic';
import {combatTraceScale,TRACE_FADE_MS,traceSize,traceStrokeWidth} from './combatTracePresentation';
/** Retain exiting artwork only for its short opacity transition; never alter drawing points. */
export function CombatTraceArt({spell,readyPulse,paused=false}:{spell:Spell|null;readyPulse?:number;paused?:boolean}){
 const [shown,setShown]=useState<Spell|null>(null),[visible,setVisible]=useState(false);
 useLayoutEffect(()=>{
  let first=0,second=0,timer:ReturnType<typeof setTimeout>|undefined;
  const enter=()=>{setShown(spell);first=requestAnimationFrame(()=>{second=requestAnimationFrame(()=>setVisible(true));});};
  setVisible(false);
  if(spell){if(shown&&shown.id!==spell.id)timer=setTimeout(enter,TRACE_FADE_MS);else enter();}
  else timer=setTimeout(()=>setShown(null),TRACE_FADE_MS);
  return()=>{cancelAnimationFrame(first);cancelAnimationFrame(second);if(timer)clearTimeout(timer);};
 },[spell]);
 if(!shown)return null;
 const scale=combatTraceScale(shown.id);
 const pulse=visible&&shown.id===spell?.id&&readyPulse!==undefined;
 return <div className="perfect-guide combat-trace-art" role="img" aria-label={`${shown.name} spell trace`} style={{color:shown.color,opacity:visible?1:0,transition:`opacity ${TRACE_FADE_MS}ms ease`}}>
  <svg viewBox={traceViewBox(shown.strokes)} aria-hidden="true" style={traceSize(scale)}>
   <path key={pulse?readyPulse:undefined} className={pulse?'combat-trace-ready-pulse':undefined} d={shown.path}
    fill="none" stroke="currentColor" strokeWidth={traceStrokeWidth(shown.id,undefined,true)} strokeLinecap="round" strokeLinejoin="round"
    style={pulse&&paused?{animationPlayState:'paused'}:undefined}/>
  </svg>
 </div>;
}
