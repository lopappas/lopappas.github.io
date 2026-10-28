export const GUIDE_DURATION_MS=1500;
export const BOOK_TRANSITION_MS=500;
export const GUIDE_COOLDOWN_MS=8000;

// Shared across all spell pages and close methods. Reading the book never resets it.
export class GuideCooldown {
 private active=false;
 private readyAt=-Infinity;
 tryStart(now:number):boolean{
  if(this.active||now<this.readyAt)return false;
  this.active=true;
  return true;
 }
 finish(now:number){
  if(!this.active)return;
  this.active=false;
  this.readyAt=now+GUIDE_COOLDOWN_MS;
 }
}
