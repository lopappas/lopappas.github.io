import React,{memo} from 'react';
import {PaletteGroup,grayPaint} from './PaletteGroup';
/** Stable scenery is reused across motion frames; Chronos alone changes its palette. */
export const StaticScenery=memo(function StaticScenery({gray}:{gray:number}){
 const envPaint=(color:string)=>grayPaint(color,gray) as string;
 return <><defs><linearGradient id="sky" x2="0" y2="1"><stop stopColor={envPaint('#abbebb')}/><stop offset="1" stopColor={envPaint('#e0dbc0')}/></linearGradient><linearGradient id="ground" x2="0" y2="1"><stop stopColor={envPaint('#6b895d')}/><stop offset="1" stopColor={envPaint('#283e36')}/></linearGradient><radialGradient id="glow"><stop stopColor={envPaint('#fff3c4')} stopOpacity=".7"/><stop offset="1" stopColor={envPaint('#fff3c4')} stopOpacity="0"/></radialGradient><filter id="soft"><feGaussianBlur stdDeviation="2"/></filter><pattern id="grass" width="50" height="37" patternUnits="userSpaceOnUse"><path d="M8 32l-3-6m4 4 3-6m22 7 3-5" stroke={envPaint('#b8c17c')} opacity=".2" fill="none"/></pattern><radialGradient id="chronos-white"><stop stopColor="#fff"/><stop offset="1" stopColor="#fff" stopOpacity="0"/></radialGradient></defs>
<PaletteGroup className="chronos-environment" amount={gray}>
<rect y="-1000" width="720" height="1600" fill="url(#sky)"/><circle cx="398" cy="127" r="95" fill="url(#glow)"/><circle cx="398" cy="127" r="31" fill="#f7e8b5"/>
<g fill="#eef0dc" opacity=".4"><path d="M94 143h106v7H94zm13-7h57v7h-57zm387 42h115v6H494zm27-7h55v7h-55z"/></g>
<path d="M64 334 303 61 570 335" fill="#92a8a0"/><path d="m303 61-68 80 35-8 22 18 18-23 34 14 32-1z" fill="#dce1cc"/><path d="m303 61 28 112 121 160H222z" fill="#748f87" opacity=".5"/>
<path d="M-30 358 161 196l138 170 176-165 278 156v130H-30" fill="#7d9980"/><path d="M-30 369q135-104 271 0t244-3 270-5v170H-30" fill="#628464"/>
<g fill="#426a50"><path d="M-20 180 60 51l79 129h-30l49 79H-30z"/><path d="m591 242 59-113 66 113h-28l47 76H568l48-76z"/></g>
<g fill="#315b46"><path d="M-29 255 48 132l83 123H97l53 99H-36z"/><path d="m620 340 70-137 64 137h-25l48 86H593l48-86z"/></g>
<path d="M0 395q170-40 333 2t387-8v211H0" fill="url(#ground)"/><path d="M345 390q-86 48-33 84t70 126H167q45-58 70-94t41-116" fill="#bcad7c"/><path d="M316 397q-40 49-17 66t50 55" stroke="#dbca91" strokeWidth="8" fill="none" opacity=".4"/>
<rect y="390" width="720" height="210" fill="url(#grass)"/>
<g fill="#496b48"><ellipse cx="47" cy="414" rx="96" ry="38"/><ellipse cx="651" cy="415" rx="115" ry="48"/><ellipse cx="49" cy="551" rx="95" ry="61"/><ellipse cx="670" cy="565" rx="120" ry="57"/></g>
<g fill="#72905b"><ellipse cx="43" cy="399" rx="60" ry="23"/><ellipse cx="681" cy="395" rx="76" ry="27"/><ellipse cx="1" cy="519" rx="70" ry="30"/></g>
<g fill="#eac69d"><circle cx="94" cy="435" r="3"/><circle cx="111" cy="449" r="3"/><circle cx="594" cy="461" r="3"/><circle cx="608" cy="447" r="3"/><circle cx="56" cy="508" r="3"/></g>
<g fill="#d0c5dc"><circle cx="75" cy="420" r="3"/><circle cx="79" cy="416" r="3"/><circle cx="574" cy="438" r="3"/><circle cx="578" cy="434" r="3"/></g>
<g className="fireflies" fill="#f4e9aa"><circle cx="154" cy="290" r="2"/><circle cx="556" cy="324" r="2"/><circle cx="350" cy="358" r="2"/><circle cx="91" cy="346" r="1.5"/><circle cx="614" cy="214" r="2"/></g>
<ellipse cx="235" cy="465" rx="47" ry="10" fill="#203d32" opacity=".35"/>
</PaletteGroup></>;
});
