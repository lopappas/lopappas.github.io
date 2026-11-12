import {PLAYER_SPELLS,type SpellId} from './magic.ts';
import {potionName,POTIONS,POTION_IDS,potionRarity,type Potion} from './battle.ts';
import {RELICS,type RelicId} from './run.ts';
import type {Rarity} from './rarity.ts';

export type Chapter='spells'|'relics'|'potions';
export type EntryKey=`${Chapter}:${string}`;
export type Discoveries=Partial<Record<EntryKey,true>>;
export const CHAPTERS:Chapter[]=['spells','relics','potions'];
export const RARITY_ORDER:Rarity[]=['Starter','Common','Uncommon','Rare','Legendary','Keepsake'];
// Temporary until journey discoveries can be saved between visits.
export const ENCYCLOPEDIA_PREVIEW=true;
export const CASTING_TIPS:Record<SpellId,string>={
 sneakyVine:'Draw a simple candy cane in one stroke: a long straight stem on the right, a rounded hook over the top toward the left, and a short downward tip. Leave both ends open.',
 alchemize:'Draw a round bottle with a narrow rectangular neck, then close a small cork across its top.',
 water:'Close the teardrop outline. Keep the tip pointed and the base rounded.',
 fire:'Draw a closed triangle with a centered peak and a level base.',
 nature:'Join two upward branches at the center, then add the straight downward stem.',
 wave:'Draw a small upward chevron above a closed teardrop. Leave a clear gap between them.',
 bolt:'Draw an angular lightning bolt. Keep the middle bar level and the two long strokes slanted.',
 leaf:'Close a tall diamond. Keep its left and right corners balanced.',
 chronos:'Draw a circle, then a straight hand from its center to the top edge.',
 ender:'Draw a capital K with a straight stem and two arms meeting at its midpoint.',
 firestorm:'Draw a level line above two downward-pointing triangles. Close both triangles and leave a gap below the line.',
 tidalcrest:'Sweep upward from the lower left to the pointed crest. Curve inward on the right, then close along the flat base.',
 flameBlade:'Draw the narrow triangular blade, a straight horizontal guard, and a short handle below it.',
 puddleGuard:'Draw one long, shallow wavy M with two equal rounded humps and a rounded dip in the center. Keep both halves mirrored and finish with sloping ends.',
 thistleBush:'Draw three equal peaks in one zigzag. Keep the center peak centered and both sides mirrored.',
 bog:'Draw a round circle with a closed Bramble Leaf diamond centered inside. Leave space between the leaf and the circle.'
};
const RELIC_LORE:Record<RelicId,string>={snaily:'A little companion who never hurries, and would rather you did not either.',blackFlash:'A dark spark follows the rhythm of a perfect moment.',mindRune:'A quiet thought reaches the page before the hand can follow.',ordinaryFern:'An unassuming frond flourishes with a focused spellbook.',bookWorm:'A tiny reader knows every shortcut between the pages.',hazardousVials:'Even the glass has a dangerous temper.',coinpurse:'A little help from home, tucked safely beneath the clasp.',untouchedBox:'The ribbon has been waiting for your hands.',perfectedSphere:'A flawless curve catches a quiet constellation.',filadoraRobes:'A familiar hem, ready for an extraordinary journey.',forgivingCalculus:'Even an imperfect line has a little magic in it.',blackStardust:'A fallen star remembers how to shine in the dark.',sevenLeafClover:'Patience gives luck a place to grow.',artisanRobes:'Every new stitch tells the story of a different spell.',
 amber:'A little glimmer of home, carried close on a long climb.',moss:'Even far from the forest floor, a small patch of green endures.',feather:'Old ink stains remember the hands that held this before you.',bell:'A delicate chime with a surprisingly forceful voice.',moon:'Its slender point seems to tug at the space around it.',sunAmulet:'A warm glint lingers long after the daylight fades.',moonAmulet:'Cool silver catches the light like ripples on a midnight pond.',twilightAmulet:'Between the last sunbeam and the first star, the leaves hold their breath.',twillyScarf:'A bright little flourish for a faithful traveling companion.',birkinStock:'Every good adventure needs room for one more bottle.',midnightStone:'Its dark surface drinks in the light, waiting for a brushstroke.',lotus:'The first petal opens just as the journey turns dangerous.',colorfulRock:'No two faces of this stone seem to agree on a color.',impossibleShale:'A brittle fragment with a stubborn grudge.'
};
const POTION_LORE:Record<Potion,string>={miasma:'Something ancient stirs behind the glass.',stellar:'Green starlight gathers beneath the cork.',theodoraHeal:'A carefully stoppered reminder that someone is rooting for you.',heal:'A rosy sip of courage for tired travelers.',freeze:'A winter morning, quiet and still, caught under glass.',ink:'A swirling promise that the next page need not be the last.',rejection:'Some days, a little more personal space is its own kind of magic.',spellBottle:'An empty bottle can hold a remarkable possibility.',fury:'A restless warmth rattles against the glass.'};
export type EncyclopediaEntry={key:EntryKey;chapter:Chapter;id:SpellId|RelicId|Potion;name:string;rarity:Rarity;description:string;icon?:string;lore?:string;tips?:string;path?:string;color?:string;element?:string};
export const ENCYCLOPEDIA_ENTRIES:EncyclopediaEntry[]=[
 ...PLAYER_SPELLS.map(s=>({key:`spells:${s.id}` as EntryKey,chapter:'spells' as const,id:s.id,name:s.name,rarity:s.rarity,description:s.description,path:s.path,color:s.color,element:s.element,tips:CASTING_TIPS[s.id]})),
 ...(Object.keys(RELICS) as RelicId[]).map(id=>({key:`relics:${id}` as EntryKey,chapter:'relics' as const,id,...RELICS[id],lore:RELIC_LORE[id]})),
 ...POTION_IDS.map(id=>({key:`potions:${id}` as EntryKey,chapter:'potions' as const,id,name:potionName(id),rarity:potionRarity(id),description:POTIONS[id].detail,icon:POTIONS[id].icon,lore:POTION_LORE[id]}))
];
export function encyclopediaGroups(chapter:Chapter){
 return RARITY_ORDER.map(rarity=>({rarity,entries:ENCYCLOPEDIA_ENTRIES.filter(e=>e.chapter===chapter&&e.rarity===rarity)})).filter(group=>group.entries.length>0);
}
export function isEntryRevealed(entry:EncyclopediaEntry,discoveries:Discoveries,preview=ENCYCLOPEDIA_PREVIEW){return preview||discoveries[entry.key]===true;}
export function recordDiscoveries(previous:Discoveries,collection:{spells:SpellId[];relics:RelicId[];potions:Partial<Record<Potion,number>>}):Discoveries{
 const keys:EntryKey[]=[...collection.spells.map(id=>`spells:${id}` as EntryKey),...collection.relics.map(id=>`relics:${id}` as EntryKey),...POTION_IDS.filter(id=>(collection.potions[id]??0)>0).map(id=>`potions:${id}` as EntryKey)];
 const added=keys.filter(key=>!previous[key]);
 return added.length?{...previous,...Object.fromEntries(added.map(key=>[key,true]))}:previous;
}

