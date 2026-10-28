import React,{useEffect,useState,type ReactNode} from 'react';

const DIALOGUE='“Your spells are ready sister. Also, I gave Belladora one of my homemade healing potions in case you run into trouble. Please take one of my keepsakes for your journey too, Filadora.\n\nAnd please… come home safe.”';
const SPELL_START=DIALOGUE.indexOf('spells'),SPELL_END=SPELL_START+'spells'.length;
const POTION_START=DIALOGUE.indexOf('healing potions'),POTION_END=POTION_START+'healing potions'.length;
const LETTER_COLORS=['#397fba','#c64e65','#4c8b53'];

export function SisterDialogue({potionIcon}:{potionIcon:ReactNode}){
 const [visibleCount,setVisibleCount]=useState(0);
 useEffect(()=>{
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  let count=0,timer:ReturnType<typeof setTimeout>|null=null;
  function typeNext(){
   count++;setVisibleCount(count);
   if(count<DIALOGUE.length)timer=setTimeout(typeNext,/[,.…!?]/.test(DIALOGUE[count-1])?130:20);
  }
  function reveal(){if(timer)clearTimeout(timer);timer=null;count=DIALOGUE.length;setVisibleCount(count);}
  const onMotionChange=()=>{if(motion.matches)reveal();};
  if(motion.matches)reveal();else timer=setTimeout(typeNext,75);
  motion.addEventListener('change',onMotionChange);
  return()=>{if(timer)clearTimeout(timer);motion.removeEventListener('change',onMotionChange);};
 },[]);
 function letters(start:number,end:number,magic=false){
  return Array.from(DIALOGUE.slice(start,end)).map((letter,offset)=>{
   const index=start+offset;
   if(letter==='\n')return <br key={index}/>;
   return <span key={index} className={magic?'sister-spell-letter':undefined} style={{visibility:index<visibleCount?'visible':'hidden',color:magic?LETTER_COLORS[offset%3]:undefined,'--letter':offset} as React.CSSProperties}>{letter}</span>;
  });
 }
 // Invisible letters reserve the final layout. Assistive technology gets the
 // complete line once, instead of hearing each incremental letter update.
 return <p className="dialogue sister-dialogue"><span className="sister-dialogue-accessible">{DIALOGUE}</span><span aria-hidden="true">{letters(0,SPELL_START)}<span className="sister-spell-word">{letters(SPELL_START,SPELL_END,true)}</span>{letters(SPELL_END,POTION_START)}<span className="sister-potion-phrase">{letters(POTION_START,POTION_END)}<span className="sister-potion" style={{visibility:visibleCount>=POTION_END?'visible':'hidden'}}>{potionIcon}</span></span>{letters(POTION_END,DIALOGUE.length)}</span></p>;
}
