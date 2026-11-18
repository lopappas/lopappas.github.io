import {MIN_CAST_QUALITY} from './quality.ts';

export const SNOWMAN_COOLDOWN = 30;
export const SNOWMAN_MAX_DISTANCE = 250;
export const SNOWMAN_SPEED = 14;
export const SNOWMAN_CONTACT_DISTANCE = 8;
export const SNOWMAN_CONTACT_PUSH = 30;
export const SNOWMAN_CONTACT_ANIMATION_SECONDS = .18;
export const SNOWMAN_STRIKE_RANGE = 20;
export const SNOWMAN_ATTACK_INTERVAL = 2;
export const SNOWMAN_DAMAGE_TAKEN = 1.5;
export const SNOWMAN_FAINT_LIFETIME = 20;
export const SNOWMAN_MELT_SECONDS = 3;
export const SNOWBALL_FLIGHT_SECONDS = .28;
export const SNOWMAN_UPGRADE_DAMAGE_BONUS = .1;
export const SNOWMAN_UPGRADE_HEALTH_BONUS = .2;

export type Snowball = {
 x: number;
 targetId: number;
 started: number;
};

export type Snowman = {
 x: number;
 hp: number;
 quality: number;
 damageBonus: number;
 upgrade: number;
 expiresAt: number | null;
 nextShotAt: number;
 hurtUntil: number;
 contactIds: number[];
 snowball: Snowball | null;
};

export function snowmanStats(quality: number, upgrade = 0) {
 const normalizedQuality = Number.isFinite(quality) && quality >= MIN_CAST_QUALITY ? Math.min(100, quality) : 0;
 // Round the new base stats before applying the upgrade.
 const hp = Math.ceil(normalizedQuality * 6 / 25) * 5;
 return {hp: hp + (upgrade >= 1 ? hp * SNOWMAN_UPGRADE_HEALTH_BONUS : 0), baseDamage: Math.floor(normalizedQuality / 5)};
}

export function snowmanBoostMultiplier(playerMultiplier: number) {
 return 1 + (playerMultiplier - 1) / 2;
}
