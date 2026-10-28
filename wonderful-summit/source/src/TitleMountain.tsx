import React from 'react';

export function TitleMountain(){
 return <svg className="title-mountain" viewBox="0 0 360 300" aria-hidden="true">
  <AuroraSky/>
  <path d="M-40 300 175 25 400 300" fill="#779b8b"/>
  <path d="m175 25-54 69 36-13 22 18 13-31 33 23z" fill="#e0dfbe"/>
  <path d="M-40 300 45 172l110 128 95-121 150 121" fill="#446c54"/>
  <g className="summit-beacon"><circle cx="175" cy="25" r="34" fill="url(#summit-white)"/><circle cx="175" cy="25" r="9" fill="url(#summit-white)"/><path d="M175 16v18M166 25h18" stroke="#fff" strokeWidth="1" strokeLinecap="round" opacity=".55"/></g>
 </svg>;
}

export function AuroraSky(){return <>
  <defs>
   <linearGradient id="aurora-red" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#ff8198" stopOpacity="0"/><stop offset=".4" stopColor="#ff586e" stopOpacity=".6"/><stop offset=".78" stopColor="#ffb4ad" stopOpacity=".3"/><stop offset="1" stopColor="#ff8198" stopOpacity="0"/></linearGradient>
   <linearGradient id="aurora-green" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#63efb0" stopOpacity="0"/><stop offset=".35" stopColor="#60ef99" stopOpacity=".65"/><stop offset=".72" stopColor="#c1ffd5" stopOpacity=".35"/><stop offset="1" stopColor="#63efb0" stopOpacity="0"/></linearGradient>
   <linearGradient id="aurora-blue" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#649bff" stopOpacity="0"/><stop offset=".4" stopColor="#6da7ff" stopOpacity=".7"/><stop offset=".75" stopColor="#bbdbff" stopOpacity=".35"/><stop offset="1" stopColor="#649bff" stopOpacity="0"/></linearGradient>
   <filter id="aurora-soft" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="3"/></filter>
   <radialGradient id="summit-white"><stop stopColor="#fff" stopOpacity=".95"/><stop offset=".2" stopColor="#f8ffff" stopOpacity=".65"/><stop offset="1" stopColor="#fff" stopOpacity="0"/></radialGradient>
  </defs>
  <g className="title-aurora" filter="url(#aurora-soft)">
   <g className="aurora-ribbon aurora-red"><path d="M-45-92C40-155 104-26 182-76S310-129 405-66L405-13C302-95 251 3 180-25S48-110-45-29Z" fill="url(#aurora-red)"/><path d="M-45-37C46-117 103-10 181-35S309-96 405-21" fill="none" stroke="#ff899c" strokeOpacity=".45" strokeWidth="2"/></g>
   <g className="aurora-ribbon aurora-green"><path d="M-42-68C44-133 91-6 178-57S310-92 402-111L402-50C309-17 264-74 183-7S42-78-42-12Z" fill="url(#aurora-green)"/><path d="M-42-17C44-93 93 25 181-20S309-29 402-56" fill="none" stroke="#b1ffd6" strokeOpacity=".5" strokeWidth="2"/></g>
   <g className="aurora-ribbon aurora-blue"><path d="M-35-120C44-62 103-141 182-108S320-11 399-72L399-12C310 43 255-59 179-62S38-1-35-63Z" fill="url(#aurora-blue)"/><path d="M-35-69C44-13 103-94 181-73S316 21 399-20" fill="none" stroke="#9ecbff" strokeOpacity=".55" strokeWidth="2"/></g>
  </g>
 </>;}
