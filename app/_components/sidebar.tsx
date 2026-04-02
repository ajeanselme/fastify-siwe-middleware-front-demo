import { useStore } from "@nanostores/react";
import {
  $stepProgress,
  $stepState,
  setStepState,
} from "../_stores/progressStore";
import { twMerge } from "tailwind-merge";
import { CheckIcon } from "@phosphor-icons/react";

export default function Sidebar() {
  const stepState = useStore($stepState);
  const stepProgress = useStore($stepProgress);

  function NavButton({
    children,
    step,
  }: {
    children: React.ReactNode;
    step: number;
  }) {
    return (
      <button
        className={twMerge(
          "group flex gap-1 w-full text-sm pl-4 py-3 text-left text-muted-foreground items-center",
          stepState === step
            ? "bg-muted no-underline border-l-2 pl-3.5 border-accent text-accent"
            : "hover:text-foreground hover:bg-primary/5 hover:cursor-pointer",
        )}
        onClick={() => {
          setStepState(step);
        }}
      >
        {step < stepProgress ? (
          <div
            className={"rounded-full border border-accent w-6 h-6 flex items-center justify-center text-[10px] font-mono mr-2 bg-accent/80"}
          >
            <CheckIcon className="text-surface" size={15}/>
          </div>
        ) : (
          <div
            className={twMerge(
              "rounded-full border border-muted-foreground w-6 h-6 flex items-center justify-center text-[10px] font-mono mr-2",
              stepState === step
                ? "border-accent"
                : "group-hover:border-foreground",
            )}
          >
            {step + 1}
          </div>
        )}
        {children}
      </button>
    );
  }

  return (
    <div className="font-mono bg-surface border-r text-xs">
      <div className="text-xs uppercase text-muted-foreground p-4">
        Auth Flow
      </div>
      <nav className="min-h-screen w-64 flex flex-col text-foreground">
        <NavButton step={0}>connect wallet</NavButton>
        <NavButton step={1}>get nonce</NavButton>
        <NavButton step={2}>sign & verify</NavButton>
        <NavButton step={3}>inspect tokens</NavButton>
      </nav>
    </div>
  );
}
