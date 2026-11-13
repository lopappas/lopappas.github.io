import type {Strokes} from './magic.ts';
export type InkGeometry={center:{x:number;y:number}|null;paths:Path2D[]|null};
/** Append/replace detection follows the drawing model; recognition points are never rewritten. */
export class StrokeGeometryCache{
 private strokes:Strokes|null=null;
 private shape:{stroke:Strokes[number];length:number;firstX?:number;firstY?:number;lastX?:number;lastY?:number}[]=[];
 private factory:(()=>Path2D)|undefined;
 private geometry:InkGeometry={center:null,paths:null};
 get(strokes:Strokes,factory?:()=>Path2D){
  const changed=this.strokes!==strokes||this.factory!==factory||this.shape.length!==strokes.length||strokes.some((stroke,i)=>{const s=this.shape[i],first=stroke[0],last=stroke.at(-1);return s.stroke!==stroke||s.length!==stroke.length||s.firstX!==first?.x||s.firstY!==first?.y||s.lastX!==last?.x||s.lastY!==last?.y;});
  if(!changed)return this.geometry;
  this.strokes=strokes;this.factory=factory;this.shape=strokes.map(stroke=>({stroke,length:stroke.length,firstX:stroke[0]?.x,firstY:stroke[0]?.y,lastX:stroke.at(-1)?.x,lastY:stroke.at(-1)?.y}));
  let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
  const paths=factory?strokes.map(stroke=>{const path=factory();stroke.forEach((p,i)=>i?path.lineTo(p.x,p.y):path.moveTo(p.x,p.y));return path;}):null;
  for(const stroke of strokes)for(const p of stroke){minX=Math.min(minX,p.x);maxX=Math.max(maxX,p.x);minY=Math.min(minY,p.y);maxY=Math.max(maxY,p.y);}
  this.geometry={center:minX===Infinity?null:{x:(minX+maxX)/2,y:(minY+maxY)/2},paths};return this.geometry;
 }
}
