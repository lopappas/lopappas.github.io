import test from 'node:test';
import assert from 'node:assert/strict';
import {tutorialTextParts} from '../src/tutorialText.ts';
import {SPELLS} from '../src/magic.ts';
test('every spell name and element uses its live catalog color regardless of case',()=>{
 for(const spell of SPELLS)for(const text of [spell.name,spell.element.toLowerCase()])assert.deepEqual(tutorialTextParts(text),[{text,color:spell.color}]);
});
test('coloring preserves prose, punctuation and word boundaries',()=>{
 const text='Water dowses fire! Draw Little Sprout, then Firestorm. Beware fireflies.';
 const parts=tutorialTextParts(text);assert.equal(parts.map(p=>p.text).join(''),text);
 assert.deepEqual(parts.filter(p=>p.color).map(p=>p.text),['Water','fire','Little Sprout','Firestorm']);
});
test('partially typed spell names inherit their full name color without revealing future characters',()=>{
 const text='Draw Dewdrop!';const parts=tutorialTextParts(text,8);
 assert.equal(parts.map(p=>p.text).join(''),'Draw Dew');assert.equal(parts.at(-1)?.color,SPELLS.find(s=>s.id==='water')!.color);
});
