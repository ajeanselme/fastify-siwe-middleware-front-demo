import { atom } from "nanostores";

export const $jwt = atom<string | null>(null);
export function setJwt(token: string | null) {
  $jwt.set(token);
}

export const $refreshToken = atom<string | null>(null);
export function setRefreshToken(token: string | null) {
  $refreshToken.set(token);
}