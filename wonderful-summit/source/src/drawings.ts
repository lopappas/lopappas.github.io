import type {SpellId,Strokes} from './magic.ts';
export type PlayerDrawing={spellId:SpellId|null;quality:number;strokes:Strokes;width:number;height:number};
export function snapshotDrawing(spellId:SpellId|null,quality:number,strokes:Strokes,width:number,height:number):PlayerDrawing{
 return{spellId,quality,strokes:strokes.map(st=>st.map(p=>({...p}))),width:Math.max(1,width),height:Math.max(1,height)};
}
export function bestDrawing(current:PlayerDrawing|null,candidate:PlayerDrawing|null|undefined):PlayerDrawing|null{
 if(!candidate||!candidate.strokes.some(st=>st.length>1))return current;
 if(current&&((!!current.spellId&&!candidate.spellId)||(!!current.spellId===!!candidate.spellId&&current.quality>=candidate.quality)))return current;
 return snapshotDrawing(candidate.spellId,candidate.quality,candidate.strokes,candidate.width,candidate.height);
}
// Successful boosted casts remain eligible, but rankings always use raw accuracy.
export function worstDrawing(current:PlayerDrawing|null,candidate:PlayerDrawing|null|undefined):PlayerDrawing|null{
 if(!candidate?.spellId||!Number.isFinite(candidate.quality)||!candidate.strokes.some(st=>st.length>1))return current;
 if(current&&current.quality<=candidate.quality)return current;
 return snapshotDrawing(candidate.spellId,candidate.quality,candidate.strokes,candidate.width,candidate.height);
}
