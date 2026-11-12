export const GOBLIN_KING_SCALE=1.35*1.15;
export type KingState={goblinKing?:boolean;kingEnragedAt?:number;hp?:number;maxHP?:number};
export function kingHasCrown(enemy:KingState){return !!enemy.goblinKing&&enemy.kingEnragedAt===undefined&&(enemy.hp===undefined||enemy.maxHP===undefined||enemy.hp>enemy.maxHP/2);}
export function kingCrownFrame(enemy:KingState,time:number){
 const age=enemy.kingEnragedAt===undefined?0:Math.max(0,time-enemy.kingEnragedAt),t=Math.min(1,age/.8);
 return{visible:kingHasCrown(enemy)||enemy.kingEnragedAt!==undefined&&t<1,x:t*35,y:t*t*140,rotation:t*100,opacity:1-t};
}

export const GOBLIN_KING_DIALOGUE_MS=3000;
export function kingDialogueVisible(enemy:KingState,time:number){return !!enemy.goblinKing&&enemy.kingEnragedAt!==undefined&&time>=enemy.kingEnragedAt&&time-enemy.kingEnragedAt<GOBLIN_KING_DIALOGUE_MS/1000;}
