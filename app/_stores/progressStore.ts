import { atom } from "nanostores";

export const $stepState = atom(0);
export const $stepProgress = atom(0);

export const setStepState = (step: number) => {
  $stepState.set(step);
};

export const setStepProgress = (step: number) => {
  $stepProgress.set(step);
};