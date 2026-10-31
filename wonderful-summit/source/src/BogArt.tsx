import React from 'react';
import {PaletteGroup} from './PaletteGroup';
import type {Bog} from './bog';
export function BogArt({bog,time,gray}:{bog:Bog|null;time:number;gray:number}){
 if(!bog)return null;
 const arrival=Math.min(1,Math.max(0,time-bog.started)),remaining=bog.portions.at(-1)!.until-time;
 const opacity=arrival*Math.min(1,Math.max(0,remaining/.4));
 return <PaletteGroup amount={gray}><g opacity={opacity} transform={`translate(0 ${8*(1-arrival)})`} aria-label="Drudge Bog, a shallow murky swamp" pointerEvents="none">
  <ellipse cx="479" cy="459" rx={190+arrival*15} ry={32+arrival*13} fill="#344c32" opacity=".7"/>
  <path d="M285 454q30-27 72-15t75-8 90 11 78-5 72 20q-9 34-89 25t-102 10-95-12-101-26" fill="#566746" opacity=".8"/>
  {Array.from({length:9},(_,i)=>{const x=308+i*37,y=447+(i%3)*14,p=(time*.6+i*.23)%1;return <g key={i}><ellipse cx={x} cy={y} rx={3+p*9} ry={1+p*2.5} fill="none" stroke="#a1a768" strokeWidth="1.5" opacity={(1-p)*.65}/><circle cx={x+4} cy={y-3-Math.sin(p*Math.PI)*3} r="2" fill="#839558" opacity=".6"/></g>;})}
  <path d="M326 453v-12m0 5-5-6m5 6 5-6M605 460v-15m0 7-6-6m6 6 6-6M419 477v-10m0 5-5-5m5 5 5-5" fill="none" stroke="#87945a" strokeWidth="3" strokeLinecap="round"/>
 </g></PaletteGroup>;
}
