import {FilaBody,SlimeBody,GoblinBody,CrownBody,GoblinHelmet} from './CharacterBodies';
import {chronosClockFrame} from './chronosClock';
import {ChronosClock} from './ChronosClockArt';
import {StaticScenery} from './StaticScenery';
import {TorrentArt} from './TorrentArt';
import {GOBLIN_KING_SCALE,kingCrownFrame,kingDialogueVisible,kingHasCrown} from './goblinKing';
import {SpiderArt} from './SpiderArt';
import {NearSpellArt} from './NearSpellArt';
import {playUISound} from './sound';
import {BogArt} from './BogArt';
import {TidalcrestArt} from './TidalcrestArt';
import {FirestormArt} from './FirestormArt';
import React,{useEffect,useRef,useState} from 'react';
import {TargetCaret} from './TargetCaret';
import {PaletteGroup} from './PaletteGroup';
import {WoodenShieldArt} from './WoodenShieldArt';
import {PetPurse} from './PetPurse';
import {enemyStatusLabel} from './timeVisuals';
import {EnemyEffects} from './EnemyEffects';
import {enemyElementColor,presentEnemies,projectilePosition,enemyY,targetedEnemy,potionPosition,POTION_FLIGHT_SECONDS,POTION_BREAK_SECONDS,type Battle} from './battle';
export function World({burst,color,battle,hasRelics=false,purseExpanded=false,practice=false,companion=true,companionPaused=false,enemyEntrance}:{burst:number;color:string;battle:Battle;hasRelics?:boolean;purseExpanded?:boolean;practice?:boolean;companion?:boolean;companionPaused?:boolean;enemyEntrance?:'slide'|'fade'}){
const [sad,setSad]=useState(false),[viewHeight,setViewHeight]=useState(410),[cloudY,setCloudY]=useState(210);
const worldRef=useRef<HTMLDivElement>(null);
const [flashBurst,setFlashBurst]=useState<Battle['blackFlashBurst']>(null);
useEffect(()=>{
 if(!battle.blackFlashBurst)return;
 setFlashBurst(battle.blackFlashBurst);
 const timer=setTimeout(()=>setFlashBurst(null),750);return()=>clearTimeout(timer);
},[battle.blackFlashBurst?.serial]);
const previousRobes=useRef(battle.robes.spells.length),[robesBurst,setRobesBurst]=useState(0);
useEffect(()=>{
 const count=battle.robes.spells.length;
 if(battle.robes.enabled&&count>previousRobes.current){setRobesBurst(count);playUISound('robes');}
 previousRobes.current=count;
},[battle.robes.enabled,battle.robes.spells.length]);
useEffect(()=>{if(!robesBurst)return;const timer=setTimeout(()=>setRobesBurst(0),1000);return()=>clearTimeout(timer);},[robesBurst]);

useEffect(()=>{
 const el=worldRef.current;if(!el)return;
 const health=el.parentElement?.querySelector<HTMLElement>('.world-bottom');
 const measure=()=>{
  const r=el.getBoundingClientRect();if(!r.width)return;
  const unitsPerPixel=720/r.width;
  setViewHeight(Math.max(410,r.height*unitsPerPixel));
  // Match the clouds' vertical center to the actual HP UI, including its scale.
  // Keep the highest cloud's stepped top and bob inside the visible scene.
  const healthRect=health?.getBoundingClientRect();
  const healthCenter=Math.max(0,healthRect?(healthRect.top+healthRect.bottom)/2-r.top:28);
  const visibleTop=510-r.height*unitsPerPixel;
  setCloudY(Math.max(visibleTop+55,visibleTop+healthCenter*unitsPerPixel+10));
 };
 const observer=new ResizeObserver(measure);observer.observe(el);if(health)observer.observe(health);measure();
 return()=>observer.disconnect();
},[hasRelics]);
useEffect(()=>{if(!battle.playerHits){setSad(false);return;}setSad(true);const timer=setTimeout(()=>setSad(false),2000);return()=>clearTimeout(timer);},[battle.playerHits]);
const orb=projectilePosition(battle),target=targetedEnemy(battle);
return <div className="world" ref={worldRef}><svg viewBox={`0 ${510-viewHeight} 720 ${viewHeight}`} preserveAspectRatio="xMidYMax slice" aria-label={practice?"Fila practices spells with a golden slime":"Fila faces the enemies, paintbrush in hand"} role="img">
<StaticScenery gray={0}/>
<TorrentArt torrent={battle.torrent} time={battle.time} gray={0}/>
<FirestormArt storm={battle.firestorm} time={battle.time} gray={0} cloudY={cloudY}/>
<BogArt bog={battle.bog} time={battle.time} gray={0}/><TidalcrestArt battle={battle} gray={0}/>
{battle.playerHits>0&&<g key={`ward-${battle.playerHits}`} transform="translate(295 410)" aria-label="Light blue magic flashes when Fila is hit"><g className="magic-hit-flash"><circle r="22" fill="#a9e7ff" opacity=".28"/><circle r="16" fill="none" stroke="#b4eeff" strokeWidth="3"/><path d="M0-29V-21M0 21v8M-29 0h8M21 0h8M-19-19l5 5M14 14l5 5M19-19l-5 5M-14 14l-5 5" fill="none" stroke="#d7f6ff" strokeWidth="3" strokeLinecap="round"/></g></g>}
{robesBurst>0&&<g key={`robes-${robesBurst}`} transform="translate(260 390)" aria-hidden="true" pointerEvents="none">{Array.from({length:24},(_,i)=>{
 const angle=i*Math.PI*2/24,reach=35+(i%4)*12;
 return <g key={i} className="robes-glitter" style={{'--glitter-x':`${Math.cos(angle)*reach}px`,'--glitter-y':`${Math.sin(angle)*reach*.85}px`,'--glitter-delay':`${i%4*25}ms`} as React.CSSProperties}><path d="M0-4 1-1 4 0 1 1 0 4-1 1-4 0-1-1Z" fill="#fff" transform={`translate(${Math.cos(angle)*12} ${Math.sin(angle)*18}) scale(${.65+i%3*.22})`}/></g>;
})}</g>}
<g key={battle.playerHits} className={battle.playerHits?'fila-recoil':''}><g className="fila" data-tutorial2-speaker="fila" shapeRendering="crispEdges" transform="translate(190 320) scale(5)" aria-label="Fila, a little pixel witch holding a paintbrush">
{battle.rejectionUntil>battle.time&&<path d="M9 0h4v2h2v3h2v4h3v3H2V9h3V5h2V2h2zM5 12h12v8h-2v2h3v3h2v5h-3v2h-5v-2H9v2H4v-4H2v-5h2v-3H3v-6h2z" fill="#fff" stroke="#fff" strokeWidth="3" opacity=".65" className="rejection-aura"/>}
<FilaBody/>
</g></g>
{companion&&<g className="purse" transform="translate(152 395) scale(1.18)"><g className={enemyEntrance&&battle.enemies[0].kind==='goblin'?undefined:'t2-companion-arrival'} style={{animationPlayState:companionPaused?'paused':'running'}}><PetPurse expanded={purseExpanded} sad={sad||battle.phase==='defeat'}/></g></g>}
{presentEnemies(battle).map(e=>{const crown=kingCrownFrame(e,battle.time),kingUIOffset=e.goblinKing&&!kingHasCrown(e)?48:0,frozen=battle.freezeUntil>battle.time,status=enemyStatusLabel(e,battle),color=practice?'#e6b844':e.rocky?'#a5aaa4':e.element==='Fire'?'#ef9c70':e.element==='Water'?'#7ccbd6':e.element==='Nature'?'#99bf76':'#bcc3a2';return <g key={e.id} transform={`translate(${e.x} ${enemyY(e.id,battle.encounter)})`} aria-label={practice?'A non-elemental golden practice slime':e.goblinKing?`Goblin King: ${e.hp} of ${e.maxHP} health`:`${e.rocky?'Rock':e.element} ${e.kind}: ${e.hp} of ${e.maxHP} health`}>
<g className={enemyEntrance?`t2-enemy-${enemyEntrance}`:undefined} style={{animationPlayState:companionPaused?'paused':'running'}}>
<ellipse cy="22" rx={e.kind==='mother'?72:e.goblinKing?59.8:38} ry="7" fill="#203d32" opacity=".35"/>{battle.phase==='active'&&target?.id===e.id&&<g transform={e.goblinKing?`translate(0 ${-24+kingUIOffset})`:undefined}><TargetCaret element={e.element} mother={e.kind==='mother'||!!e.goblinKing}/></g>}
<g transform={e.kind==='mother'?'scale(2.1)':e.goblinKing?`scale(${GOBLIN_KING_SCALE})`:undefined}><g className={`${e.kind==='spider'?'spider':e.kind==='goblin'?'goblin':'slime'}${e.stunUntil>battle.time?' stunned':''}${(e.shield?.burnUntil??0)>battle.time?' shield-burning':''}${e.hurtUntil>battle.time?' slime-hit':''}${e.attackAt!==null?' slime-attacking':''}`} style={{filter:frozen?'hue-rotate(100deg) brightness(1.2)':undefined}}>
{e.kind==='spider'?<SpiderArt color={color} clock={e.clock} moving={!frozen&&e.attackAt===null&&!e.push&&e.rootUntil<=battle.time&&e.stunUntil<=battle.time}/>:e.kind!=='goblin'?<SlimeBody color={color} attacking={e.attackAt!==null} practice={practice} rocky={e.rocky}/>:<g shapeRendering="crispEdges"><GoblinBody/>{e.goblinKing?crown.visible&&<g aria-label="Gold crown" transform={`translate(${crown.x} ${crown.y}) rotate(${crown.rotation})`} opacity={crown.opacity}><CrownBody/></g>:<GoblinHelmet/>}</g>}
</g></g>
{e.shield&&<WoodenShieldArt shield={e.shield} time={battle.time}/>}
<EnemyEffects enemy={e} time={battle.time}/>
{!practice&&<g transform={kingUIOffset?`translate(0 ${kingUIOffset})`:undefined}><rect x={e.goblinKing?-96:e.kind==='mother'?-90:e.kind==='spider'&&e.element!=='Neutral'?-80:e.rocky?-62:e.kind==='slime'&&e.element!=='Neutral'?-78:-47} y={e.goblinKing?-170:e.kind==='mother'?-130:e.kind==='goblin'?-83:-62} width={e.goblinKing?192:e.kind==='mother'?180:e.kind==='spider'&&e.element!=='Neutral'?160:e.rocky?124:e.kind==='slime'&&e.element!=='Neutral'?156:94} height="22" rx="5" fill="#233b32dd"/>
<text y={e.goblinKing?-154:e.kind==='mother'?-114:e.kind==='goblin'?-67:-46} textAnchor="middle" fill={color} fontSize="17" fontFamily="Fredoka">{e.goblinKing?'Goblin King':e.kind==='mother'?'Slime Mother':e.rocky?'Rock slime':e.kind==='goblin'?(enemyEntrance?'Goblin':'Elite'):e.kind==='spider'?(e.element==='Neutral'?'Spider':`${e.element} spider`):e.element==='Neutral'?'Slime':`${e.element} slime`} {Math.ceil(e.hp)}</text>
<rect x="-39" y={e.goblinKing?-144:e.kind==='mother'?-105:e.kind==='goblin'?-59:-38} width="78" height="6" rx="3" fill="#294034"/><rect x="-39" y={e.goblinKing?-144:e.kind==='mother'?-105:e.kind==='goblin'?-59:-38} width={78*e.hp/e.maxHP} height="6" rx="3" fill="#d68c88"/>
{e.kind==='mother'&&<text y={-84} textAnchor="middle" fill={color} fontSize="16" fontFamily="Fredoka">{e.element}</text>}
</g>}
{e.attackAt!==null&&<text x="45" y="-27" fill="#f4aa80" fontSize="30">!</text>}
{status&&<text x="0" y={e.goblinKing?-195+kingUIOffset:e.kind==='mother'?-145:-97} textAnchor="middle" fill="#ece2b7" fontSize="18">{status}</text>}
{kingDialogueVisible(e,battle.time)&&<g role="status" aria-label="Goblin King says: My crown! You’ll pay for this!" transform={`translate(${Math.max(134,Math.min(586,e.x))-e.x} -282)`} pointerEvents="none">
 <path d="M-8 73 0 87 8 73" fill="#354d29" stroke="#25381d" strokeWidth="2"/>
 <rect x="-128" y="0" width="256" height="76" rx="10" fill="#354d29" stroke="#e7c663" strokeWidth="2"/>
 <text textAnchor="middle" fontFamily="Fredoka" fontSize="21" fontWeight="500" fill="#ffd700" stroke="#283519" strokeWidth="1.4" paintOrder="stroke" aria-hidden="true"><tspan x="0" y="30">My crown!</tspan><tspan x="0" y="58">You’ll pay for this!</tspan></text>
</g>}
</g></g>;})}
{battle.motherSplit&&battle.time-battle.motherSplit.at<2.6&&(()=>{
 const split=battle.motherSplit,age=battle.time-split.at,c=split.element==='Fire'?'#ef9c70':split.element==='Water'?'#7ccbd6':'#99bf76';
 return <g transform={`translate(${split.x} ${enemyY(1)})`} pointerEvents="none" aria-label={age<2?'Slime Mother trembles before splitting':'Slime Mother bursts into three slimes'}>
 {age<2?<g transform={`translate(${Math.sin(age*30)*age*2} 0) scale(${2.1+age*.12} ${2.1-age*.2})`}><path d="M-36 12v-24h6v-16h10v-8h36v6h12v12h8v30h-6v8h-60v-8z" fill="#2d493d"/><path d="M-30 12v-22h6v-14h12v-6h24v6h12v12h6v24h-6v4h-48v-4z" fill={c}/><path d="m-16-8 8 6m-8 0 8-6m16 0 8 6m-8 0 8-6" stroke="#2d493d" strokeWidth="3"/><path d="M-3 6h9v3h-9z" fill="#2d493d"/></g>:<g opacity={Math.max(0,1-(age-2)/.6)}><circle r={20+(age-2)*180} stroke={c} strokeWidth="9" fill="none"/>{Array.from({length:12},(_,i)=>{const a=i*Math.PI/6,r=25+(age-2)*180;return <rect key={i} x={Math.cos(a)*r-6} y={Math.sin(a)*r*.65-6} width="12" height="12" fill={i%2?c:'#e9e8bb'}/>;})}</g>}
 </g>;
})()}
<NearSpellArt battle={battle} gray={0}/>
{orb&&battle.projectile&&battle.projectile.spellId!=='chronos'&&(battle.projectile.spellId==='leaf'?<g transform={`translate(${orb.x} ${orb.y}) rotate(${Math.sin((battle.time-battle.projectile.started)*20)*14}) scale(2.4)`} aria-label="Bramble Leaf, a drifting green diamond"><path d="M0-9 9 0 0 9-9 0Z" fill="#8fbe64" stroke="#d0e4a3" strokeWidth="1.5"/><path d="M0-6V6M-6 0H6" stroke="#4e833f" strokeWidth="1"/></g>:battle.projectile.spellId==='bolt'?<g transform={`translate(${orb.x} ${orb.y})`} shapeRendering="crispEdges" aria-label="Retro red-orange fire lightning bolt">
 <path d="M-42-12H-10L-20 0H12L-2 14 43-4H13L25-16H-5L5-27Z" fill="#df3f24"/>
 <path d="M-28-9H-3L-13 3H14L-2 10 30-1H5L15-12H-10Z" fill="#ff9639"/>
 <path d="M-49-5H-41M-39 8H-31M-24-22H-18" stroke="#ff692f" strokeWidth="3"/>
 </g>:<g className="spell-orb" transform={`translate(${orb.x} ${orb.y}) scale(${battle.projectile.spellId==='wave'?1.2:1})`} style={{color:battle.projectile.color}} aria-label="Spell orb travelling toward its target"><circle r="16" fill="currentColor" opacity=".22"/><circle r="9" fill="currentColor"/><circle cx="-2" cy="-3" r="3" fill="#fff3dc" opacity=".85"/></g>)}
{battle.phase==='active'&&battle.potionFlights.map(f=>{const p=potionPosition(f,battle.time),color=(f.potion==='heal'||f.potion==='theodoraHeal')?'#ec929d':f.potion==='miasma'?'#6e497e':f.potion==='stellar'?'#69c879':f.potion==='ink'?'#c49aeb':f.potion==='fury'?'#bd384e':f.potion==='rejection'?'#ffffff':f.potion==='spellBottle'?'#bfa1e8':'#8ed6eb',age=battle.time-f.started-POTION_FLIGHT_SECONDS;if(age<0)return <g key={f.id} transform={`translate(${p.x} ${p.y}) rotate(${p.rotation})`} aria-label="Potion bottle flying from purse"><path d="M-5-18h10v8l7 6v17H-12V-4l7-6z" fill="#dce9dc" stroke="#4f6356" strokeWidth="2"/><path d="M-9 0h18v11H-9z" fill={color}/><path d="M-6-21H6v5H-6z" fill="#b6925e"/><path d="M-7-3v10" stroke="#fff6d5" strokeWidth="2" opacity=".7"/></g>;
const t=Math.min(1,age/POTION_BREAK_SECONDS);return <g key={f.id} opacity={1-t} aria-label="Potion bottle breaking" style={{color}}><circle cx={f.toX} cy={f.toY} r={(f.potion==='freeze'?45:18)+35*t} fill="currentColor" opacity=".18"/>{Array.from({length:7},(_,i)=>{const a=i*Math.PI*2/7,x=f.toX+Math.cos(a)*(12+46*t),y=f.toY+Math.sin(a)*(12+32*t)+15*t*t;return <path key={i} d="M-4-5 5 0-2 5z" transform={`translate(${x} ${y}) rotate(${i*51+t*120})`} fill={i%2?color:'#e8f3dc'}/>;})}</g>;})}



<PaletteGroup className="chronos-environment" amount={0} fill="#2a4939"><path d="M0 600V550q42-22 73 5l34 45zM720 600V520q-69-5-119 80z"/></PaletteGroup>
{battle.vineGrab&&<g key={`vine-${battle.vineGrab.started}`} className="sneaky-vine-grab" pointerEvents="none" aria-label="Sneaky Vine grabs the furthest enemy from behind and drags them backwards">{(()=>{const grab=battle.vineGrab,x=battle.enemies.find(e=>e.id===grab.targetId)?.x??grab.x,y=grab.y;return <><path d={`M760 ${y-16} C700 ${y-50} ${x+75} ${y+24} ${x+18} ${y}`} fill="none" stroke="#263e28" strokeWidth="12"/><path d={`M760 ${y-16} C700 ${y-50} ${x+75} ${y+24} ${x+18} ${y}`} fill="none" stroke="#88ad58" strokeWidth="6"/><ellipse cx={x} cy={y} rx="36" ry="20" fill="none" stroke="#263e28" strokeWidth="11"/><ellipse cx={x} cy={y} rx="36" ry="20" fill="none" stroke="#88ad58" strokeWidth="5"/><path d={`M${x+48} ${y-4}q-9-34 18-28q4 20-18 28M${x+83} ${y}q8 29 28 15q-3-18-28-15`} fill="#9bbe72" stroke="#365a37" strokeWidth="2"/></>;})()}</g>}
{flashBurst&&<g key={flashBurst.serial} transform={`translate(${flashBurst.x} 410) scale(0.75)`} pointerEvents="none" aria-label="Black Flash explosion"><g className="black-flash-explosion"><circle r="78" fill="#09070c"/><path d="M0-112 18-62 62-85 50-38 116-22 66 4 104 63 45 48 22 110 0 65-43 99-39 42-109 52-64 6-112-35-51-37-60-96-18-61Z" fill="#e11c38" stroke="#10070d" strokeWidth="8"/><circle r="39" fill="#08060a"/><path d="m-16-58 28 40-23 9 30 59M-71-14l38 15-10 20 32 7M32-37l-6 25 31 4 22 24" fill="none" stroke="#ff5470" strokeWidth="7"/></g></g>}
<ChronosClock frame={chronosClockFrame(battle)} y={510-viewHeight+140}/>
</svg></div>;
}
