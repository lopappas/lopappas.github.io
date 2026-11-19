/** Sample decoration from battle time; no extra timer and no change to simulation time. */
export const DECORATIVE_FPS=30;
export function decorativeTime(time:number,fps=DECORATIVE_FPS){return Math.floor(time*fps+1e-9)/fps;}
