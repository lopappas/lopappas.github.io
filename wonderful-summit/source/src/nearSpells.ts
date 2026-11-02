import type {SpellId} from './magic';
export type NearSpell='flameBlade'|'puddleGuard'|'thistleBush';
export function isNearSpell(id:SpellId):id is NearSpell{return ['flameBlade','puddleGuard','thistleBush'].includes(id);}
function tierValue(q:number,ranges:number[][]){if(!Number.isFinite(q)||q<48)return 0;const quality=Math.min(100,q),tier=quality<60?0:quality<70?1:quality<80?2:3,[lo,hi]=[[48,59],[60,69],[70,79],[80,100]][tier],[min,max]=ranges[tier];return min+(max-min)*(quality-lo)/(hi-lo);}
export function nearDamage(id:NearSpell,q:number){return tierValue(q,id==='flameBlade'?[[24,34],[45,58],[70,90],[105,140]]:id==='puddleGuard'?[[3,5],[6,8],[9,12],[13,18]]:[[1.5,2],[2.5,3],[3.5,4],[4.5,5.5]])*(id==='flameBlade'?1.16:1);}
export function nearKnockback(id:NearSpell,q:number){return tierValue(q,id==='puddleGuard'?[[100,160],[180,260],[280,360],[380,500]]:id==='flameBlade'?[[8,12],[14,18],[20,25],[28,35]]:[[0,0],[0,0],[0,0],[0,0]]);}
export function thistleStats(q:number){return{range:tierValue(q,[[80,90],[95,110],[115,130],[135,150]]),budget:tierValue(q,[[40,60],[75,110],[125,170],[190,250]])};}
