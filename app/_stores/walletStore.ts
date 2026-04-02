import { atom } from "nanostores";

export const $walletAddress = atom<string | null>(null);
export const $chainId = atom<string | null>(null);

export const setWalletAddress = (address: string | null) => {
  $walletAddress.set(address);
};

export const setChainId = (chainId: string | null) => {
  $chainId.set(chainId);
};