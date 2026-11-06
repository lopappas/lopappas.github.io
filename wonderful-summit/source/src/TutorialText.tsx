import React from 'react';
import {tutorialTextParts} from './tutorialText';
export function TutorialText({text,visibleCharacters}:{text:string;visibleCharacters?:number}){
 return <>{tutorialTextParts(text,visibleCharacters).map((part,i)=>part.color?<span key={i} className="t2-term" style={{color:part.color}}>{part.text}</span>:part.text)}</>;
}
