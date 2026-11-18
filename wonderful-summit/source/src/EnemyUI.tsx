import React,{memo} from 'react';
import type {Enemy} from './battle';

/** Primitive display props keep movement and combat clocks outside this cache. */
export const EnemyNameplate=memo(function EnemyNameplate({color,kingUIOffset,enemyEntrance,grouped=false,attacking=false,status,...e}:Pick<Enemy,'kind'|'element'|'goblinKing'|'rocky'|'hp'|'maxHP'>&{color:string;kingUIOffset:number;enemyEntrance?:'slide'|'fade';grouped?:boolean;attacking?:boolean;status?:string|null}){
 const name=e.goblinKing?'Goblin King':e.kind==='mother'?'Slime Mother':e.rocky?'Rock slime':e.kind==='goblin'?(enemyEntrance?'Goblin':'Elite'):e.kind==='spider'?(e.element==='Neutral'?'Spider':`${e.element} spider`):e.element==='Neutral'?'Slime':`${e.element} slime`;
 if(grouped)return <g>
  <rect x="-51" y="-81" width="102" height="19" rx="4" fill="#233b32f2" stroke={attacking?'#f4aa80':undefined}/>
  <text x={attacking?-4:0} y="-68" textAnchor="middle" fill={color} fontSize="14" fontFamily="Fredoka">{status??name} {Math.ceil(e.hp)}</text>
  {attacking&&<text x="43" y="-68" textAnchor="middle" fill="#f4aa80" fontSize="14" fontFamily="Fredoka">!</text>}
  <rect x="-39" y="-61" width="78" height="4" rx="2" fill="#294034"/>
  <rect x="-39" y="-61" width={78*e.hp/e.maxHP} height="4" rx="2" fill="#d68c88"/>
 </g>;
 return <g transform={kingUIOffset?`translate(0 ${kingUIOffset})`:undefined}><rect x={e.goblinKing?-96:e.kind==='mother'?-90:e.kind==='spider'&&e.element!=='Neutral'?-80:e.rocky?-62:e.kind==='slime'&&e.element!=='Neutral'?-78:-47} y={e.goblinKing?-170:e.kind==='mother'?-130:e.kind==='goblin'?-83:-62} width={e.goblinKing?192:e.kind==='mother'?180:e.kind==='spider'&&e.element!=='Neutral'?160:e.rocky?124:e.kind==='slime'&&e.element!=='Neutral'?156:94} height="22" rx="5" fill="#233b32dd"/>
<text y={e.goblinKing?-154:e.kind==='mother'?-114:e.kind==='goblin'?-67:-46} textAnchor="middle" fill={color} fontSize="17" fontFamily="Fredoka">{name} {Math.ceil(e.hp)}</text>
<rect x="-39" y={e.goblinKing?-144:e.kind==='mother'?-105:e.kind==='goblin'?-59:-38} width="78" height="6" rx="3" fill="#294034"/><rect x="-39" y={e.goblinKing?-144:e.kind==='mother'?-105:e.kind==='goblin'?-59:-38} width={78*e.hp/e.maxHP} height="6" rx="3" fill="#d68c88"/>
{e.kind==='mother'&&<text y={-84} textAnchor="middle" fill={color} fontSize="16" fontFamily="Fredoka">{e.element}</text>}
</g>;});

export const EnemyIndicators=memo(function EnemyIndicators({attacking,status,statusY}:{attacking:boolean;status:string|null;statusY:number}){return <>{attacking&&<text x="45" y="-27" fill="#f4aa80" fontSize="30">!</text>}
{status&&<text x="0" y={statusY} textAnchor="middle" fill="#ece2b7" fontSize="18">{status}</text>}
</>;});
