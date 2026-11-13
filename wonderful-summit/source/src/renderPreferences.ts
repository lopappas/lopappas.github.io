let saver=false;
const listeners=new Set<()=>void>();
export const batterySaver=()=>saver;
export const subscribeRenderPreferences=(fn:()=>void)=>{listeners.add(fn);return()=>{listeners.delete(fn);};};
export function setBatterySaver(value:boolean){saver=value;listeners.forEach(fn=>fn());}
/** Simulation continues at its original cadence; only visual publications are limited. */
export function publishVisualFrame(previousTime:number,time:number,saving:boolean,immediate=false){return !saving||immediate||time<previousTime||Math.floor(time*30+1e-6)!==Math.floor(previousTime*30+1e-6);}
