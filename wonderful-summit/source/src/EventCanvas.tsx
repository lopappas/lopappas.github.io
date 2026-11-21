import {HEART_TRACE_PATH,heartRockQuality,heartRockReward} from './events';
import {resizeInkCanvas} from './inkCanvas';
import {INK_FADE_MS} from './inkVisuals';
import {useSpellInk} from './useSpellInk';
import React,{useEffect,useRef,useState} from 'react';
import {HOLD_MS,chargeColor,recognize,gradeDrawnCast,type SpellId,type Strokes} from './magic';
import {snapshotDrawing,type PlayerDrawing} from './drawings';
import {playSpellSound,unlockSpellAudio,spellCastSound} from './sound';

type EventCanvasProps=
 | {known:SpellId[];onCast:(spellId:SpellId|null,quality:number,drawing:PlayerDrawing)=>void}
 | {onHeartCast:(quality:number)=>void};

const HEART_INK='#cc759d';

/** Preparing and clearing are free; only a completed hold spends the event attempt. */
export function EventCanvas(props:EventCanvasProps){
 const heart='onHeartCast' in props;
 const canvas=useRef<HTMLCanvasElement>(null),strokes=useRef<Strokes>([]),pointer=useRef<number|null>(null),committed=useRef(false),hold=useRef<{frame:number}|null>(null);
 const finishTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const [released,setReleased]=useState(false),[ready,setReady]=useState(!heart);
 const [hasDrawing,setHasDrawing]=useState(false),[charge,setCharge]=useState(0),[color,setColor]=useState<string|undefined>();
 const paint=useSpellInk(canvas,strokes,charge,color,released);

 function cancel(){if(committed.current)return;if(hold.current)cancelAnimationFrame(hold.current.frame);hold.current=null;setCharge(0);}
 useEffect(()=>{const el=canvas.current!;let w=0,h=0;const ro=new ResizeObserver(()=>{const r=el.getBoundingClientRect();if(w&&h){const scale=Math.min(r.width/w,r.height/h);strokes.current=strokes.current.map(st=>st.map(p=>({x:(p.x-w/2)*scale+r.width/2,y:(p.y-h/2)*scale+r.height/2})));}w=r.width;h=r.height;resizeInkCanvas(el,w,h,devicePixelRatio);paint();});ro.observe(el);const blur=()=>{pointer.current=null;cancel();};const visibility=()=>{if(document.hidden)blur();};window.addEventListener('blur',blur);document.addEventListener('visibilitychange',visibility);return()=>{ro.disconnect();if(finishTimer.current)clearTimeout(finishTimer.current);if(hold.current)cancelAnimationFrame(hold.current.frame);window.removeEventListener('blur',blur);document.removeEventListener('visibilitychange',visibility);};},[]);
 function start(){
  if(!ready||committed.current||hold.current||pointer.current!==null||!hasDrawing)return;
  unlockSpellAudio();
  const match=heart?null:recognize(strokes.current,props.known);
  const rawQuality=match?.quality??heartRockQuality(strokes.current);
  const quality=match?gradeDrawnCast(match).quality:rawQuality;
  setColor(heart?HEART_INK:match?.spell?.color);
  const started=performance.now();
  hold.current={frame:0};
  const tick=(now:number)=>{
   if(!hold.current)return;
   const progress=Math.min(1,(now-started)/HOLD_MS);
   setCharge(progress);
   if(progress<1){
    hold.current.frame=requestAnimationFrame(tick);
    return;
   }
   committed.current=true;
   hold.current=null;
   const {width,height}=canvas.current!.getBoundingClientRect();
   const spell=match?.spell;
   playSpellSound(heart&&heartRockReward(quality)>0?'ancient':spellCastSound(spell),quality);
   let finish:()=>void;
   if(heart)finish=()=>props.onHeartCast(quality);
   else{
    const drawing=snapshotDrawing(spell?.id??null,rawQuality,strokes.current,width,height);
    finish=()=>props.onCast(spell?.id??null,quality,drawing);
   }
   setReleased(true);
   finishTimer.current=setTimeout(()=>{finishTimer.current=null;finish();},INK_FADE_MS);
  };
  hold.current.frame=requestAnimationFrame(tick);
 }
 function pos(e:React.PointerEvent){const r=canvas.current!.getBoundingClientRect();return{x:Math.max(0,Math.min(r.width,e.clientX-r.left)),y:Math.max(0,Math.min(r.height,e.clientY-r.top))};}
 return <div className="event-studio">
  <section className={`event-paper bottle-paper${heart?' heart-rock-paper':''}`} aria-label="Event spell canvas" style={{'--charge-color':chargeColor(charge,color)} as React.CSSProperties}>
   <canvas ref={canvas} aria-label={heart?'Draw a heart for Heart Rock':'Draw one spell for the forgotten campsite'} aria-disabled={!ready}
    onPointerDown={e=>{
     if(!ready||committed.current||hold.current||pointer.current!==null||!e.isPrimary||e.button!==0)return;
     e.preventDefault();
     e.currentTarget.setPointerCapture(e.pointerId);
     pointer.current=e.pointerId;
     strokes.current.push([pos(e)]);
     paint();
    }}
    onPointerMove={e=>{
     if(pointer.current!==e.pointerId)return;
     e.preventDefault();
     strokes.current.at(-1)!.push(pos(e));
     setHasDrawing(true);
     paint();
    }}
    onPointerUp={e=>{
     if(pointer.current!==e.pointerId)return;
     strokes.current.at(-1)!.push(pos(e));
     pointer.current=null;
     setHasDrawing(true);
     paint();
    }}
    onPointerCancel={()=>{pointer.current=null;}} onLostPointerCapture={()=>{pointer.current=null;}}
   />
   {heart&&!ready&&<button type="button" className="cast-button heart-rock-ready" onClick={()=>setReady(true)}>Ready</button>}
   {heart&&ready&&<svg className="heart-rock-trace" viewBox="0 0 100 100" aria-hidden="true">
    <path d={HEART_TRACE_PATH} fill="none" stroke={HEART_INK} strokeWidth="5.2864" strokeLinecap="round" strokeLinejoin="round"/>
   </svg>}
   {!heart&&<button className="event-clear" aria-label="Clear drawing" disabled={!!charge} onClick={()=>{
    if(committed.current||hold.current||pointer.current!==null)return;
    strokes.current=[];
    setHasDrawing(false);
    paint();
   }}>↺</button>}
   <div className="bottle-charge" style={{opacity:charge?1:0,borderColor:chargeColor(charge,color)}} aria-hidden="true"/>
  </section>
  <div className="event-cast-row">
   <small>One casting attempt</small>
   <button type="button" className={`cast-button${ready?'':' awaiting-ready'}`} disabled={!ready||!hasDrawing}
    onPointerDown={e=>{
     if(!e.isPrimary||e.button!==0)return;
     e.preventDefault();
     e.currentTarget.setPointerCapture(e.pointerId);
     start();
    }}
    onPointerUp={cancel} onPointerCancel={cancel} onLostPointerCapture={cancel}
    onKeyDown={e=>{if((e.key===' '||e.key==='Enter')&&!e.repeat){e.preventDefault();start();}}}
    onKeyUp={e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();cancel();}}}
    onBlur={cancel}>Cast!</button>
  </div>
 </div>;
}
