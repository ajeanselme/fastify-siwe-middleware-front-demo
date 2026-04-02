import { useStore } from "@nanostores/react";
import { $stepProgress, setStepProgress } from "../_stores/progressStore";

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
      <button className={"w-full text-left px-4 py-2 rounded hover:bg-gray-200 " + (stepProgress === step ? "bg-gray-300" : "")} onClick={() => {setStepProgress(step)}}>
        {children}
      </button>
    );
  }

  return (
      <nav className="min-h-screen w-64 bg-gray-100 p-4 flex flex-col gap-4">
        <div className="text-xs uppercase">Auth Flow</div>
        <NavButton step={0}>connect wallet</NavButton>
        <NavButton step={1}>get nonce</NavButton>
        <NavButton step={2}>sign & verify</NavButton>
        <NavButton step={3}>inspect tokens</NavButton>
      </nav>
  );
}
