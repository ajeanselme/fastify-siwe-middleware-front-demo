import { atom } from "nanostores";

export const $nonce = atom<string | null>(null);
export function setNonce(nonce: string | null) {
  $nonce.set(nonce);
}