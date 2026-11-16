/** Sample decoration from battle time; no extra timer and no change to simulation time. */
export const DECORATIVE_FPS=30;
export function decorativeTime(time:number){return Math.floor(time*DECORATIVE_FPS+1e-9)/DECORATIVE_FPS;}
