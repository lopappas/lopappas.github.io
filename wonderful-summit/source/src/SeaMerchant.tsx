import React from 'react';
import {PetPurse} from './PetPurse';

/** Chunky silhouettes and a small pixel grid keep the roadside camp retro. */
export function SeaMerchant(){return <svg className="npc-art merchant-art" viewBox="0 0 180 96" role="img" aria-label="A smiling Belladora purse to the left of the sea urchin merchant, beside a blue tent and a wooden table with three potions, two rocks, and three scrolls.">
 <g shapeRendering="crispEdges">
  <path d="M8 84h164v4H8z" fill="#1c3029"/>
  {/* Blue tent, with a stair-stepped canvas roof. */}
  <path d="M8 76V64h4V52h4V40h4V28h4V16h24v8h4v8h4v8h4v8h4v8h4v8h4v12z" fill="#30485e"/>
  <path d="M12 72V64h4V52h4V40h4V28h4v-8h16v8h4v8h4v8h4v8h4v8h4v8h4v4z" fill="#507ea3"/>
  <path d="M12 72V64h4V52h4V40h4V28h4v-8h4v12h4v12h4v12h4v16z" fill="#80b7cd"/>
  <path d="M24 72V56h4V44h4v12h4v16z" fill="#253c50"/>
  <path d="M48 32h4v8h-4zm8 16h4v8h-4z" fill="#6b9ebc"/>
  {/* Square-cut spines and a compact purple merchant. */}
  <path d="M76 36h4V28h4v8h4v-4h4v8h4v-4h4v12h8v4h-8v4h8v4h-8v4h4v4h-8v4h4v4H88v8h-8v-8h-4v8h-8v-8h-8v-4h4v-8h-8v-4h8v-4h-8v-4h8v-8h4v-8h4v4h4z" fill="#69557f"/>
  <path d="M72 40h16v4h8v8h4v12h-4v8h-8v4H72v-4h-8V48h8z" fill="#a68ab9"/>
  <path d="M72 44h16v4H72zm-4 4h4v8h-4z" fill="#cfafd5"/>
  <path d="M72 54h4v6h-4zm14 0h4v6h-4z" fill="#302e44"/>
  <path d="M68 62h6v4h-6zm20 0h6v4h-6z" fill="#d9a0b4"/>
  <path d="M77 64h3v3h5v-3h3v6H77z" fill="#4a395b"/>
  {/* Wooden table. */}
  <path d="M106 64h68v8h-4v14h-6V72h-48v14h-6V72h-4z" fill="#604938"/>
  <path d="M108 64h64v5h-64zm4 8h3v12h-3zm54 0h3v12h-3z" fill="#bf925e"/>
  <path d="M116 78h48v3h-48z" fill="#8d6648"/>
  <path d="M112 66h19v1h-19zm26 0h28v1h-28z" fill="#e2b87c"/>
  {/* Three potion bottles. */}
  {[{x:112,color:'#df8fa5'},{x:124,color:'#87cadc'},{x:136,color:'#b89ad6'}].map(({x,color})=><g key={x} transform={`translate(${x} 46)`}>
   <path d="M2 0h6v6h2v12H0V6h2z" fill="#3f5361"/>
   <path d="M3 2h4v5h2v10H1V7h2z" fill="#b9d7d6"/>
   <path d="M2 10h6v6H2z" fill={color}/><path d="M2 0h6v3H2z" fill="#b38b5d"/><path d="M2 9h1v4H2z" fill="#fff1d0"/>
  </g>)}
  {/* Two little rocks. */}
  <path d="M148 62v-4h2v-2h4v2h2v6h-8z" fill="#939da4"/><path d="M150 58h3v2h-3z" fill="#c6c7b8"/>
  <path d="M157 64v-4h2v-2h4v2h2v4z" fill="#a598b2"/>
  {/* Three tied scrolls stacked behind the rocks. */}
  {[45,50,55].map(y=><g key={y}><path d={`M149 ${y}h20v4h-20z`} fill="#9b7855"/><path d={`M150 ${y}h18v3h-18z`} fill="#ead7a9"/><path d={`M157 ${y}h2v3h-2z`} fill="#ae6979"/></g>)}
 </g>
 {/* Reuse Belladora's exact in-game design, with her happy expression. */}
 <g transform="translate(35 65) scale(.5)"><PetPurse/></g>
</svg>}
