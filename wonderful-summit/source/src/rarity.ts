export type Rarity='Common'|'Uncommon'|'Rare'|'Keepsake';
export type SpellRarity=Exclude<Rarity,'Keepsake'>;
export type RelicRarity=Rarity;
export function rarityClass(rarity:Rarity){return `item-rarity rarity-${rarity.toLowerCase()}`;}
