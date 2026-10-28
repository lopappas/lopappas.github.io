import React from 'react';
import {spellTextParts,type SpellAccent} from './spellText';

export type {SpellAccent} from './spellText';
export function LessonText({text,accent}:{text:string;accent?:SpellAccent}){
 const colored=(value:string)=>spellTextParts(value,accent).map((part,index)=>part.color?<span key={index} className="spell-name" style={{color:part.color}}>{part.text}</span>:<React.Fragment key={index}>{part.text}</React.Fragment>);
 return <>{text.split('\n').map((line,lineIndex)=><React.Fragment key={lineIndex}>{lineIndex>0&&<br/>}{line.split(/(\*\*.+?\*\*)/g).map((part,index)=>part.startsWith('**')&&part.endsWith('**')?<strong key={index}>{colored(part.slice(2,-2))}</strong>:<React.Fragment key={index}>{colored(part)}</React.Fragment>)}</React.Fragment>)}</>;
}
