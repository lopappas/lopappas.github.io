import React from 'react';
import {grade,SPELLS} from './magic';
import type {PlayerDrawing} from './drawings';
import {SpellGrade} from './SpellGrade';
import {LessonText} from './LessonText';
export function BestDrawing({drawing}:{drawing:PlayerDrawing|null}){
 if(!drawing)return <p>No spells cast this run.</p>;
 const spell=SPELLS.find(s=>s.id===drawing.spellId);
 return <section className="best-drawing" aria-label="Your highest quality spell drawing"><h2>Your best spell</h2><svg viewBox={`0 0 ${drawing.width} ${drawing.height}`} role="img" aria-label="Your original hand-drawn spell" preserveAspectRatio="xMidYMid meet">{drawing.strokes.map((stroke,i)=><polyline key={i} points={stroke.map(p=>`${p.x},${p.y}`).join(' ')} fill="none" stroke="#3d4253" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>)}</svg>{spell&&<strong><LessonText text={spell.name}/></strong>}<SpellGrade label={spell?grade(drawing.quality):'Fizzle'}/><span>{drawing.quality}%</span></section>;
}
