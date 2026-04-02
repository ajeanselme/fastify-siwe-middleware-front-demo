import { atom } from "nanostores";

export const $stepProgress = atom(0);

export const setStepProgress = (step: number) => {
  $stepProgress.set(step);
};