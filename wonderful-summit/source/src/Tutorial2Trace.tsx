import React from 'react';
import {elementTrace} from './tutorial2Elements';
import {SPELLS,type SpellId} from './magic';
export function Tutorial2Trace({progress,demonstrating,spellId='water'}:{progress:number;demonstrating:boolean;spellId?:SpellId}){
 const {strokes,tip}=elementTrace(spellId,progress);const spell=SPELLS.find(s=>s.id===spellId)!;
 return <div className="t2-trace" role="img" aria-label={demonstrating?`Brush drawing ${spell.name}`:`Persistent ${spell.name} tracing guide`}><svg viewBox="0 0 100 100" aria-hidden="true">{strokes.map((points,i)=><polyline key={i} points={points.map(p=>`${p.x},${p.y}`).join(' ')} fill="none" stroke={spell.color} strokeOpacity=".65" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>)}{demonstrating&&<g transform={`translate(${tip.x} ${tip.y}) rotate(35)`}><path d="M0 0-3-7-2-13 2-13 3-7Z" fill="#495337" stroke="#253a2c" strokeWidth=".7"/><path d="M-2-13H2V-28H-2Z" fill="#98664a" stroke="#253a2c" strokeWidth=".7"/><path d="M-2-14H2V-11H-2Z" fill="#e1c172"/></g>}</svg></div>;
}
