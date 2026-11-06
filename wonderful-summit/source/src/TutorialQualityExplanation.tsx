import React from 'react';
import {SpellGrade} from './SpellGrade';
import {TutorialText} from './TutorialText';
import {QUALITY_LINES} from './tutorial2Goblin';
export function TutorialQualityExplanation(){return <div className="t2-quality-explanation"><p>There are 5 types of spell casts:</p>{QUALITY_LINES.map((line,i)=>{
 const [name,...words]=line.split(' '),rest=' '+words.join(' ');
 return <p key={name}><span className={`t2-quality-label t2-quality-${name.toLowerCase()}`}>{i===0?<span style={{color:'#caa1b0'}}>Fizzles</span>:<SpellGrade label={name}/>}</span>{rest.split(/(weak|average|amazing|the best)/g).map((part,j)=>['weak','average','amazing','the best'].includes(part)?<strong key={j}>{part}</strong>:<TutorialText key={j} text={part}/>)}</p>;
})}</div>;}
