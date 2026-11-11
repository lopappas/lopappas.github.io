import React from 'react';

export function SpellGrade({label}:{label:string}){
 const animated=label==='Beautiful'||label==='Wonderful';
 return <span className={`spell-grade${animated||label==='Faint'?` grade-${label.toLowerCase()}`:''}`} aria-label={label.trim()||undefined}>
  {animated?<span aria-hidden="true">{Array.from(label).map((letter,index)=><span key={index} className="grade-letter" style={{'--letter':index,color:label==='Wonderful'?`hsl(${index*40} 90% 76%)`:undefined} as React.CSSProperties}>{letter}</span>)}</span>:label}
 </span>;
}

export function RainbowLetters({text,offset=0,tone='wonderful'}:{text:string;offset?:number;tone?:'beautiful'|'wonderful'}){
 return <>{Array.from(text).map((letter,index)=><span key={index} className="grade-letter" style={{'--letter':index+offset,color:tone==='beautiful'?undefined:`hsl(${(index+offset)*40} 90% 76%)`} as React.CSSProperties}>{letter}</span>)}</>;
}

