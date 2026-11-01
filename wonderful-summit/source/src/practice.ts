import {SPELLS,isUpgradableSpell} from './magic.ts';
import {newBattle,stepBattle,bogSlow,type Battle} from './battle.ts';
import {newRun,type Run} from './run.ts';

export const SCARECROW_HEALTH=1_000_000;
export function practiceJourney(upgraded=false):Run{return {...newRun(),screen:'battle',spells:SPELLS.map(s=>s.id),potions:{heal:0,freeze:0,ink:0},upgrades:upgraded?Object.fromEntries(SPELLS.filter(s=>isUpgradableSpell(s.id)).map(s=>[s.id,1])):{}};}
export function newPracticeBattle(journey:Run):Battle{
 const battle=newBattle('active','slime',()=>0);
 return {...battle,robes:{enabled:journey.relics.includes('filadoraRobes')||journey.relics.includes('artisanRobes'),artisan:journey.relics.includes('artisanRobes'),spells:[...journey.wonderfulSpells]},approachAt:0,potions:{heal:0,freeze:0,ink:0},upgrades:{...journey.upgrades},enemies:[{...battle.enemies[0],element:'Neutral',initialElement:'Neutral',hp:SCARECROW_HEALTH,maxHP:SCARECROW_HEALTH,x:560}]};
}
export function restoreScarecrow(battle:Battle,mobile:boolean):Battle{return {...battle,phase:'active',playerHP:100,playerHits:0,enemies:battle.enemies.map(e=>({...e,hp:SCARECROW_HEALTH,maxHP:SCARECROW_HEALTH,attackAt:null,x:mobile?Math.max(420,Math.min(640,e.x)):560,push:mobile?e.push:null}))};}
export function practiceDamage(battle:Battle){return Math.max(0,SCARECROW_HEALTH-battle.enemies[0].hp);}
export function stepPracticeBattle(battle:Battle,delta:number,mobile:boolean,direction:1|-1){
 const next=stepBattle(battle,delta);if(next===battle)return {battle,direction};
 const old=battle.enemies[0],enemy=next.enemies[0];
 // Reuse real combat timing, slows, roots, burns and projectiles. Reflect only patrol movement.
 if(mobile&&!old.push&&!enemy.push){
  const travel=Math.max(0,old.x-enemy.x);
  enemy.x=Math.max(420,Math.min(640,old.x+direction*travel));
  if(enemy.x<=420)direction=1;else if(enemy.x>=640)direction=-1;
 }
 if(!mobile){enemy.x=560;enemy.push=null;}
 return {battle:next,direction};
}
export function practiceEffects(battle:Battle){
 const e=battle.enemies[0],now=battle.time,out:string[]=[];
 if(e.burn)out.push(`Burning · ${e.burn.ticks} ticks`);
 const slow=Math.max(bogSlow(battle,e,now),now<e.chronosSlowUntil?.55:0,...e.leafSlows.filter(s=>s.until>now).map(s=>s.amount));
 if(slow>0)out.push(`Slowed ${Math.round(slow*100)}%`);
 if(e.stunUntil>now)out.push(`Time stopped ${(e.stunUntil-now).toFixed(1)}s`);
 if(e.rootUntil>now)out.push(`Rooted ${(e.rootUntil-now).toFixed(1)}s`);
 if(e.push)out.push('Knockback');
 if(battle.firestorm)out.push(`Firestorm ${Math.max(0,battle.firestorm.portions.at(-1)!.until-now).toFixed(1)}s`);
 if(battle.bog)out.push(`Drudge Bog ${Math.max(0,battle.bog.portions.at(-1)!.until-now).toFixed(1)}s`);
 return out;
}
