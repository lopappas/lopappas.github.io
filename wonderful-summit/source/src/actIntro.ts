export const ACT_INTRO_HOLD_MS=1200;
// Reduce speed by 15%, preserving the distance and easing curve.
export const ACT_INTRO_PAN_MS=650/.85;
/** A destination reveal followed by an eased descent; a tap can shorten the hold. */
export function actIntroFrame(elapsed:number,maxScroll:number,reducedMotion=false,sweepAt=ACT_INTRO_HOLD_MS){
 const bottom=Math.max(0,maxScroll),pan=reducedMotion||bottom===0?0:ACT_INTRO_PAN_MS;
 const hold=Math.max(0,Math.min(ACT_INTRO_HOLD_MS,sweepAt));
 const progress=pan?Math.max(0,Math.min(1,(elapsed-hold)/pan)):elapsed>=hold?1:0;
 const eased=progress<.5?4*progress**3:1-(-2*progress+2)**3/2;
 return {scrollTop:bottom*eased,done:elapsed>=hold+pan};
}
type IntroSurface=EventTarget&{scrollTop:number;scrollHeight:number;clientHeight:number};
type IntroClock={now:()=>number;request:(callback:(now:number)=>void)=>number;cancel:(id:number)=>void};
/** Listen across the screen; repeated taps never restart or cancel an ongoing sweep. */
export function playActIntro(content:IntroSurface,input:EventTarget,onFinish:()=>void,reducedMotion=false,clock:IntroClock={now:()=>performance.now(),request:callback=>requestAnimationFrame(callback),cancel:id=>cancelAnimationFrame(id)}){
 let frame=0,active=true,sweepAt=ACT_INTRO_HOLD_MS;
 const started=clock.now();content.scrollTop=0;
 const cleanup=()=>{active=false;clock.cancel(frame);input.removeEventListener('pointerdown',tap,true);content.removeEventListener('wheel',stop);content.removeEventListener('keydown',stop);};
 const stop=()=>{if(!active)return;cleanup();onFinish();};
 const tap=()=>{sweepAt=Math.min(sweepAt,Math.max(0,clock.now()-started));};
 const tick=(now:number)=>{
  if(!active)return;
  const state=actIntroFrame(now-started,content.scrollHeight-content.clientHeight,reducedMotion,sweepAt);
  content.scrollTop=state.scrollTop;
  if(state.done){stop();return;}
  frame=clock.request(tick);
 };
 input.addEventListener('pointerdown',tap,{capture:true,passive:true});
 content.addEventListener('wheel',stop,{passive:true});content.addEventListener('keydown',stop);
 frame=clock.request(tick);
 return cleanup;
}
