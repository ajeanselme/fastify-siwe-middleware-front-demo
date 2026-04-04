"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useStore } from "@nanostores/react";
import {
  $isSimulated,
  $walletAddress,
  setChainId,
  setWalletAddress,
} from "../_stores/walletStore";
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
import { clearAllLogs } from "../_stores/logStore";
import { clear } from "console";

export default function Logout() {
  const jwt = useStore($jwt);
  const isSimulated = useStore($isSimulated);
  const logRef = useRef<LogWindowHandle>(null);
  const [terminated, setTerminated] = useState(false);

  async function logout() {
    if (!jwt) {
      logRef.current?.appendLog("Authenticate first", "error");
      return;
    }

    if (isSimulated) {
      simulateLogout();
      return;
    }

    logRef.current?.appendLog(`DELETE {api_server}/auth/logout`, "info");

    const response = await fetch(`/auth/logout`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${jwt}`,
        type: "application/json",
      },
    });

    logRef.current?.appendLog(
      `Authorization: Bearer ${jwt.substring(0, 20)}...`,
      "info",
    );

    if (response.status === 200) {
      logRef.current?.appendLog(
        `server: UPDATE sessions SET revoked_at = NOW()…`,
        "info",
      );

      logRef.current?.appendLog(`200 OK - session revoked`, "success");
      logRef.current?.appendLog(
        `access token now rejected by jwtGuard (session check)`,
        "error",
      );

      resetAllData();
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

  async function simulateLogout() {
    logRef.current?.appendLog(
      `Simulating DELETE {api_server}/auth/logout`,
      "info",
    );
    await new Promise((resolve) => setTimeout(resolve, 600));

    logRef.current?.appendLog(
      `server: UPDATE sessions SET revoked_at = NOW()…`,
      "info",
    );
    logRef.current?.appendLog(`200 OK - session revoked`, "success");
    logRef.current?.appendLog(
      `Access token now rejected by jwtGuard (session check)`,
      "warning",
    );

    resetAllData();
  }

  function resetAllData() {
    setWalletAddress(null);
    setChainId(1);
    setJwt(null);
    setRefreshToken(null);
    setTerminated(true);
    setStepProgress(7);
  }

  return (
    <div className="flex flex-col h-full justify-between w-full">
      <div className="flex flex-col gap-4 w-full h-full">
        <h2 className="font-mono text-xs text-muted-foreground">STEP 7</h2>
        <h1 className="text-2xl">
          Rotate the <span className="text-accent">refresh token</span>
        </h1>
        <Card>
          <CardHeader>
            <CardTitle>DELETE /auth/logout</CardTitle>
          </CardHeader>
          <CardFooter className="flex flex-col items-start gap-2">
            <Button
              className="font-bold"
              onClick={logout}
              variant={"destructive"}
            >
              <Badge variant="delete">DELETE</Badge> /auth/logout
            </Button>
            <p className="text-muted-foreground">
              Sets <span className="text-red-400">revoked_at</span> on the
              session in Postgres. jwtGuard checks this on every request -
              revocation is immediate.
            </p>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What happens here</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="code-block">
              <span className="cmt">// Server marks session revoked</span>
              <br />

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
              <span className="var">req.user.sessionId</span>
              {"]"}
              <br />
              {");\n"}
              <span className="cmt">
                // Next request with same JWT → jwtGuard checks DB → 401
              </span>
            </div>
          </CardContent>
        </Card>

        {terminated && (
          <Card>
            <CardHeader>
              <CardTitle className="text-red-400">Session terminated</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Access token is now rejected even within its remaining 15-min
                window, because the session row is flagged{" "}
                <span className="text-red-400">revoked</span> in Postgres.
                Refresh token has also been invalidated.
              </p>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => {
                  setTerminated(false);
                  setStepProgress(0);
                  setStepState(0);
                  clearAllLogs();
                }}
              >
                Reset
              </Button>
            </CardFooter>
          </Card>
        )}

        <LogWindow ref={logRef} step={7} />
      </div>
      <div className="flex justify-start mt-4">
        <Button onClick={() => setStepState(5)} variant={"outline"}>
          <div className="flex items-center gap-2 text-sm">
            <ArrowLeftIcon />
            back
          </div>
        </Button>
      </div>
    </div>
  );
}
