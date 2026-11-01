import React from 'react';
import {RELICS,type RelicId} from './run';

export function RelicIcon({relic}:{relic:RelicId}){
 if(relic!=='blackStardust')return <>{RELICS[relic].icon}</>;
 return <svg className="spheredust-icon" viewBox="0 0 32 32" aria-hidden="true" fill="currentColor">
  {Array.from({length:12},(_,i)=>{const a=i*Math.PI/6;return <circle key={`outer-${i}`} cx={16+12*Math.cos(a)} cy={16+12*Math.sin(a)} r="1.35"/>;})}
  {Array.from({length:6},(_,i)=>{const a=i*Math.PI/3+.25;return <circle key={`inner-${i}`} cx={16+6*Math.cos(a)} cy={16+6*Math.sin(a)} r="1.2"/>;})}
  <circle cx="16" cy="16" r="1.25"/>
 </svg>;
}
