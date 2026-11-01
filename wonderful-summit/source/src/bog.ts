export type BogPortion={until:number;quality:number;upgrade:number;damageBonus:number;multiplier:number;midnight:number;twilight:boolean;hitIds:number[]};
export type Bog={started:number;arrives:number;nextTick:number;portions:BogPortion[]};
export function bogEffect(quality:number,upgrade=0){
 if(!Number.isFinite(quality)||quality<48)return{duration:0,slow:0,damage:0};
 const q=Math.min(100,quality),[lo,hi,d0,d1,u0,u1,s0,s1,damage]=q<60?[48,59,5,6,6,7,.5,.55,1]:q<70?[60,69,7.5,9.5,9,11,.6,.64,1.5]:q<80?[70,79,12,15,14,17,.66,.7,2]:[80,100,18,24,20,28,.74,.78,2.5];
 const t=(q-lo)/(hi-lo),up=upgrade>=1?1:0;
 return{duration:Math.round(((up?u0:d0)+((up?u1:d1)-(up?u0:d0))*t)*1000)/1000,slow:s0+(s1-s0)*t+up*.08,damage:damage+up};
}
export function extendBog(bog:Bog|null,time:number,portion:Omit<BogPortion,'until'|'hitIds'>):Bog|null{
 const effect=bogEffect(portion.quality,portion.upgrade);if(!effect.duration)return bog;
 const current=bog&&(bog.portions.at(-1)?.until??0)>time+1e-9?bog:null;
 const arrives=current?.arrives??time+1;
 return{started:current?.started??time,arrives,nextTick:current?.nextTick??arrives+.5,portions:[...(current?.portions??[]),{...portion,until:(current?.portions.at(-1)?.until??arrives)+effect.duration,hitIds:[]}]};
}

