/** Ink geometry and line widths stay in CSS pixels, independent of backing resolution. */
export function inkPixelRatio(deviceRatio:number){return Math.min(2,Number.isFinite(deviceRatio)&&deviceRatio>0?deviceRatio:1);}

/** Avoid resetting the context when a layout notification leaves the backing size unchanged. */
export function resizeInkCanvas(canvas:Pick<HTMLCanvasElement,'width'|'height'>,width:number,height:number,deviceRatio:number){
 const ratio=inkPixelRatio(deviceRatio),w=Math.round(width*ratio),h=Math.round(height*ratio);
 if(canvas.width!==w)canvas.width=w;
 if(canvas.height!==h)canvas.height=h;
}
