import React from 'react';
export function Scarecrow({hit}:{hit:boolean}){return <g className={hit?'scarecrow scarecrow-hit':'scarecrow'} aria-label="Patches, a smiling straw scarecrow" role="img">
 <path d="M0-45V24M-41-32H41" stroke="#735638" strokeWidth="8" strokeLinecap="round"/>
 <path d="M-12-39-33-30-43-34-47-23-31-14-19-19-22 8H22L19-19 31-14 47-23 43-34 33-30 12-39Z" fill="#9c83bc" stroke="#51475e" strokeWidth="3"/>
 <path d="M-20 6H22M-12-29H14" stroke="#d9b474" strokeWidth="4"/>
 <path d="m-46-31-9-3m10 8-11 1m11 4-8 5m98-15 9-3m-10 8 11 1m-11 4 8 5M-15 9l-3 9m7-9 1 11M15 9l3 9m-7-9-1 11" stroke="#e9c781" strokeWidth="3"/>
 <circle cy="-57" r="22" fill="#efd6a0" stroke="#8c7148" strokeWidth="3"/>
 <path d="M-32-71Q0-85 32-71L30-65Q0-72-30-65ZM-20-73l7-24h28l7 25" fill="#aa7950" stroke="#6c513b" strokeWidth="3"/>
 <path d="M-15-80H17" stroke="#c4a6dc" strokeWidth="6"/>
 <circle cx="-8" cy="-57" r="3" fill="#4e493b"/><circle cx="9" cy="-57" r="3" fill="#4e493b"/>
 <path d="m0-55-4 7h8z" fill="#da9c75"/><path d="M-9-44q9 8 18-1" fill="none" stroke="#80604f" strokeWidth="2" strokeLinecap="round"/>
 <circle cx="-14" cy="-49" r="4" fill="#dc9c8d" opacity=".7"/><circle cx="15" cy="-49" r="4" fill="#dc9c8d" opacity=".7"/>
 <path d="M2-16c-8-9-16 2 0 10 16-8 8-19 0-10" fill="#e4b3b2"/>
 </g>;}
