import React from 'react';
import {dewdropTrace} from './tutorial2Fire';
export function Tutorial2Trace({progress,demonstrating}:{progress:number;demonstrating:boolean}){
 const {points,tip}=dewdropTrace(progress);
 return <div className="t2-trace" role="img" aria-label={demonstrating?'Brush drawing Dewdrop counterclockwise':'Persistent Dewdrop tracing guide'}><svg viewBox="0 0 100 100" aria-hidden="true"><polyline points={points.map(p=>`${p.x},${p.y}`).join(' ')} fill="none" stroke="#4798b0" strokeOpacity=".65" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>{demonstrating&&<g transform={`translate(${tip.x} ${tip.y}) rotate(35)`}><path d="M0 0-3-7-2-13 2-13 3-7Z" fill="#495337" stroke="#253a2c" strokeWidth=".7"/><path d="M-2-13H2V-28H-2Z" fill="#98664a" stroke="#253a2c" strokeWidth=".7"/><path d="M-2-14H2V-11H-2Z" fill="#e1c172"/></g>}</svg></div>;
}
