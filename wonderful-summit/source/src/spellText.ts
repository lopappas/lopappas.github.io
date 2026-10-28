import {SPELLS} from './magic.ts';

export type SpellAccent={name:string;color:string};
// Shared by spell names, instructions, descriptions and feedback, including
// repeated mentions and elemental matchup text. Preserve the author's casing.
export function spellTextParts(text:string,accent?:SpellAccent){
 const terms=[...SPELLS.map(({name,color})=>({name,color})),...SPELLS.map(({element:name,color})=>({name,color}))];
 if(accent)terms.unshift(accent);
 const unique=[...new Map(terms.map(term=>[term.name.toLowerCase(),term])).values()].sort((a,b)=>b.name.length-a.name.length);
 const escaped=unique.map(term=>term.name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
 const pattern=new RegExp(`\\b(${escaped.join('|')})\\b`,'gi');
 return text.split(pattern).filter(Boolean).map(part=>({text:part,color:unique.find(term=>term.name.toLowerCase()===part.toLowerCase())?.color}));
}
