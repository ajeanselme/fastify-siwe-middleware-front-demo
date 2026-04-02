import { useStore } from "@nanostores/react";
import { $stepProgress, setStepProgress } from "../_stores/progressStore";
import { Button } from "@/components/ui/button";
import { twMerge } from "tailwind-merge";

export default function Sidebar() {
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
          "group flex gap-1 w-full text-sm pl-4 py-3 text-left text-muted-foreground",
          stepProgress === step
            ? "bg-muted no-underline border-l-2 border-accent text-accent"
            : "hover:text-foreground hover:bg-primary/5 hover:cursor-pointer",
        )}
        onClick={() => {
          setStepProgress(step);
        }}
      >
        <div
          className={twMerge(
            "rounded-full border border-muted-foreground w-6 h-6 flex items-center justify-center text-[10px] font-mono mr-2",
            stepProgress === step
              ? "border-accent"
              : "group-hover:border-foreground",
          )}
        >
          {step + 1}
        </div>
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
