/** Bounded, opt-in counters. No logging, network calls, or timing reads while disabled. */
export class PerformanceMetrics{
 enabled=false;
 private samples:{interval:number;step:number}[]=[];
 private commits=0;
 private worldCommits=0;
 private frames=0;
 private activeMs=0;
 reset(){this.samples=[];this.commits=0;this.worldCommits=0;this.frames=0;this.activeMs=0;}
 recordFrame(interval:number,step:number){
  if(!this.enabled||!Number.isFinite(interval)||interval<=0||!Number.isFinite(step)||step<0)return;
  this.samples.push({interval,step});if(this.samples.length>600)this.samples.shift();
  this.frames++;this.activeMs+=interval;
 }
 recordWorldCommit(){if(this.enabled)this.worldCommits++;}
 recordCommit(){if(this.enabled)this.commits++;}
 snapshot(){
  const n=this.samples.length,intervals=this.samples.map(s=>s.interval).sort((a,b)=>a-b),sum=intervals.reduce((a,b)=>a+b,0);
  return{enabled:this.enabled,frames:this.frames,activeSeconds:this.activeMs/1000,windowFrames:n,updatesPerSecond:sum?n*1000/sum:0,p95IntervalMs:n?intervals[Math.ceil(n*.95)-1]:0,maxIntervalMs:n?intervals[n-1]:0,meanStepMs:n?this.samples.reduce((s,v)=>s+v.step,0)/n:0,worldCommits:this.worldCommits,worldCommitsPerActiveSecond:this.activeMs?this.worldCommits*1000/this.activeMs:0,commits:this.commits,commitsPerActiveSecond:this.activeMs?this.commits*1000/this.activeMs:0};
 }
}
export const performanceMetrics=new PerformanceMetrics();
const listeners=new Set<()=>void>();
export function setPerformanceEnabled(enabled:boolean){performanceMetrics.enabled=enabled;performanceMetrics.reset();listeners.forEach(fn=>fn());}
export const subscribePerformance=(callback:()=>void)=>{listeners.add(callback);return()=>{listeners.delete(callback);};};
export const performanceEnabled=()=>performanceMetrics.enabled;
