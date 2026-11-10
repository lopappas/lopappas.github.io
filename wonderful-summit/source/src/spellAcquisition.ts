export const SPELL_ACQUIRE_MS=600;
/** A completed hold can commit once; canceled or interrupted holds never carry over. */
export class SpellAcquisition{
 private started:number|null=null;
 private committed=false;
 progress=0;
 start(now:number){if(this.started!==null||this.committed)return false;this.started=now;this.progress=0;return true;}
 cancel(){this.started=null;if(!this.committed)this.progress=0;}
 advance(now:number){
  if(this.started===null||this.committed)return false;
  this.progress=Math.max(0,Math.min(1,(now-this.started)/SPELL_ACQUIRE_MS));
  if(this.progress<1)return false;
  this.committed=true;this.started=null;return true;
 }
}
