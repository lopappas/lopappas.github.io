/** Optional for existing runs and authored tutorial battles, which retain the normal 100 HP cap. */
export function playerMaxHealth(state:{maxHealth?:number}){return state.maxHealth??100;}
