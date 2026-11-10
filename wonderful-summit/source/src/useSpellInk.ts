import {useCallback,useLayoutEffect,useRef,type RefObject} from 'react';
import {spellInkColor,type Strokes} from './magic';
import {INK_DISSOLVE_MS,paintSpellInk} from './inkVisuals';

export function useSpellInk(canvas:RefObject<HTMLCanvasElement|null>,strokes:RefObject<Strokes>,progress:number,targetColor:string|undefined,released=false,paused=false){
 const visual=useRef({progress,targetColor,released,paused});visual.current={progress,targetColor,released,paused};
 const release=useRef<{start:number;elapsed:number;last:number}|null>(null);
 const paint=useCallback(()=>{
  const el=canvas.current,ctx=el?.getContext('2d');if(!el||!ctx)return;
  const v=visual.current,now=performance.now();
  if(v.released&&!release.current)release.current={start:now,elapsed:0,last:now};
  if(!v.released)release.current=null;
  if(release.current){if(!v.paused&&!document.hidden)release.current.elapsed+=now-release.current.last;release.current.last=now;}
  const dissolve=release.current?Math.min(1,release.current.elapsed/INK_DISSOLVE_MS):null;
  ctx.clearRect(0,0,el.width,el.height);ctx.save();ctx.scale(window.devicePixelRatio||1,window.devicePixelRatio||1);
  paintSpellInk(ctx,strokes.current,spellInkColor(v.released?1:v.progress,v.targetColor),v.released?1:v.progress,now,dissolve,window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  ctx.restore();
 },[canvas,strokes]);
 useLayoutEffect(()=>{
  let frame=0;if(release.current)release.current.last=performance.now();paint();
  const tick=()=>{paint();if((visual.current.released&&(release.current?.elapsed??0)<INK_DISSOLVE_MS)||(!visual.current.released&&visual.current.progress>.4))frame=requestAnimationFrame(tick);};
  if(!paused&&(released||progress>.4))frame=requestAnimationFrame(tick);
  return()=>cancelAnimationFrame(frame);
 },[paint,progress,targetColor,released,paused]);
 return paint;
}
