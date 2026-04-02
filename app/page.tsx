"use client";

import { useStore } from "@nanostores/react";
import Sidebar from "./_components/sidebar";
import { $stepProgress } from "./_stores/progressStore";
import Connect from "./_components/connect";

export default function Home() {
  const stepProgress = useStore($stepProgress);

  return (
    <main className="min-h-svh w-full flex">
      <Sidebar />
      <div className="p-4">{stepProgress === 0 ? <Connect /> : <></>}</div>
    </main>
  );
}
