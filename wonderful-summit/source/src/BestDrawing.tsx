import React from 'react';
import {grade,SPELLS} from './magic';
import type {PlayerDrawing} from './drawings';
import {SpellGrade} from './SpellGrade';
import {LessonText} from './LessonText';
export function BestDrawing({drawing,scope='run',kind='best'}:{drawing:PlayerDrawing|null;scope?:'run'|'act';kind?:'best'|'worst'}){
 const title=`Your ${kind} spell${scope==='act'?' this act':''}`;
 if(!drawing)return <section className="best-drawing"><h2>{title}</h2><p>No {kind==='worst'?'successful ':''}spells cast this {scope}.</p></section>;
 const spell=SPELLS.find(s=>s.id===drawing.spellId);
 return <section className="best-drawing" aria-label={`Your ${kind==='best'?'highest':'lowest successful'} quality spell drawing`}><h2>{title}</h2><svg viewBox={`0 0 ${drawing.width} ${drawing.height}`} role="img" aria-label="Your original hand-drawn spell" preserveAspectRatio="xMidYMid meet">{drawing.strokes.map((stroke,i)=><polyline key={i} points={stroke.map(p=>`${p.x},${p.y}`).join(' ')} fill="none" stroke="#3d4253" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>)}</svg>{spell&&<strong><LessonText text={spell.name}/></strong>}<SpellGrade label={spell?grade(Math.max(48,drawing.quality)):'Fizzle'}/><span>{drawing.quality}%</span></section>;
}
