export type SpiderPose={color:string;clock:number;moving:boolean};
/** Walking legs keep their real clock; a stationary spider does not redraw for clock changes. */
export function sameSpiderPose(previous:SpiderPose,next:SpiderPose){return previous.color===next.color&&previous.moving===next.moving&&(!next.moving||previous.clock===next.clock);}
