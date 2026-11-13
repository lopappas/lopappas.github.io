// Frozen 0.2.91 reference for exact score/candidate regression comparisons.
import {SPELLS,SPELL_VARIATIONS,distance,type Point,type Strokes,type Spell,type SpellId} from '../../src/magic.ts';
function legacyStrokeLength(strokes:Strokes){return strokes.reduce((sum,s)=>sum+s.slice(1).reduce((n,p,i)=>n+distance(s[i],p),0),0);}
function normalize(strokes:Strokes):Strokes{
 const all=strokes.flat();if(!all.length)return[];const xs=all.map(p=>p.x),ys=all.map(p=>p.y);const minX=Math.min(...xs),minY=Math.min(...ys),w=Math.max(...xs)-minX,h=Math.max(...ys)-minY,s=Math.max(w,h,0.001);
 return strokes.map(st=>st.map(p=>({x:(p.x-minX-w/2)/s,y:(p.y-minY-h/2)/s})));
}
function sample(strokes:Strokes,count=140):Point[]{
 const total=legacyStrokeLength(strokes);if(total<0.001)return[];const step=total/(count-1);const result:Point[]=[];let next=0,travel=0;
 for(const stroke of strokes)for(let i=1;i<stroke.length;i++){const a=stroke[i-1],b=stroke[i],len=distance(a,b);if(len===0)continue;while(next<=travel+len&&result.length<count){const t=(next-travel)/len;result.push({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});next+=step;}travel+=len;}
 return result;
}
const meanNearest=(a:Point[],b:Point[])=>a.reduce((sum,p)=>sum+Math.min(...b.map(q=>distance(p,q))),0)/a.length;
export type RecognitionResult={spell:Spell|null;quality:number;candidates:{spell:Spell;quality:number;error:number}[];reason:string};
export function legacyRecognize(strokes:Strokes,known:SpellId[]=SPELLS.map(s=>s.id),accuracyBonus=0):RecognitionResult{
 const normalized=normalize(strokes),points=sample(normalized);if(points.length<5)return{spell:null,quality:0,candidates:[],reason:'Draw a complete sigil first.'};
 const len=legacyStrokeLength(normalized);
 // Collapse every shape variation into one candidate per spell BEFORE ambiguity checks.
 const candidates=SPELLS.filter(s=>known.includes(s.id)).map(spell=>{
  const handPenalty=spell.id==='chronos'?Math.exp(-Math.max(0,Math.min(...points.map(p=>Math.hypot(p.x,p.y)))-.1)*9):1;
  return [spell.strokes,...(SPELL_VARIATIONS[spell.id]??[])].map(template=>{
   const ref=normalize(template),target=sample(ref),error=(meanNearest(points,target)+meanNearest(target,points))/2;
   const ratio=len/legacyStrokeLength(ref),lengthPenalty=Math.exp(-Math.abs(Math.log(Math.max(.001,ratio)))*1.8);
   return{spell,quality:Math.round(100*Math.exp(-error*13)*lengthPenalty*handPenalty),error};
  }).reduce((best,current)=>current.quality>best.quality?current:best);
 }).sort((a,b)=>b.quality-a.quality);
 if(!candidates.length)return{spell:null,quality:0,candidates,reason:'No spells learned yet.'};
 return applyRecognitionBonus({spell:null,quality:0,candidates,reason:''},accuracyBonus);
}
/** Reuse geometric scores: bonuses affect acceptance and accuracy, never shape identity or margin. */
export function applyRecognitionBonus(raw:RecognitionResult,accuracyBonus=0):RecognitionResult{
 const {candidates}=raw;if(!candidates.length)return raw;
 const top=candidates[0],margin=top.quality-(candidates[1]?.quality??0);
 const quality=Math.min(100,top.quality+Math.max(0,accuracyBonus));
 const accepted=quality>=48&&margin>=7;
 return{spell:accepted?top.spell:null,quality,candidates,reason:accepted?'':margin<7?'The shape is between two sigils. Make its defining details clearer.':'The sigil is incomplete or its shape needs more care.'};
}
