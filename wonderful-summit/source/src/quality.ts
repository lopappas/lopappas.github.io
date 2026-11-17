export const MIN_CAST_QUALITY=45;

/** Map the wider Faint tier onto its existing balance curve, preserving both endpoints.
 * Recognition, stored quality and grade checks always use the actual score.
 * Call only inside leaf balance helpers so a cast is never remapped twice.
 */
export function balanceQuality(quality:number){
 return quality>=MIN_CAST_QUALITY&&quality<60
  ?48+(quality-MIN_CAST_QUALITY)*11/14
  :Math.min(100,quality);
}
