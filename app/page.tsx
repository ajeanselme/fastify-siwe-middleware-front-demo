"use client";

import { useStore } from "@nanostores/react";
import { $stepProgress } from "./_stores/progressStore";
import Connect from "./_components/connect";
import Sidebar from "./_components/sidebar";

export default function Home() {
  const stepProgress = useStore($stepProgress);

  return (
    <>
      <Sidebar />
      <div className="p-4">{stepProgress === 0 ? <Connect /> : <></>}</div>
    </>
  );
}
