import {inkPixelRatio} from './inkCanvas';
import {StrokeGeometryCache} from './strokeGeometry';
const makePath=()=>new Path2D();
import {useCallback,useLayoutEffect,useRef,type RefObject} from 'react';
import {spellInkColor,type Strokes} from './magic';
import {INK_FADE_MS,ReleasedInkFade,paintSpellInk} from './inkVisuals';

export function useSpellInk(canvas:RefObject<HTMLCanvasElement|null>,strokes:RefObject<Strokes>,progress:number,targetColor:string|undefined,released=false,paused=false,externalChargeClock=false,getProgress?:()=>number){
 const geometry=useRef(new StrokeGeometryCache());
 const visual=useRef({progress,targetColor,released,paused,getProgress});visual.current={progress,targetColor,released,paused,getProgress};
 const release=useRef<ReleasedInkFade|null>(null);
 const paint=useCallback((force=false)=>{
  const el=canvas.current,ctx=el?.getContext('2d');if(!el||!ctx)return;
  const v=visual.current,now=performance.now();
  if(v.released&&!release.current)release.current=new ReleasedInkFade(now);
  if(!v.released)release.current=null;
  el.style.opacity=String(release.current?release.current.opacity(now,v.paused||document.hidden):1);
  if(release.current&&!release.current.needsPaint(el.width,el.height,strokes.current)&&!force)return;
  ctx.clearRect(0,0,el.width,el.height);ctx.save();const ratio=inkPixelRatio(window.devicePixelRatio);ctx.scale(ratio,ratio);
  const progress=v.getProgress?.()??v.progress;
  paintSpellInk(ctx,strokes.current,spellInkColor(v.released?1:progress,v.targetColor),v.released?1:progress,now,v.released?0:null,window.matchMedia('(prefers-reduced-motion: reduce)').matches,geometry.current.get(strokes.current,typeof Path2D==='undefined'?undefined:makePath));
  ctx.restore();
 },[canvas,strokes]);
 useLayoutEffect(()=>{
  let frame=0;if(release.current)release.current.resetClock(performance.now());paint();
  const tick=()=>{paint();if((visual.current.released&&(release.current?.elapsed??0)<INK_FADE_MS)||(!externalChargeClock&&!visual.current.released&&visual.current.progress>.4))frame=requestAnimationFrame(tick);};
  if(!paused&&(released||!externalChargeClock&&progress>.4))frame=requestAnimationFrame(tick);
  const visibility=()=>release.current?.resetClock(performance.now());
  document.addEventListener('visibilitychange',visibility);
  return()=>{cancelAnimationFrame(frame);document.removeEventListener('visibilitychange',visibility);};
 },[paint,progress,targetColor,released,paused,externalChargeClock]);
 return paint;
}
