import { atom } from "nanostores";

export const $walletAddress = atom<string | null>(null);
export const $chainId = atom<number>(1);
export const $isSimulated = atom(false);

export const setWalletAddress = (address: string | null) => {
  $walletAddress.set(address);
};

export const setChainId = (chainId: number) => {
  $chainId.set(chainId);
};

export const setIsSimulated = (simulated: boolean) => {
  $isSimulated.set(simulated);
};