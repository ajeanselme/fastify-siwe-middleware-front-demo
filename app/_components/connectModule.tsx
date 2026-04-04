"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useStore } from "@nanostores/react";
import {
  $chainId,
  $walletAddress,
  setChainId,
  setIsSimulated,
  setWalletAddress,
} from "../_stores/walletStore";
import LogWindow, { LogWindowHandle } from "./logWindow";
import React from "react";
import { setStepProgress, setStepState } from "../_stores/progressStore";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { truncateAddress } from "@/lib/wallet";

type EIP1193Provider = {
  request: <T = unknown>(args: {
    method: string;
    params?: unknown[] | object;
  }) => Promise<T>;
};

declare global {
  interface Window {
    ethereum?: EIP1193Provider;
  }
}

export default function Connect() {
  const walletAddress = useStore($walletAddress);
  const chainid = useStore($chainId);
  const logRef = React.useRef<LogWindowHandle>(null);

  async function connectWallet() {
    logRef.current?.appendLog("Requesting wallet connection...", "info");

    try {
      const ethereum = window.ethereum;
      if (!ethereum) {
        logRef.current?.appendLog(
          "No Ethereum provider found. Please install MetaMask or another wallet, or use the Simulate Wallet option.",
          "error",
        );
        return;
      }
      
      await ethereum.request<string[]>({ method: "eth_requestAccounts" });
      const accounts = await ethereum.request<string[]>({
        method: "eth_accounts",
      });
      const chainId = await ethereum.request<string>({ method: "eth_chainId" });

      if (accounts.length === 0) {
        logRef.current?.appendLog(
          "No accounts found. Please connect your wallet and try again.",
          "error",
        );
        return;
      }

      const address = accounts[0] as string;
      setStepProgress(1);
      setWalletAddress(address);
      setChainId(parseInt(chainId, 16));
      logRef.current?.appendLog(
        `Connected wallet: ${truncateAddress(address)} on chain ${chainId}`,
        "success",
      );
    } catch (error) {
      logRef.current?.appendLog(
        `Error connecting wallet: ${error instanceof Error ? error.message : String(error)}`,
        "error",
      );
    }
  }

  function connectSimulatedWallet() {
    logRef.current?.appendLog("Simulating wallet connection...", "info");
    setTimeout(() => {
      const simulatedAddress = "0x1234567890abcdef1234567890abcdef12345678";
      setWalletAddress(simulatedAddress);
      setIsSimulated(true);
      setStepProgress(1);
      logRef.current?.appendLog(
        `Simulated wallet connected: ${truncateAddress(simulatedAddress)} on chain 1`,
        "success",
      );
    }, 1000);
  }

  return (
    <div className="flex flex-col h-full justify-between w-full">
      <div className="flex flex-col gap-4 w-full h-full">
        <h2 className="font-mono text-xs text-muted-foreground">STEP 1</h2>
        <h1 className="text-2xl">
          Connect your <span className="text-accent">wallet</span>
        </h1>
        <Card>
          <CardHeader>
            <CardTitle>EIP-1193 Provider</CardTitle>
          </CardHeader>

          {walletAddress ? (
            <CardContent className="flex flex-col gap-2">
              <div className="bg-accent/10 border border-accent/20 p-4 flex gap-6 items-center rounded-sm font-mono">
                <div className="w-2 h-2 rounded-full bg-accent shadow-2xl shadow-accent animate-pulse" />
                <p className="text-accent text-xs">
                  {truncateAddress(walletAddress)}
                </p>
              </div>
              <p className="text-muted-foreground text-xs font-mono">
                chain id: <span className="text-accent2">{chainid}</span>
              </p>
            </CardContent>
          ) : (
            <>
              <CardContent>
                This demo calls{" "}
                <span className="text-accent2">
                  window.ethereum.request({"{"} method: 'eth_requestAccounts'{" "}
                  {"}"})
                </span>{" "}
                to get the connected wallet address. No popup blocker worries —
                you click the button, MetaMask handles the rest.
              </CardContent>
              <CardFooter className="gap-4">
                <Button onClick={connectWallet}>Connect Wallet</Button>
                <Button variant="outline" onClick={connectSimulatedWallet}>
                  Simulate Wallet
                </Button>
              </CardFooter>
            </>
          )}
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>What happens here</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="code-block">
              <span className="cmt">
                {
                  "// EIP-1193 — standard across MetaMask, Coinbase Wallet, etc.\n"
                }
              </span>
              <span className="purple">const</span>
              {" [address] = "}
              <span className="purple">await</span>
              {" window.ethereum."}
              <span className="fn">request</span>
              {"({\n    method: "}
              <span className="str">'eth_requestAccounts'</span>
              {"\n });\n"}
              <span className="purple">const</span>
              {" chainId = "}
              <span className="purple">await</span>
              {" window.ethereum."}
              <span className="fn">request</span>
              {"({\n    method: "}
              <span className="str">'eth_chainId'</span>
              {"\n});"}
              <span className="cmt">
                {' // e.g. "0x1" for mainnet, "0x89" for Polygon'}
              </span>
            </pre>
          </CardContent>
        </Card>
        <LogWindow ref={logRef} step={0} />
      </div>
      <div className="flex justify-end mt-4">
        <Button onClick={() => setStepState(1)}>
          <div className="flex items-center gap-2 text-sm">
            next: get nonce
            <ArrowRightIcon />
          </div>
        </Button>
      </div>
    </div>
  );
}
