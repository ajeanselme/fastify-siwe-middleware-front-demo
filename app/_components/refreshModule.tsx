"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useStore } from "@nanostores/react";
import { $isSimulated, $walletAddress } from "../_stores/walletStore";
import LogWindow, { LogWindowHandle } from "./logWindow";
import React, { useRef, useState } from "react";
import { setStepProgress, setStepState } from "../_stores/progressStore";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { truncateAddress } from "@/lib/wallet";
import {
  $jwt,
  $refreshToken,
  setJwt,
  setRefreshToken,
} from "../_stores/jwtStore";
import {
  mockGetJwtSubject,
  mockMakeJwt,
  mockMakeRefreshToken,
} from "@/lib/mock";

export default function Refresh() {
  const jwt = useStore($jwt);
  const refreshToken = useStore($refreshToken);
  const walletAddress = useStore($walletAddress);
  const isSimulated = useStore($isSimulated);
  const logRef = useRef<LogWindowHandle>(null);
  const [newAccessToken, setNewAccessToken] = useState<string | null>(null);

  async function refresh() {
    if (!refreshToken) {
      logRef.current?.appendLog("Get a token first", "error");
      return;
    }

    if (isSimulated) {
      simulateRefresh();
      return;
    }

    logRef.current?.appendLog(`POST {api_server}/auth/refresh`, "info");

    const response = await fetch(`/auth/refresh`, {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    logRef.current?.appendLog(
      `Sending refresh token (opaque, not shown)`,
      "info",
    );

    if (response.status === 200) {
      logRef.current?.appendLog(`server: hash match in Postgres → ✓`, "info");
      logRef.current?.appendLog(`server: old session invalidated`, "info");

      logRef.current?.appendLog(`200 OK - new token pair issued`, "success");
      const data = await response.json();

      logRef.current?.appendLog(
        `old AT: ${truncateAddress($jwt.get()!)}`,
        "info",
      );

      logRef.current?.appendLog(
        `new AT: ${truncateAddress(data.accessToken)}`,
        "info",
      );

      setNewAccessToken(data.accessToken);
      setJwt(data.accessToken);
      setRefreshToken(data.refreshToken);
      setStepProgress(6);
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

  async function simulateRefresh() {
    logRef.current?.appendLog(
      `Simulating POST {api_server}/auth/refresh`,
      "info",
    );
    logRef.current?.appendLog(
      `Sending refresh token (opaque, not shown)`,
      "info",
    );
    await new Promise((resolve) => setTimeout(resolve, 600));

    const subjectAddress =
      walletAddress ??
      mockGetJwtSubject(jwt) ??
      "0x1234567890abcdef1234567890abcdef12345678";
    const simulatedAccessToken = mockMakeJwt(subjectAddress);
    const simulatedRefreshToken = mockMakeRefreshToken();

    logRef.current?.appendLog(`server: hash match in Postgres → ✓`, "info");
    logRef.current?.appendLog(`server: old session invalidated`, "info");
    logRef.current?.appendLog(`200 OK - new token pair issued`, "success");

    if (jwt) {
      logRef.current?.appendLog(`old AT: ${truncateAddress(jwt)}`, "info");
    }
    logRef.current?.appendLog(
      `new AT: ${truncateAddress(simulatedAccessToken)}`,
      "info",
    );

    setNewAccessToken(simulatedAccessToken);
    setJwt(simulatedAccessToken);
    setRefreshToken(simulatedRefreshToken);
    setStepProgress(6);
  }

  return (
    <div className="flex flex-col h-full justify-between w-full">
      <div className="flex flex-col gap-4 w-full h-full">
        <h2 className="font-mono text-xs text-muted-foreground">STEP 6</h2>
        <h1 className="text-2xl">
          Rotate the <span className="text-accent">refresh token</span>
        </h1>
        <Card>
          <CardHeader>
            <CardTitle>POST /auth/refresh</CardTitle>
          </CardHeader>
          <CardFooter className="flex flex-col items-start gap-2">
            <Button className="font-bold" onClick={refresh}>
              <Badge variant="post">POST</Badge> /auth/refresh
            </Button>
            <p className="text-muted-foreground">
              Exchanges current refresh token for a new access + refresh pair.
              Old token is immediately invalidated.
            </p>
          </CardFooter>
        </Card>

        {newAccessToken && (
          <Card>
            <CardHeader>
              <CardTitle>New access token</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="input-row">
                <p className="text-xs text-accent font-mono wrap-anywhere">
                  {truncateAddress(newAccessToken)}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>What happens here</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="code-block">
              <span className="cmt">
                // Server validates hash, rotates both tokens
              </span>
              <br />
              <span className="purple">const</span>
              {" session = "}
              <span className="purple">await</span>
              {" db."}
              <span className="fn">query{"("}</span>
              <br />
              <span className="str">
                {" "}
                'SELECT * FROM sessions WHERE refresh_hash = $1'
              </span>
              {",\n"}
              {"  ["}
              <span className="fn">hashToken{"("}</span>
              <span className="var">refreshToken</span>
              <span className="fn">{")"}</span>
              {"]\n"}

              {");\n"}

              <span className="purple">await</span>
              {" db."}
              <span className="fn">query{"("}</span>
              <br />
              <span className="str">
                {" "}
                'UPDATE sessions SET revoked_at = NOW() WHERE id = $1'
              </span>
              {",\n"}
              {"  ["}
              <span className="var">session.id</span>
              {"] "}
              <span className="cmt">// invalidate old session</span>
              <br />
              {");\n"}

              <span className="purple">return </span>
              <span className="fn">issue{"("}</span>
              <span className="var">session.address</span>
              <span className="fn">{")"}</span>
              {"; "}
              <span className="cmt">// new tokens</span>
            </div>
          </CardContent>
        </Card>
        <LogWindow ref={logRef} step={5} />
      </div>
      <div className="flex justify-between mt-4">
        <Button onClick={() => setStepState(4)} variant={"outline"}>
          <div className="flex items-center gap-2 text-sm">
            <ArrowLeftIcon />
            back
          </div>
        </Button>
        <Button onClick={() => setStepState(6)}>
          <div className="flex items-center gap-2 text-sm">
            next: refresh token
            <ArrowRightIcon />
          </div>
        </Button>
      </div>
    </div>
  );
}
