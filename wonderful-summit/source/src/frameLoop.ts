export type FrameClock={now:()=>number;request:(callback:(now:number)=>void)=>number;cancel:(id:number)=>void};
/** Own exactly one callback; stop completely when inactive and discard suspended time. */
export class FrameLoop{
 private frame:number|null=null;
 private running=false;
 private last=0;
 private tick:(delta:number,now:number)=>boolean|void;
 private clock:FrameClock;
 constructor(tick:(delta:number,now:number)=>boolean|void,clock:FrameClock){this.tick=tick;this.clock=clock;}
 setRunning(active:boolean){
  if(active===this.running)return;
  this.running=active;
  if(!active){if(this.frame!==null)this.clock.cancel(this.frame);this.frame=null;return;}
  this.last=this.clock.now();this.schedule();
 }
 private schedule(){this.frame=this.clock.request(now=>{
  this.frame=null;if(!this.running)return;
  const delta=Math.max(0,(now-this.last)/1000);this.last=now;
  if(this.tick(delta,now)===false)this.setRunning(false);
  if(this.running)this.schedule();
 });}
}
/** Visibility changes cancel the pending callback, rather than polling a hidden document. */
export function bindFrameVisibility(loop:FrameLoop,visibility:EventTarget&{hidden:boolean}){
 const sync=()=>loop.setRunning(!visibility.hidden);
 visibility.addEventListener('visibilitychange',sync);sync();
 return()=>{loop.setRunning(false);visibility.removeEventListener('visibilitychange',sync);};
}
