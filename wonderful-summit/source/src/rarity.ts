export type SpellRarity='Common'|'Uncommon'|'Legendary';
export type RelicRarity='Common'|'Uncommon'|'Rare'|'Keepsake';
export type Rarity=SpellRarity|RelicRarity;
export function rarityClass(rarity:Rarity){return `item-rarity rarity-${rarity.toLowerCase()}`;}
export function spellRarityClass(rarity:SpellRarity){return 'spell-rarity';}

// Weight whole tiers, then share that weight equally among eligible items.
// Missing tiers are automatically redistributed; selections use one random roll.
export function pickByRarity<T,R extends Rarity>(items:T[],rarity:(item:T)=>R,weights:Record<R,number>,random:()=>number):T{
 const counts=new Map<R,number>();
 for(const item of items){const tier=rarity(item);counts.set(tier,(counts.get(tier)??0)+1);}
 const weight=(item:T)=>weights[rarity(item)]/counts.get(rarity(item))!;
 let roll=random()*items.reduce((sum,item)=>sum+weight(item),0);
 for(const item of items){roll-=weight(item);if(roll<0)return item;}
 return items[items.length-1];
}

