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
 dismissAfterCast(id:SpellId,cooldown:number){
  if(this.spellId!==id||this.until!==Infinity||cooldown<=10)return false;
  this.hide();
  return true;
 }
 hide(){this.spellId=null;}
}
