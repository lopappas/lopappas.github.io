import {presentEnemies,eliteRush,type Battle,type Enemy} from './battle.ts';
export function chronosAffected(enemy:Enemy,time:number){return enemy.chronosSlowUntil>time||enemy.stunUntil>time;}
export function chronosVisuals(battle:Battle){
 const environment=presentEnemies(battle).some(e=>e.stunUntil>battle.time),event=battle.chronosPulse;
 if(!event)return{environment,pulse:null};
 const duration=event.strong?.45:.28,t=(battle.time-event.started)/duration;
 return{environment,pulse:t<0||t>=1?null:{radius:(event.strong?70:30)+(event.strong?300:65)*t,opacity:(1-t)**2*.9,strong:event.strong}};
}
export function enemyStatusLabel(enemy:Enemy,battle:Battle){
 if(battle.freezeUntil>battle.time)return '❄';
 if(enemy.burn)return 'Burn';
 if(enemy.slowUntil>battle.time&&!chronosAffected(enemy,battle.time))return 'Slow';
 const rush=eliteRush(enemy);return rush==='warning'?'Rush…':rush==='rush'?'Rush!':null;
}
