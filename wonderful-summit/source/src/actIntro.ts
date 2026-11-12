export const ACT_INTRO_HOLD_MS=750;
export const ACT_INTRO_PAN_MS=650;
/** A destination reveal followed by a quick, eased descent to the first stop. */
export function actIntroFrame(elapsed:number,maxScroll:number,reducedMotion=false){
 const bottom=Math.max(0,maxScroll),pan=reducedMotion||bottom===0?0:ACT_INTRO_PAN_MS;
 const progress=pan?Math.max(0,Math.min(1,(elapsed-ACT_INTRO_HOLD_MS)/pan)):elapsed>=ACT_INTRO_HOLD_MS?1:0;
 const eased=progress<.5?4*progress**3:1-(-2*progress+2)**3/2;
 return {scrollTop:bottom*eased,done:elapsed>=ACT_INTRO_HOLD_MS+pan};
}
