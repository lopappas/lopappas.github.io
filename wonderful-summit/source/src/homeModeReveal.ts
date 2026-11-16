type Schedule=(callback:()=>void,delay:number)=>()=>void;
const later:Schedule=(callback,delay)=>{const timer=setTimeout(callback,delay);return()=>clearTimeout(timer);};
/** Keep choices initially transparent, then enable focus only after their fade completes. */
export function revealHomeModes(show:()=>void,ready:()=>void,reducedMotion=false,schedule:Schedule=later){
 const cancelShow=schedule(show,reducedMotion?0:180),cancelReady=schedule(ready,reducedMotion?0:500);
 return()=>{cancelShow();cancelReady();};
}
