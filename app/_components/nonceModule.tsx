"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useStore } from "@nanostores/react";
import { $chainId, $walletAddress } from "../_stores/walletStore";
import LogWindow, { LogWindowHandle } from "./logWindow";
import React from "react";
import { setStepProgress, setStepState } from "../_stores/progressStore";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { truncateAddress } from "@/lib/wallet";
import { setNonce } from "../_stores/nonceStore";

export default function Nonce() {
  const walletAddress = useStore($walletAddress);
  const logRef = React.useRef<LogWindowHandle>(null);

  async function getNonce() {
    if (!walletAddress) {
      logRef.current?.appendLog("Connect wallet first", "error");
      return;
    }

    logRef.current?.appendLog(
      `GET {api_server}/auth/nonce?address=${encodeURIComponent(truncateAddress(walletAddress))}`,
      "info",
    );

    const response = await fetch(
      `/auth/nonce?address=${encodeURIComponent(walletAddress)}`,
      {
        method: "GET",
      },
    );

    if (response.status === 200) {
      logRef.current?.appendLog(
        `200 OK - nonce received successfully`,
        "success",
      );
      const data = await response.json();
      const nonce = data.nonce as string | undefined;

      if (nonce) {
        logRef.current?.appendLog(
          `nonce: ${(data.nonce as string).substring(0, 20)}...`,
          "info",
        );
        logRef.current?.appendLog(`stored in Redis - TTL 300s`, "info");
        setNonce(nonce);
        setStepProgress(2);
      } else {
        logRef.current?.appendLog(
          `200 OK - but nonce missing in response`,
          "error",
        );
      }
    } else {
      if (response.ok) {
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

  return (
    <div className="flex flex-col h-full justify-between w-full">
      <div className="flex flex-col gap-4 w-full h-full">
        <h2 className="font-mono text-xs text-muted-foreground">STEP 2</h2>
        <h1 className="text-2xl">
          Request a <span className="text-accent">nonce</span>
        </h1>
        <Card>
          <CardHeader>
            <CardTitle>GET /auth/nonce</CardTitle>
          </CardHeader>

          {walletAddress ? (
            <CardContent className="flex flex-col gap-2">
              <div className="input-row text-accent">
                {truncateAddress(walletAddress)}
              </div>
            </CardContent>
          ) : (
            <CardContent>
              <div className="input-row text-muted-foreground">
                - wallet not connected -
              </div>
            </CardContent>
          )}
          <CardFooter>
            <Button className="font-bold" onClick={getNonce}>
              <Badge variant="get">GET</Badge> /auth/nonce
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>What happens here</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="code-block">
              <span className="cmt">
                {"// Server generates and stores the nonce atomically\n"}
              </span>
              <span className="purple">const</span>
              {" nonce = crypto."}
              <span className="fn">randomBytes{"("}</span>
              <span className="param">32</span>
              <span className="fn">{")"}</span>
              {"."}
              <span className="fn">toString{"("}</span>
              <span className="str">&apos;hex&apos;</span>
              <span className="fn">{")"}</span>
              {";\n"}

              <span className="purple">await</span>
              {" redis."}
              <span className="fn">set{"("}</span>
              {"`"}
              <span className="str">nonce:</span>
              <span className="var">
                ${"{"}address{"}"}
              </span>
              {"`, nonce, "}
              <span className="str">&apos;EX&apos;</span>
              {","}
              <span className="param"> 300</span>
              <span className="fn">{")"}</span>
              {";\n"}
              <span className="purple">return</span>
              {" { nonce };"}
            </pre>
          </CardContent>
        </Card>
        <LogWindow ref={logRef} step={1} />
      </div>
      <div className="flex justify-end">
        <Button onClick={() => setStepState(1)}>
          <div className="flex items-center gap-2 text-sm">
            next: sign & verify
            <ArrowRightIcon />
          </div>
        </Button>
      </div>
    </div>
  );
}
