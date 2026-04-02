"use client";

import { useStore } from "@nanostores/react";
import { $stepState } from "./_stores/progressStore";
import Connect from "./_components/connect";
import Sidebar from "./_components/sidebar";

export default function Home() {
  const stepState = useStore($stepState);

  return (
    <>
      <Sidebar />
      <div className="p-4 w-full">{stepState === 0 ? <Connect /> : <></>}</div>
    </>
  );
}
