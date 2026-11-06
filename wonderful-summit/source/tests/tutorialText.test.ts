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
 assert.deepEqual(parts.filter(p=>p.color).map(p=>p.text),['Water','fire!','Little Sprout','Firestorm.']);
});
test('partially typed spell names inherit their full name color without revealing future characters',()=>{
 const text='Draw Dewdrop!';const parts=tutorialTextParts(text,8);
 assert.equal(parts.map(p=>p.text).join(''),'Draw Dew');assert.equal(parts.at(-1)?.color,SPELLS.find(s=>s.id==='water')!.color);
});

test('adjacent periods and exclamations inherit term color during typing too',()=>{
 for(const text of ['Dewdrop.','water!','Little Sprout...','Fire!!'])assert.equal(tutorialTextParts(text).length,1);
 assert.deepEqual(tutorialTextParts('Dewdrop!',8),[{text:'Dewdrop!',color:SPELLS.find(s=>s.id==='water')!.color}]);
 assert.equal(tutorialTextParts('water! Next.').map(p=>p.text).join(''),'water! Next.');
});

test('elemental slime phrases and punctuation share one color while bare slime stays uncolored',()=>{
 for(const [phrase,spellId] of [['water slime.','water'],['Fire slime!','fire'],['nature slime','nature']] as const){assert.deepEqual(tutorialTextParts(phrase),[{text:phrase,color:SPELLS.find(s=>s.id===spellId)!.color}]);}
 assert.deepEqual(tutorialTextParts('slime'),[{text:'slime'}]);
 assert.deepEqual(tutorialTextParts('water slime!',9),[{text:'water sli',color:SPELLS.find(s=>s.id==='water')!.color}]);
});

test('non-elemental is dark gray throughout its typewriter reveal',()=>{
 const text='Ah, a non-elemental enemy. Any spell will do';
 const parts=tutorialTextParts(text);assert.equal(parts.map(p=>p.text).join(''),text);
 assert.deepEqual(parts.filter(p=>p.color),[{text:'non-elemental',color:'#4b4b4b'}]);
 assert.deepEqual(tutorialTextParts('Non-elemental',4),[{text:'Non-',color:'#4b4b4b'}]);
});
