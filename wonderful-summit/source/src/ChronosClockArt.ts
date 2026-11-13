import React from 'react';
import type {chronosClockFrame} from './chronosClock.ts';
export function ChronosClock({frame,y}:{frame:ReturnType<typeof chronosClockFrame>;y:number}){
 if(!frame)return null;
 return React.createElement('g',{transform:`translate(360 ${y})`,pointerEvents:'none',role:'img','aria-label':`Chronos Denalis: ${frame.remaining.toFixed(1)} seconds remaining`},
  React.createElement('circle',{r:43,fill:'#20382d',opacity:.65}),
  React.createElement('circle',{r:38,fill:'none',stroke:'#e3e7ef',strokeWidth:3.45}),
  React.createElement('path',{d:'M0 0V-38',transform:`rotate(${frame.angle})`,fill:'none',stroke:'#e3e7ef',strokeWidth:3.45,strokeLinecap:'round'}));
}
