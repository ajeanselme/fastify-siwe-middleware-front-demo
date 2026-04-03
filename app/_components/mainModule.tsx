"use client";

import { useStore } from "@nanostores/react";
import { $stepState } from "../_stores/progressStore";
import Connect from "../_components/connectModule";
import Sidebar from "../_components/sidebar";
import Nonce from "../_components/nonceModule";
import Sign from "./signModule";
import Inspect from "./inspectModule";
import Me from "./meModule";

export default function MainModule() {
  const stepState = useStore($stepState);

  return (
    <>
      <Sidebar />
      <div className="p-4 w-full max-w-4xl mx-auto">
        {stepState === 0 ? (
          <Connect />
        ) : stepState === 1 ? (
          <Nonce />
        ) : stepState === 2 ? (
          <Sign />
        ) : stepState === 3 ? (
          <Inspect />
        ) : stepState === 4 ? (
          <Me />
        ) : (
          <></>
        )}
      </div>
    </>
  );
}
