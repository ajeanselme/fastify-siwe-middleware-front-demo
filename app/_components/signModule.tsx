"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useStore } from "@nanostores/react";
import { $chainId, $walletAddress, $isSimulated } from "../_stores/walletStore";
import LogWindow, { LogWindowHandle } from "./logWindow";
import React from "react";
import { setStepProgress, setStepState } from "../_stores/progressStore";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { $nonce } from "../_stores/nonceStore";
import { SiweMessage } from "siwe";
import { BrowserProvider, getAddress } from "ethers";
import { setJwt, setRefreshToken } from "../_stores/jwtStore";

export default function Sign() {
  const walletAddress = useStore($walletAddress);
  const chainId = useStore($chainId);
  const nonce = useStore($nonce);
  const isSimulated = useStore($isSimulated);
  const logRef = React.useRef<LogWindowHandle>(null);

  const now = new Date().toISOString();

  async function verify() {
    const ethereum = window.ethereum;

    if (!ethereum && !isSimulated) {
      logRef.current?.appendLog(
        "No Ethereum provider found. Please install MetaMask or another wallet, or use the Simulate Wallet option.",
        "error",
      );
      return;
    }

    if (!walletAddress || !chainId) {
      logRef.current?.appendLog("Connect wallet first", "error");
      return;
    }

    if (!nonce) {
      logRef.current?.appendLog("Get a nonce first", "error");
      return;
    }

    logRef.current?.appendLog(
      `Requesting personal_sign from wallet...`,
      "info",
    );

    if (isSimulated) {
      logRef.current?.appendLog(`Simulating signature...`, "info");

      await new Promise((resolve) => setTimeout(resolve, 1000));
      logRef.current?.appendLog(`Simulated signature obtained`, "success");
      sendResultLogs();
      logRef.current?.appendLog(`200 OK - JWT issued`, "success");
      setJwt(makeJwt(walletAddress));
      setRefreshToken(makeRefreshToken());
      setStepProgress(3);
      return;
    }

    let checksumAddress: string;
    try {
      checksumAddress = getAddress(walletAddress);
    } catch {
      logRef.current?.appendLog(
        `Invalid wallet address: ${walletAddress}`,
        "error",
      );
      return;
    }

    const message = new SiweMessage({
      domain: window.location.host,
      address: checksumAddress,
      statement: "Sign in with Ethereum.",
      uri: window.location.origin,
      version: "1",
      chainId,
      nonce,
      issuedAt: new Date().toISOString(),
    });

    if (!ethereum) {
      logRef.current?.appendLog("No Ethereum provider found", "error");
      return;
    }

    const provider = new BrowserProvider(ethereum);
    const signer = await provider.getSigner();
    const signature = await signer.signMessage(message.prepareMessage());

    logRef.current?.appendLog(
      `Signature: ${signature.substring(0, 20)}...`,
      "success",
    );

    logRef.current?.appendLog(`POST {api_server}/auth/verify`, "info");

    const response = await fetch(`/auth/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: message.prepareMessage(),
        signature,
      }),
    });

    if (response.status === 200) {
      sendResultLogs();
      logRef.current?.appendLog(`200 OK - JWT issued`, "success");
      const data = await response.json();

      const accessToken = data.accessToken as string | undefined;
      const refreshToken = data.refreshToken as string | undefined;

      if (accessToken && refreshToken) {
        setJwt(accessToken);
        setRefreshToken(refreshToken);
        setStepProgress(3);
      } else {
        logRef.current?.appendLog(
          `200 OK - but JWT missing in response`,
          "error",
        );
      }
      setStepProgress(3);
    } else {
      if (response.status !== 404) {
        const errorData = await response.json();
        logRef.current?.appendLog(
          `${response.status} ${response.statusText} - ${errorData.error || "Unknown error"}`,
          "error",
        );
      } else {
        logRef.current?.appendLog(`404 NOT_FOUND - API unreachable`, "error");
      }
    }
  }

  function sendResultLogs() {
    logRef.current?.appendLog(`server: parsing SiweMessage…`, "info");
    logRef.current?.appendLog(`server: checking domain binding → ✓`, "info");
    logRef.current?.appendLog(`server: checking chain ID → ✓`, "info");
    logRef.current?.appendLog(
      `server: redis GETDEL nonce → consumed ✓`,
      "info",
    );
    logRef.current?.appendLog(
      `server: ethers.verifyMessage() → address matches ✓`,
      "info",
    );
  }

  return (
    <div className="flex flex-col h-full justify-between w-full">
      <div className="flex flex-col gap-4 w-full h-full">
        <h2 className="font-mono text-xs text-muted-foreground">STEP 3</h2>
        <h1 className="text-2xl">
          Sign the <span className="text-accent">SIWE message</span>
        </h1>

        <Card>
          <CardHeader>
            <CardTitle>EIP-4361 message to be signed</CardTitle>
          </CardHeader>
          {nonce ? (
            <CardContent>
              <div className="code-block">
                {[
                  `${window.location.hostname} wants you to sign in with your Ethereum account:`,
                  walletAddress,
                  "",
                  "Sign in to MyApp",
                  "",
                  `URI: ${window.location.origin}`,
                  "Version: 1",
                  `Chain ID: ${chainId || 1}`,
                  `Nonce: ${nonce}`,
                  `Issued At: ${now}`,
                ].join("\n")}
              </div>
            </CardContent>
          ) : (
            <CardContent>
              <div className="input-row">- request a nonce first -</div>
            </CardContent>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>POST /auth/verify</CardTitle>
          </CardHeader>
          <CardFooter className="flex-col justify-start items-start gap-2">
            <Button className="font-bold" onClick={verify}>
              <Badge variant="post">POST</Badge> /auth/verify
            </Button>
            <div className="text-muted-foreground">
              Your wallet will prompt you to sign the message - no gas, no
              transaction.
            </div>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>What happens here</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="code-block">
              <span className="cmt">
                {"// Client: construct + sign the SIWE message\n"}
              </span>
              <span className="purple">const</span>
              {" msg = "}
              <span className="purple">new </span>
              <span className="fn">SiweMessage{"("}</span>
              {"\n    domain: window.location.host,"}
              {"\n    address,"}
              {"\n    statement: "}
              <span className="str">&apos;Sign in to MyApp&apos;</span>
              {","}
              {"\n    uri: window.location.origin,"}
              {"\n    version: "}
              <span className="str">&apos;1&apos;</span>
              {",\n    chainId: "}
              <span className="var">&apos;{chainId || 1}&apos;</span>
              {",\n    nonce\n"}
              {"});\n"}
              <span className="purple">const</span>
              {" signature = "}
              <span className="purple">await</span>
              {" signer."}
              <span className="fn">signMessage{"("}</span>
              {"msg."}
              <span className="fn">prepareMessage{"())"}</span>
              {";\n\n"}

              <span className="cmt">
                {"// Server: verify, consume nonce, issue JWT\n"}
              </span>
              <span className="purple">const</span>
              {" stored = "}
              <span className="purple">await</span>
              {" redis."}
              <span className="fn">getDel{"("}</span>
              {"`"}
              <span className="str">nonce:</span>
              <span className="var">
                ${"{"}address{"}"}
              </span>
              {"`"}
              <span className="fn">{")"}</span>

              {";\n"}
              <span className="purple">await</span>
              {" siweMsg."}
              <span className="fn">verify{"("}</span>
              {"{ signature }"}
              <span className="fn">{")"}</span>
              {";\n"}
            </pre>
          </CardContent>
        </Card>
        <LogWindow ref={logRef} step={2} />
      </div>
      <div className="flex justify-between mt-4">
        <Button onClick={() => setStepState(1)} variant={"outline"}>
          <div className="flex items-center gap-2 text-sm">
            <ArrowLeftIcon />
            back
          </div>
        </Button>
        <Button onClick={() => setStepState(3)}>
          <div className="flex items-center gap-2 text-sm">
            next: inspect tokens
            <ArrowRightIcon />
          </div>
        </Button>
      </div>
    </div>
  );
}

function makeJwt(address: string) {
  const header = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" })).replace(
    /=/g,
    "",
  );
  const now = Math.floor(Date.now() / 1000);
  const payload = btoa(
    JSON.stringify({
      sub: address,
      sessionId: crypto.randomUUID(),
      iat: now,
      exp: now + 900,
      iss: "siwe-middleware-demo",
    }),
  ).replace(/=/g, "");
  const fakeSig = btoa("demo-signature-not-real").replace(/=/g, "");
  return `${header}.${payload}.${fakeSig}`;
}

function makeRefreshToken() {
  const arr = new Uint8Array(36);
  crypto.getRandomValues(arr);
  return btoa(String.fromCharCode(...arr))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}
