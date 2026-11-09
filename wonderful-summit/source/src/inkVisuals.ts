import type {Strokes} from './magic.ts';

export const INK_DISSOLVE_MS=350;
export function inkRumble(progress:number,timeMs:number,reducedMotion=false){
 const amount=reducedMotion?0:Math.max(0,Math.min(1,(progress-.4)/.6));
 return {x:Math.sin(timeMs*.047)*amount,y:Math.sin(timeMs*.061+1.2)*amount*.75};
}
/** All geometry stays in CSS pixels; visual effects never mutate recognition points. */
export function paintSpellInk(ctx:CanvasRenderingContext2D,strokes:Strokes,color:string,progress:number,timeMs:number,dissolve:number|null,reducedMotion=false){
 ctx.save();ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=3.45;ctx.lineCap='round';ctx.lineJoin='round';
 if(dissolve===null){
  const offset=inkRumble(progress,timeMs,reducedMotion);ctx.translate(offset.x,offset.y);
  for(const stroke of strokes){ctx.beginPath();stroke.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();}
 }else if(dissolve<1){
  const t=Math.max(0,dissolve);
  if(reducedMotion){ctx.globalAlpha=1-t;for(const stroke of strokes){ctx.beginPath();stroke.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();}}
  else for(let s=0;s<strokes.length;s++)for(let i=1;i<strokes[s].length;i++){
   const a=strokes[s][i-1],b=strokes[s][i],pieces=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/5));
   for(let j=0;j<pieces;j++){
    const seed=(s*37+i*17+j*11)%101/100,age=Math.max(0,(t-seed*.28)/.72);
    ctx.globalAlpha=Math.max(0,1-age);const dx=Math.sin(seed*31)*age*7,dy=-age*(3+seed*8);
    ctx.beginPath();ctx.moveTo(a.x+(b.x-a.x)*j/pieces+dx,a.y+(b.y-a.y)*j/pieces+dy);
    ctx.lineTo(a.x+(b.x-a.x)*(j+(1-age*.8))/pieces+dx,a.y+(b.y-a.y)*(j+(1-age*.8))/pieces+dy);ctx.stroke();
   }
  }
 }
 ctx.restore();
}
