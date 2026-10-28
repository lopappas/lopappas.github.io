import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spellTextParts} from '../src/spellText.ts';
import {SPELLS} from '../src/magic.ts';

test('all six spell names receive their own element color in mixed instructions and upgrade text',()=>{
 for(const spell of SPELLS){
  const text=`Paint ${spell.name}, then try ${spell.name} +1.`;
  const parts=spellTextParts(text);
  assert.equal(parts.map(part=>part.text).join(''),text);
  assert.deepEqual(parts.filter(part=>part.color),[{text:spell.name,color:spell.color},{text:spell.name,color:spell.color}]);
 }
});

test('element matchup text is colored without changing casing or matching unrelated words',()=>{
 const text='Water beats fire; FIRE beats Nature. Firefly campsite; natural trails; Dewdrops.';
 const parts=spellTextParts(text);assert.equal(parts.map(part=>part.text).join(''),text);
 assert.deepEqual(parts.filter(part=>part.color).map(part=>part.text),['Water','fire','FIRE','Nature']);
 for(const part of parts.filter(part=>part.color))assert.equal(part.color,SPELLS.find(spell=>spell.element.toLowerCase()===part.text.toLowerCase())!.color);
});
