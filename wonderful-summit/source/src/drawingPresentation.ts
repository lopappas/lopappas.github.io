/** Independent drawing signals: progress and ink do not invalidate the combat component. */
export class DrawingPresentation{
 private ink=100;
 private charge=0;
 private inkListeners=new Set<()=>void>();
 private chargeListeners=new Set<()=>void>();
 getInk=()=>this.ink;
 getCharge=()=>this.charge;
 subscribeInk=(fn:()=>void)=>{this.inkListeners.add(fn);return()=>{this.inkListeners.delete(fn);};};
 subscribeCharge=(fn:()=>void)=>{this.chargeListeners.add(fn);return()=>{this.chargeListeners.delete(fn);};};
 setInk(value:number){if(value===this.ink)return;this.ink=value;this.inkListeners.forEach(fn=>fn());}
 setCharge(value:number){if(value===this.charge)return;this.charge=value;this.chargeListeners.forEach(fn=>fn());}
}
export function inkControlBand(value:number){return value<=0?'empty':value>=99.99?'full':'partial';}
export type CanvasRect={left:number;top:number;width:number;height:number};
export class CanvasLayout{
 private rect:CanvasRect|null=null;
 private read:()=>CanvasRect;
 constructor(read:()=>CanvasRect){this.read=read;}
 invalidate=()=>{this.rect=null;};
 get(){return this.rect??this.refresh();}
 refresh(){const r=this.read();this.rect={left:r.left,top:r.top,width:r.width,height:r.height};return this.rect;}
}
