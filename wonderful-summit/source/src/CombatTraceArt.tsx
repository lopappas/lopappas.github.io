import React,{useLayoutEffect,useState} from 'react';
import type {Spell} from './magic';
import {combatTraceScale,TRACE_FADE_MS,TRACE_STROKE_WIDTH} from './combatTracePresentation';
/** Retain exiting artwork only for its short opacity transition; never alter drawing points. */
export function CombatTraceArt({spell}:{spell:Spell|null}){
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
 return <div className="perfect-guide combat-trace-art" role="img" aria-label={`${shown.name} spell trace`} style={{color:shown.color,opacity:visible?.24:0,transition:`opacity ${TRACE_FADE_MS}ms ease`}}><svg viewBox="0 0 100 100" aria-hidden="true" style={{width:`${78*scale}%`,height:`${78*scale}%`,maxWidth:230*scale,maxHeight:230*scale}}><path d={shown.path} fill="none" stroke="currentColor" strokeWidth={TRACE_STROKE_WIDTH} strokeLinecap="round" strokeLinejoin="round"/></svg></div>;
}
