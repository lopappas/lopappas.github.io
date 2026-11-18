import {MIN_CAST_QUALITY} from './quality.ts';

export const SNOWMAN_COOLDOWN = 30;
export const SNOWMAN_MAX_DISTANCE = 250;
export const SNOWMAN_SPEED = 14;
export const SNOWMAN_CONTACT_DISTANCE = 8;
export const SNOWMAN_STRIKE_RANGE = 10;
export const SNOWMAN_ATTACK_INTERVAL = 2;
export const SNOWMAN_DAMAGE_TAKEN = 1.5;
export const SNOWMAN_FAINT_LIFETIME = 20;
export const SNOWMAN_MELT_SECONDS = 3;
export const SNOWBALL_FLIGHT_SECONDS = .28;

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
 snowball: Snowball | null;
};

export function snowmanStats(quality: number) {
 const hp = Number.isFinite(quality) && quality >= MIN_CAST_QUALITY ? Math.min(100, quality) : 0;
 return {hp, damage: hp / 4};
}
