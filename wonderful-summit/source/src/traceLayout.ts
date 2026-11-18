import type {Strokes} from './magic.ts';
const cache=new WeakMap<Strokes,string>();
/** Center the complete shape, never the changing partial demonstration or its brush. */
export function traceViewBox(strokes:Strokes){
 const cached=cache.get(strokes);if(cached)return cached;
 let left=Infinity,right=-Infinity,top=Infinity,bottom=-Infinity;
 for(const stroke of strokes)for(const p of stroke){left=Math.min(left,p.x);right=Math.max(right,p.x);top=Math.min(top,p.y);bottom=Math.max(bottom,p.y);}
 const box=Number.isFinite(left)?`${(left+right)/2-50} ${(top+bottom)/2-50} 100 100`:'0 0 100 100';
 cache.set(strokes,box);return box;
}
