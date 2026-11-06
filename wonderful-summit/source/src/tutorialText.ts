import {SPELLS} from './magic.ts';
const terms=new Map(SPELLS.flatMap(s=>[[s.name.toLowerCase(),s.color],[s.element.toLowerCase(),s.color],[`${s.element.toLowerCase()} slime`,s.color]]));
const pattern=new RegExp(`\\b(${[...terms.keys()].sort((a,b)=>b.length-a.length).map(s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')})\\b`,'gi');
export function tutorialTextParts(text:string,visibleCharacters=Infinity){
 const parts:{text:string;color?:string}[]=[];let start=0,remaining=visibleCharacters;
 const append=(value:string,color?:string)=>{const chars=Array.from(value),visible=chars.slice(0,Math.max(0,remaining)).join('');remaining-=chars.length;if(visible)parts.push({text:visible,...(color?{color}:{})});};
 for(const match of text.matchAll(pattern)){append(text.slice(start,match.index));const end=match.index!+match[0].length,punctuation=text.slice(end).match(/^[.!]+/)?.[0]??'';append(match[0]+punctuation,terms.get(match[0].toLowerCase()));start=end+punctuation.length;}
 append(text.slice(start));return parts;
}
