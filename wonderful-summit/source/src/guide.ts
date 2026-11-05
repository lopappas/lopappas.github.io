export const GUIDE_DURATION_MS=1500;
export const BOOK_TRANSITION_MS=500;

// Prevent overlapping previews only. A finished trace is immediately available again.
export class GuideCooldown {
 private active=false;
 isReady(now:number):boolean{return !this.active;}
 tryStart(now:number):boolean{
  if(!this.isReady(now))return false;
  this.active=true;
  return true;
 }
 finish(now:number){
  if(!this.active)return;
  this.active=false;
 }
}

export function bookTiming(bookWorm=false){return{openMs:BOOK_TRANSITION_MS-(bookWorm?250:0),traceMs:GUIDE_DURATION_MS+(bookWorm?500:0)};}

