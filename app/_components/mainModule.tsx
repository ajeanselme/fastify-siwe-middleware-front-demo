"use client";

"use client";

import { useStore } from "@nanostores/react";
import { $stepState } from "../_stores/progressStore";
import Connect from "../_components/connectModule";
import Sidebar from "../_components/sidebar";
import Nonce from "../_components/nonceModule";

export default function MainModule() {
  const stepState = useStore($stepState);

  return (
    <>
      <Sidebar />
      <div className="p-4 w-full sm:col-span-3">
        {stepState === 0 ? <Connect /> : stepState === 1 ? <Nonce /> : <></>}
      </div>
    </>
  );
}
