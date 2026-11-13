export class FrameBatch{
 private pending:number|null=null;
 private request:(callback:()=>void)=>number;
 private cancel:(id:number)=>void;
 constructor(request:(callback:()=>void)=>number,cancel:(id:number)=>void){this.request=request;this.cancel=cancel;}
 schedule(callback:()=>void){if(this.pending!==null)return;this.pending=this.request(()=>{this.pending=null;callback();});}
 clear(){if(this.pending!==null)this.cancel(this.pending);this.pending=null;}
}
