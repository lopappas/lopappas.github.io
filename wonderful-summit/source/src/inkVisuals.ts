import type {InkGeometry} from './strokeGeometry.ts';
import type {Strokes} from './magic.ts';

export const INK_FADE_MS=210;
export const CAST_TRANSITION_MS=INK_FADE_MS;
export function inkRumble(progress:number,timeMs:number,reducedMotion=false){
 const amount=reducedMotion?0:Math.max(0,Math.min(1,(progress-.4)/.6));
 return {x:Math.sin(timeMs*.047)*amount,y:Math.sin(timeMs*.061+1.2)*amount*.75};
}
export function inkExpansion(progress:number){return Math.max(0,Math.min(1,(progress-.4)/.5));}
/** All geometry stays in CSS pixels; visual effects never mutate recognition points. */
export function paintSpellInk(ctx:CanvasRenderingContext2D,strokes:Strokes,color:string,progress:number,timeMs:number,fade:number|null,reducedMotion=false,geometry?:InkGeometry){
 const expansion=inkExpansion(progress);
 ctx.save();ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=3.45*(1+.2*expansion);
 const center=geometry?geometry.center:(()=>{const points=strokes.flat();return points.length?{x:(Math.min(...points.map(p=>p.x))+Math.max(...points.map(p=>p.x)))/2,y:(Math.min(...points.map(p=>p.y))+Math.max(...points.map(p=>p.y)))/2}:null;})();
 if(!reducedMotion&&expansion>0&&center){
  ctx.translate(center.x,center.y);ctx.scale(1+.08*expansion,1+.08*expansion);ctx.translate(-center.x,-center.y);
 }ctx.lineCap='round';ctx.lineJoin='round';
 if(fade===null){
  const offset=inkRumble(progress,timeMs,reducedMotion);ctx.translate(offset.x,offset.y);
  if(geometry?.paths){for(const path of geometry.paths)ctx.stroke(path);}else for(const stroke of strokes){ctx.beginPath();stroke.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();}
 }else if(fade<1){
  ctx.globalAlpha=1-Math.max(0,fade);
  if(geometry?.paths){for(const path of geometry.paths)ctx.stroke(path);}else for(const stroke of strokes){ctx.beginPath();stroke.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();}
 }

 ctx.restore();
}

/** Cache the released canvas; fade frames update opacity instead of redrawing geometry. */
export class ReleasedInkFade{
 elapsed=0;
 private last:number;
 private width=-1;
 private height=-1;
 private strokes:Strokes|null=null;
 constructor(now:number){this.last=now;}
 resetClock(now:number){this.last=now;}
 opacity(now:number,paused=false){
  if(!paused)this.elapsed+=Math.max(0,now-this.last);
  this.last=now;
  return Math.max(0,1-this.elapsed/INK_FADE_MS);
 }
 needsPaint(width:number,height:number,strokes:Strokes){
  if(this.width===width&&this.height===height&&this.strokes===strokes)return false;
  this.width=width;this.height=height;this.strokes=strokes;return true;
 }
}
