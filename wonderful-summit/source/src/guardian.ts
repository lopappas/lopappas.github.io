import {MIN_CAST_QUALITY} from './quality.ts';

export type GuardianSpell = 'snowman' | 'scorchy';

export function isGuardianSpell(id:string):id is GuardianSpell {
 return id === 'snowman' || id === 'scorchy';
}

export const GUARDIAN_COOLDOWN = 30;
export const GUARDIAN_MAX_DISTANCE = 250;
export const GUARDIAN_SPEED = 14;
export const GUARDIAN_CONTACT_DISTANCE = 8;
export const GUARDIAN_CONTACT_ANIMATION_SECONDS = .18;
export const GUARDIAN_ENEMY_COOLDOWN = 1.5;
export const GUARDIAN_MAX_CONTACT_REACH = 30;
export const GUARDIAN_STRIKE_RANGE = 40;
export const GUARDIAN_ATTACK_INTERVAL:Record<GuardianSpell,number> = {snowman:2,scorchy:1.5};
export const GUARDIAN_DAMAGE_TAKEN = 1.5;
export const GUARDIAN_FAINT_LIFETIME = 20;
export const GUARDIAN_FADE_SECONDS = 3;
export const GUARDIAN_SHOT_FLIGHT_SECONDS = .28;
export const GUARDIAN_UPGRADE_DAMAGE_BONUS = .1;
export const GUARDIAN_UPGRADE_HEALTH_BONUS = .2;

export type GuardianShot = {
 x: number;
 targetId: number;
 started: number;
};

export type Guardian = {
 x: number;
 hp: number;
 quality: number;
 damageBonus: number;
 upgrade: number;
 expiresAt: number | null;
 nextShotAt: number;
 hurtUntil: number;
 shot: GuardianShot | null;
};

export function guardianStats(spell: GuardianSpell, quality: number, upgrade = 0) {
 const normalizedQuality = Number.isFinite(quality) && quality >= MIN_CAST_QUALITY ? Math.min(100, quality) : 0;
 const baseHP = Math.ceil(normalizedQuality * 6 / 25) * 5;
 const hp = spell === 'snowman' ? baseHP * 3 / 2 : baseHP;
 const damage = Math.floor(normalizedQuality / 5);
 return {
  hp: hp + (upgrade >= 1 ? hp * GUARDIAN_UPGRADE_HEALTH_BONUS : 0),
  baseDamage: spell === 'scorchy' ? damage * 6 / 5 : damage,
 };
}

export function snowballKnockback(quality: number) {
 if (!Number.isFinite(quality) || quality < MIN_CAST_QUALITY) return 0;
 const progress = (Math.min(100, quality) - MIN_CAST_QUALITY) / (100 - MIN_CAST_QUALITY);
 return 10 + progress * 14;
}

export function guardianBoostMultiplier(playerMultiplier: number) {
 return 1 + (playerMultiplier - 1) / 2;
}
