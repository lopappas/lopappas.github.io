import React from 'react';
import {PaletteGroup} from './PaletteGroup.ts';
import {enemyElementColor,type Enemy} from './battle.ts';
// Own palette boundary keeps this UI marker colored through every Chronos fade.
export function TargetCaret({element,mother=false}:{element:Enemy['element'];mother?:boolean}){
 return React.createElement(PaletteGroup,{amount:0},React.createElement('path',{transform:mother?'translate(0 -30)':undefined,d:'M-7-124 0-117 7-124',fill:'none',stroke:enemyElementColor(element),strokeWidth:3,strokeLinecap:'round',strokeLinejoin:'round','aria-label':'Current target'}));
}
