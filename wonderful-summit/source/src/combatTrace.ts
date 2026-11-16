import type {SpellId} from './magic.ts';
export type PlayMode='apprentice'|'expert';
/** All deadlines use battle time, so pause/hidden time does not consume a trace or cooldown. */
export class CombatTrace{
 spellId:SpellId|null=null;
 until=0;
 readyAt=0;
 canSelect(mode:PlayMode,time:number){return mode==='apprentice'||time>=this.readyAt;}
 select(id:SpellId,known:SpellId[],mode:PlayMode,time:number){
  if(!known.includes(id)||!this.canSelect(mode,time))return false;
  this.spellId=id;this.until=mode==='apprentice'?Infinity:time+2;this.readyAt=mode==='apprentice'?time:time+12;return true;
 }
 advance(time:number){if(this.spellId&&time>=this.until){this.spellId=null;return true;}return false;}
 hide(){this.spellId=null;}
}
