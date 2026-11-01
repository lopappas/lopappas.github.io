import {BogArt} from './BogArt';
import {TidalcrestArt} from './TidalcrestArt';
import {FirestormArt} from './FirestormArt';
import React,{useEffect,useRef,useState} from 'react';
import {TargetCaret} from './TargetCaret';
import {PaletteGroup,grayPaint} from './PaletteGroup';
import {WoodenShieldArt} from './WoodenShieldArt';
import {PetPurse} from './PetPurse';
import {chronosAffected,chronosGrayAmount,chronosVisuals,enemyStatusLabel} from './timeVisuals';
import {EnemyEffects} from './EnemyEffects';
import {enemyElementColor,presentEnemies,projectilePosition,enemyY,targetedEnemy,potionPosition,POTION_FLIGHT_SECONDS,POTION_BREAK_SECONDS,type Battle} from './battle';
export function World({burst,color,battle,hasRelics=false,practice=false}:{burst:number;color:string;battle:Battle;hasRelics?:boolean;practice?:boolean}){
const [sad,setSad]=useState(false),[viewHeight,setViewHeight]=useState(410),[cloudY,setCloudY]=useState(210);
const worldRef=useRef<HTMLDivElement>(null);
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
const orb=projectilePosition(battle),target=targetedEnemy(battle),timeVisual=chronosVisuals(battle);
const envPaint=(color:string)=>grayPaint(color,timeVisual.environmentAmount) as string;
return <div className={`world${timeVisual.environment||presentEnemies(battle).some(e=>chronosAffected(e,battle.time))?' time-denied':''}`} ref={worldRef}><svg viewBox={`0 ${510-viewHeight} 720 ${viewHeight}`} preserveAspectRatio="xMidYMax slice" aria-label={practice?"Fila practices spells with a golden slime":"Fila faces the enemies, paintbrush in hand"} role="img">
<defs><linearGradient id="sky" x2="0" y2="1"><stop stopColor={envPaint('#abbebb')}/><stop offset="1" stopColor={envPaint('#e0dbc0')}/></linearGradient><linearGradient id="ground" x2="0" y2="1"><stop stopColor={envPaint('#6b895d')}/><stop offset="1" stopColor={envPaint('#283e36')}/></linearGradient><radialGradient id="glow"><stop stopColor={envPaint('#fff3c4')} stopOpacity=".7"/><stop offset="1" stopColor={envPaint('#fff3c4')} stopOpacity="0"/></radialGradient><filter id="soft"><feGaussianBlur stdDeviation="2"/></filter><pattern id="grass" width="50" height="37" patternUnits="userSpaceOnUse"><path d="M8 32l-3-6m4 4 3-6m22 7 3-5" stroke={envPaint('#b8c17c')} opacity=".2" fill="none"/></pattern><radialGradient id="chronos-white"><stop stopColor="#fff"/><stop offset="1" stopColor="#fff" stopOpacity="0"/></radialGradient></defs>
<PaletteGroup className="chronos-environment" amount={timeVisual.environmentAmount}>
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
</PaletteGroup>
<FirestormArt storm={battle.firestorm} time={battle.time} gray={timeVisual.environmentAmount} cloudY={cloudY}/>
<BogArt bog={battle.bog} time={battle.time} gray={timeVisual.environmentAmount}/><TidalcrestArt battle={battle} gray={timeVisual.environmentAmount}/>
{battle.playerHits>0&&<g key={`ward-${battle.playerHits}`} transform="translate(295 410)" aria-label="Light blue magic flashes when Fila is hit"><g className="magic-hit-flash"><circle r="22" fill="#a9e7ff" opacity=".28"/><circle r="16" fill="none" stroke="#b4eeff" strokeWidth="3"/><path d="M0-29V-21M0 21v8M-29 0h8M21 0h8M-19-19l5 5M14 14l5 5M19-19l-5 5M-14 14l-5 5" fill="none" stroke="#d7f6ff" strokeWidth="3" strokeLinecap="round"/></g></g>}
<g key={battle.playerHits} className={battle.playerHits?'fila-recoil':''}><g className="fila" shapeRendering="crispEdges" transform="translate(190 320) scale(5)" aria-label="Fila, a little pixel witch holding a paintbrush">
{battle.rejectionUntil>battle.time&&<path d="M9 0h4v2h2v3h2v4h3v3H2V9h3V5h2V2h2zM5 12h12v8h-2v2h3v3h2v5h-3v2h-5v-2H9v2H4v-4H2v-5h2v-3H3v-6h2z" fill="#fff" stroke="#fff" strokeWidth="3" opacity=".65" className="rejection-aura"/>}
{/* A tiny stepped silhouette and a limited palette keep Fila readable at phone size. */}
<path d="M9 0h4v2h2v3h2v4h3v3H2V9h3V5h2V2h2zM5 12h12v8h-2v2h3v3h2v5h-3v2h-5v-2H9v2H4v-4H2v-5h2v-3H3v-6h2z" fill="#352e46"/>
<path d="M9 2h4v3h2v4H6V5h3zM4 9h14v2H4z" fill="#9c83bc"/>
<path d="M6 7h10v2H6z" fill="#e5bb7e"/>
<path d="M5 12h12v3H5zM4 15h3v6H4zM15 14h2v7h-2z" fill="#6c4951"/>
<path d="M7 14h8v6H7zM9 20h4v2H9z" fill="#f2cea6"/>
<path d="M9 16h1v2H9zM13 16h1v2h-1z" fill="#352e46"/>
<path d="M6 22h9v3h2v3H4v-3h2z" fill="#9c83bc"/>
<path d="M6 24h9v1H6z" fill="#e5bb7e"/>
<path d="M5 29h4v2H5zM12 29h4v2h-4z" fill="#352e46"/>
{/* Broad bristles, a gold ferrule, and a wooden handle make this a paintbrush. */}
<path d="M20 9h5v7h-1v12h-3V16h-1z" fill="#352e46"/>
<path d="M21 10h3v4h-3z" fill="#efd7ad"/>
<path d="M21 10h3v2h-3z" fill="#c0a1df"/>
<path d="M21 14h3v2h-3z" fill="#e5bb7e"/>
<path d="M22 16h1v11h-1z" fill="#b58255"/>
<path d="M15 22h4v2h-4z" fill="#9c83bc"/>
<path d="M19 22h4v2h-4z" fill="#f2cea6"/>
</g></g>
<g className="purse" transform="translate(152 395) scale(1.18)"><PetPurse sad={sad}/></g>
{presentEnemies(battle).map(e=>{const frozen=battle.freezeUntil>battle.time,status=enemyStatusLabel(e,battle),color=practice?'#e6b844':e.rocky?'#a5aaa4':e.element==='Fire'?'#ef9c70':e.element==='Water'?'#7ccbd6':e.element==='Nature'?'#99bf76':'#bcc3a2';return <PaletteGroup key={e.id} amount={chronosGrayAmount(e,battle.time)} transform={`translate(${e.x} ${enemyY(e.id,battle.encounter)})`} aria-label={practice?'A non-elemental golden practice slime':`${e.rocky?'Rock':e.element} ${e.kind}: ${e.hp} of ${e.maxHP} health`}>
<ellipse cy="22" rx={e.kind==='mother'?72:38} ry="7" fill="#203d32" opacity=".35"/>{battle.phase==='active'&&target?.id===e.id&&<TargetCaret element={e.element} mother={e.kind==='mother'}/>}
<g transform={e.kind==='mother'?'scale(2.1)':undefined}><g className={`${e.kind==='goblin'?'goblin':'slime'}${e.stunUntil>battle.time?' stunned':''}${(e.shield?.burnUntil??0)>battle.time?' shield-burning':''}${e.hurtUntil>battle.time?' slime-hit':''}${e.attackAt!==null?' slime-attacking':''}`} style={{filter:frozen?'hue-rotate(100deg) brightness(1.2)':undefined}}>
{e.kind!=='goblin'?<><path d="M-36 12v-24h6v-16h10v-8h36v6h12v12h8v30h-6v8h-60v-8z" fill={practice?'#8c6224':'#2d493d'}/><path d="M-30 12v-22h6v-14h12v-6h24v6h12v12h6v24h-6v4h-48v-4z" fill={e.attackAt!==null?'#ebd588':color}/><path d="M-21-13v-7h9v-4h17v5h-16v6z" fill={practice?'#fff0a5':'#e3dfb0'}/><path d="M-13-9h5v8h-5zM10-9h5v8h-5zM-3 6h9v3h-9z" fill="#2d493d"/>{e.rocky&&<g shapeRendering="crispEdges"><path d="M-25-22h11v8h-11zM9-26h12v9H9zM-31 1h8v12h-8zM21 4h8v9h-8z" fill="#717d78"/><path d="M-10-28h6v5h5v7M19-13v7h6" fill="none" stroke="#53615b" strokeWidth="2"/></g>}</>:<g shapeRendering="crispEdges"><path d="M-29-50h58v33H-29zM-40-43h11v12h-11zM29-43h11v12H29z" fill="#91ac65"/><path d="M-21-49h43v9h-43zM-14-39h7v7h-7zM10-39h7v7h-7z" fill="#354132"/><path d="M-12-22h25v5h-25z" fill="#e7d7ae"/><path d="M-23-15h46v34h-46zM-28 17h18v8h-18zM11 17h18v8H11z" fill="#74584b"/><path d="M-18-10h36v7h-36z" fill="#bc9764"/><path d="M-45-15h14v47h-14zM-50-25h24v12h-24z" fill="#6b6760"/><path d="M-18-58h9v8h-9zM-4-63h9v13h-9zM10-58h9v8h-9z" fill="#dbba70"/></g>}
</g></g>
{e.shield&&<WoodenShieldArt shield={e.shield} time={battle.time}/>}
<EnemyEffects enemy={e} time={battle.time}/>
{!practice&&<><rect x={e.kind==='mother'?-90:e.rocky?-62:-47} y={e.kind==='mother'?-130:e.kind==='goblin'?-83:-62} width={e.kind==='mother'?180:e.rocky?124:94} height="22" rx="5" fill="#233b32dd"/>
<text y={e.kind==='mother'?-114:e.kind==='goblin'?-67:-46} textAnchor="middle" fill={color} fontSize="17" fontFamily="Fredoka">{e.kind==='mother'?'Slime Mother':e.rocky?'Rock slime':e.kind==='goblin'?'Elite':e.element==='Neutral'?'Slime':e.element} {Math.ceil(e.hp)}</text>
<rect x="-39" y={e.kind==='mother'?-105:e.kind==='goblin'?-59:-38} width="78" height="6" rx="3" fill="#294034"/><rect x="-39" y={e.kind==='mother'?-105:e.kind==='goblin'?-59:-38} width={78*e.hp/e.maxHP} height="6" rx="3" fill="#d68c88"/>
{e.kind==='mother'&&<text y={-84} textAnchor="middle" fill={color} fontSize="16" fontFamily="Fredoka">{e.element}</text>}
</>}
{e.attackAt!==null&&<text x="45" y="-27" fill="#f4aa80" fontSize="30">!</text>}
{status&&<text x="0" y={e.kind==='mother'?-145:-97} textAnchor="middle" fill="#ece2b7" fontSize="18">{status}</text>}
</PaletteGroup>;})}
{battle.motherSplit&&battle.time-battle.motherSplit.at<2.6&&(()=>{
 const split=battle.motherSplit,age=battle.time-split.at,c=split.element==='Fire'?'#ef9c70':split.element==='Water'?'#7ccbd6':'#99bf76';
 return <g transform={`translate(${split.x} ${enemyY(1)})`} pointerEvents="none" aria-label={age<2?'Slime Mother trembles before splitting':'Slime Mother bursts into three slimes'}>
 {age<2?<g transform={`translate(${Math.sin(age*30)*age*2} 0) scale(${2.1+age*.12} ${2.1-age*.2})`}><path d="M-36 12v-24h6v-16h10v-8h36v6h12v12h8v30h-6v8h-60v-8z" fill="#2d493d"/><path d="M-30 12v-22h6v-14h12v-6h24v6h12v12h6v24h-6v4h-48v-4z" fill={c}/><path d="m-16-8 8 6m-8 0 8-6m16 0 8 6m-8 0 8-6" stroke="#2d493d" strokeWidth="3"/><path d="M-3 6h9v3h-9z" fill="#2d493d"/></g>:<g opacity={Math.max(0,1-(age-2)/.6)}><circle r={20+(age-2)*180} stroke={c} strokeWidth="9" fill="none"/>{Array.from({length:12},(_,i)=>{const a=i*Math.PI/6,r=25+(age-2)*180;return <rect key={i} x={Math.cos(a)*r-6} y={Math.sin(a)*r*.65-6} width="12" height="12" fill={i%2?c:'#e9e8bb'}/>;})}</g>}
 </g>;
})()}
{orb&&battle.projectile&&battle.projectile.spellId!=='chronos'&&<g className="spell-orb" style={{color:battle.projectile.color}} aria-label="Spell orb travelling toward its target"><circle cx={orb.x} cy={orb.y} r="16" fill="currentColor" opacity=".22"/><circle cx={orb.x} cy={orb.y} r="9" fill="currentColor"/><circle cx={orb.x-2} cy={orb.y-3} r="3" fill="#fff3dc" opacity=".85"/></g>}
{battle.phase==='active'&&battle.potionFlights.map(f=>{const p=potionPosition(f,battle.time),color=(f.potion==='heal'||f.potion==='theodoraHeal')?'#ec929d':f.potion==='ink'?'#c49aeb':f.potion==='fury'?'#bd384e':f.potion==='rejection'?'#ffffff':f.potion==='spellBottle'?'#bfa1e8':'#8ed6eb',age=battle.time-f.started-POTION_FLIGHT_SECONDS;if(age<0)return <g key={f.id} transform={`translate(${p.x} ${p.y}) rotate(${p.rotation})`} aria-label="Potion bottle flying from purse"><path d="M-5-18h10v8l7 6v17H-12V-4l7-6z" fill="#dce9dc" stroke="#4f6356" strokeWidth="2"/><path d="M-9 0h18v11H-9z" fill={color}/><path d="M-6-21H6v5H-6z" fill="#b6925e"/><path d="M-7-3v10" stroke="#fff6d5" strokeWidth="2" opacity=".7"/></g>;
const t=Math.min(1,age/POTION_BREAK_SECONDS);return <g key={f.id} opacity={1-t} aria-label="Potion bottle breaking" style={{color}}><circle cx={f.toX} cy={f.toY} r={(f.potion==='freeze'?45:18)+35*t} fill="currentColor" opacity=".18"/>{Array.from({length:7},(_,i)=>{const a=i*Math.PI*2/7,x=f.toX+Math.cos(a)*(12+46*t),y=f.toY+Math.sin(a)*(12+32*t)+15*t*t;return <path key={i} d="M-4-5 5 0-2 5z" transform={`translate(${x} ${y}) rotate(${i*51+t*120})`} fill={i%2?color:'#e8f3dc'}/>;})}</g>;})}



{timeVisual.pulse&&<circle cx="245" cy="405" r={timeVisual.pulse.radius} opacity={timeVisual.pulse.opacity} fill="url(#chronos-white)" pointerEvents="none" aria-label={timeVisual.pulse.strong?'Large Chronos white flash':'Small Chronos white flash'}/>}
<PaletteGroup className="chronos-environment" amount={timeVisual.environmentAmount} fill="#2a4939"><path d="M0 600V550q42-22 73 5l34 45zM720 600V520q-69-5-119 80z"/></PaletteGroup>
</svg></div>;
}

