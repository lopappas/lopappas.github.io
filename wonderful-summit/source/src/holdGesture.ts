export const DEVELOPER_HOLD_MS=1500;
/** One-shot hold: release, movement, or unmount cancels pending activation. */
export class HoldGesture{
 private timer:ReturnType<typeof setTimeout>|null=null;
 consumed=false;
 start(action:()=>void){this.cancel();this.consumed=false;this.timer=setTimeout(()=>{this.timer=null;this.consumed=true;action();},DEVELOPER_HOLD_MS);}
 cancel(){if(this.timer!==null)clearTimeout(this.timer);this.timer=null;}
 click(){if(this.consumed){this.consumed=false;return false;}return true;}
}
