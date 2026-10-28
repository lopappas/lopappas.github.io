import type {Element} from './magic.ts';
// Shields belong to the enemy as a trait, independent of species or elemental immunity.
export type EnemyShield={material:'wood';burnUntil:number|null};
export const SHIELD_BURN_SECONDS=2;
export function woodenShield():EnemyShield{return{material:'wood',burnUntil:null};}
export function shieldProtection(shield:EnemyShield|null|undefined,time=0){return shield&&(shield.burnUntil===null||time<shield.burnUntil)?.5:1;}
export function igniteShield(shield:EnemyShield|null,element:Element,quality:number,time:number){return shield?.material==='wood'&&shield.burnUntil===null&&element==='Fire'&&quality>=48?{...shield,burnUntil:time+SHIELD_BURN_SECONDS}:shield;}
export function updateShield(shield:EnemyShield|null,time:number){if(shield?.burnUntil!=null&&time+1e-9>=shield.burnUntil)return null;return shield;}
