import type {SpellId} from './magic';
export type NearSpell='flameBlade'|'puddleGuard'|'thistleBush';
export function isNearSpell(id:SpellId):id is NearSpell{return ['flameBlade','puddleGuard','thistleBush'].includes(id);}
function tierValue(q:number,ranges:number[][]){if(!Number.isFinite(q)||q<48)return 0;const quality=Math.min(100,q),tier=quality<60?0:quality<70?1:quality<80?2:3,[lo,hi]=[[48,59],[60,69],[70,79],[80,100]][tier],[min,max]=ranges[tier];return min+(max-min)*(quality-lo)/(hi-lo);}
export function nearDamage(id:NearSpell,q:number,upgrade=0){if(id==='puddleGuard'||!Number.isFinite(q)||q<48)return 0;return tierValue(q,id==='flameBlade'?[[24,34],[45,58],[70,90],[105,140]]:[[1.25,1.75],[2.25,2.75],[3.25,3.75],[4.25,5.25]])*(id==='flameBlade'?1.16*.79*.95:1)+(id==='thistleBush'?.4*Math.max(0,Math.min(1,upgrade)):0);}
export function nearKnockback(id:NearSpell,q:number){return tierValue(q,id==='puddleGuard'?[[64.4,103.04],[115.92,167.44],[180.32,231.84],[244.72,322]]:id==='flameBlade'?[[8,12],[14,18],[20,25],[28,35]]:[[0,0],[0,0],[0,0],[0,0]]);}
export function thistleStats(q:number,upgrade=0){return{range:tierValue(q,[[80,90],[95,110],[115,130],[135,150]]),budget:Math.round(tierValue(q,[[30.08,45.12],[56.4,82.72],[94,127.84],[142.88,188]])*(1+.15*Math.max(0,Math.min(1,upgrade)))*1e6)/1e6};}
