import {presentEnemies,eliteRush,type Battle,type Enemy} from './battle.ts';
export function chronosAffected(enemy:Enemy,time:number){return enemy.chronosSlowUntil>time||enemy.stunUntil>time;}
export function grayEnvelope(start:number,end:number,time:number){if(end<=0||time<start)return 0;return Math.max(0,Math.min(1,(time-start)/.18,time<=end?1:1-(time-end)/.18));}
export function chronosGrayAmount(enemy:Enemy,time:number){return grayEnvelope(enemy.chronosStartedAt,Math.max(enemy.chronosSlowUntil,enemy.stunUntil),time);}
export function chronosVisuals(battle:Battle){
 const live=presentEnemies(battle),environment=live.some(e=>e.stunUntil>battle.time),environmentAmount=live.reduce((amount,e)=>Math.max(amount,grayEnvelope(e.stunStartedAt,e.stunUntil,battle.time)),0),event=battle.chronosPulse;
 if(!event)return{environment,environmentAmount,pulse:null};
 const duration=event.strong?.45:.28,t=(battle.time-event.started)/duration;
 return{environment,environmentAmount,pulse:t<0||t>=1?null:{radius:(event.strong?70:30)+(event.strong?300:65)*t,opacity:(1-t)**2*.9,strong:event.strong}};
}
export function enemyStatusLabel(enemy:Enemy,battle:Battle){
 if(battle.freezeUntil>battle.time)return '❄';
 if(enemy.burn)return 'Burn';
 if(enemy.slowUntil>battle.time&&!chronosAffected(enemy,battle.time))return 'Slow';
 const rush=eliteRush(enemy);return rush==='warning'?'Rush…':rush==='rush'?'Rush!':null;
}
