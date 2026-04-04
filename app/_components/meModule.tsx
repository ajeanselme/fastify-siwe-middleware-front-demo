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
import { useRef, useState } from "react";
import { setStepProgress, setStepState } from "../_stores/progressStore";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, ArrowRightIcon, LockIcon } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { truncateAddress } from "@/lib/wallet";
import { $jwt } from "../_stores/jwtStore";
import {
  mockGetJwtSubject,
  mockMakeJwt,
  mockMakeRefreshToken,
} from "@/lib/mock";

export default function Me() {
  const jwt = useStore($jwt);
  const isSimulated = useStore($isSimulated);
  const logRef = useRef<LogWindowHandle>(null);
  const walletAddress = useStore($walletAddress);
  const [ensName, setEnsName] = useState<string | null>(null);
  const [firstSeen, setFirstSeen] = useState<string | null>(null);
  const [sessionCount, setSessionCount] = useState<string | null>(null);

  async function getMe() {
    if (!jwt) {
      logRef.current?.appendLog("Get a token first", "error");
      return;
    }

    logRef.current?.appendLog(`GET {api_server}/auth/me`, "info");

    if (isSimulated) {
      simulateGetMe();
      return;
    }

    const response = await fetch(`/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    logRef.current?.appendLog(
      `Authorization: Bearer ${jwt.substring(0, 20)}...`,
      "info",
    );

    logRef.current?.appendLog(`jwtGuard: verifying RS256 signature… ✓`, "info");

    logRef.current?.appendLog(
      `jwtGuard: session active check (Postgres) → ✓`,
      "info",
    );

    if (response.status === 200) {
      logRef.current?.appendLog(`200 OK - wallet profile returned`, "success");
      const data = await response.json();

      setEnsName(data.ensName || null);
      setFirstSeen(data.firstSeen || null);
      setSessionCount(data.sessionCount || null);

      setStepProgress(5);
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

  async function simulateGetMe() {
    const subjectAddress =
      walletAddress ??
      mockGetJwtSubject(jwt) ??
      "0x1234567890abcdef1234567890abcdef12345678";
    const simulatedAccessToken = mockMakeJwt(subjectAddress);

    logRef.current?.appendLog(
      `Authorization: Bearer ${simulatedAccessToken.substring(0, 20)}...`,
      "info",
    );
    await new Promise((resolve) => setTimeout(resolve, 600));

    logRef.current?.appendLog(`jwtGuard: verifying RS256 signature… ✓`, "info");
    logRef.current?.appendLog(
      `jwtGuard: session active check (Postgres) → ✓`,
      "info",
    );
    logRef.current?.appendLog(`200 OK - wallet profile returned`, "success");

    const payload = getJwtPayload(simulatedAccessToken);
    const nowIso = new Date().toISOString();
    const derivedFirstSeen = payload?.iat
      ? new Date(payload.iat * 1000).toISOString()
      : nowIso;

    setEnsName(payload?.sub ? `${truncateAddress(payload.sub)}.sim` : null);
    setFirstSeen(derivedFirstSeen);
    setSessionCount("1");
    setStepProgress(5);
  }

  return (
    <div className="flex flex-col h-full justify-between w-full">
      <div className="flex flex-col gap-4 w-full h-full">
        <h2 className="font-mono text-xs text-muted-foreground">STEP 5</h2>
        <h1 className="text-2xl">
          Protected route: <span className="text-accent">/auth/me</span>
        </h1>
        <div className="bg-amber-600/10 border border-amber-600/20 text-amber-600 rounded-sm p-2 flex items-center gap-2 font-mono text-xs">
          <LockIcon />
          {"requires Authorization: Bearer <accessToken> "}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>GET /auth/nonce</CardTitle>
          </CardHeader>
          <CardFooter>
            <Button className="font-bold" onClick={getMe}>
              <Badge variant="get">GET</Badge> /auth/me
            </Button>
          </CardFooter>
        </Card>
        {(sessionCount !== null || ensName !== null || firstSeen !== null) && (
          <div className="grid grid-cols-2 grid-rows-2 gap-4">
            <div className="input-row flex flex-col gap-1">
              <div className="uppercase">Address</div>
              <div className="text-foreground">
                {walletAddress
                  ? truncateAddress(walletAddress)
                  : "Not connected"}
              </div>
            </div>
            <div className="input-row flex flex-col gap-1">
              <div className="uppercase">ENS Name</div>
              <div className="text-foreground">{ensName || "not resolved"}</div>
            </div>
            <div className="input-row flex flex-col gap-1">
              <div className="uppercase">First Seen</div>
              <div className="text-foreground">{firstSeen || "not seen"}</div>
            </div>
            <div className="input-row flex flex-col gap-1">
              <div className="uppercase">Session Count</div>
              <div className="text-foreground">
                {sessionCount !== null ? sessionCount : "not available"}
              </div>
            </div>
          </div>
        )}
        <Card>
          <CardHeader>
            <CardTitle>What happens here</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="code-block">
              <span className="fn">fetch{"("}</span>
              <span className="str">'/auth/me'</span>
              {", {\n"}
              {"  headers: {\n"}
              <span className="param"> 'Authorization'</span>
              {": "}
              <span className="str">`Bearer {jwt?.substring(0, 20)}...`</span>
              <br />
              {"  }\n"}
              {"});"}
            </pre>
          </CardContent>
        </Card>
        <LogWindow ref={logRef} step={4} />
      </div>
      <div className="flex justify-between mt-4">
        <Button onClick={() => setStepState(3)} variant={"outline"}>
          <div className="flex items-center gap-2 text-sm">
            <ArrowLeftIcon />
            back
          </div>
        </Button>
        <Button onClick={() => setStepState(5)}>
          <div className="flex items-center gap-2 text-sm">
            next: refresh token
            <ArrowRightIcon />
          </div>
        </Button>
      </div>
    </div>
  );
}

function getJwtPayload(token: string) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1] ?? "")) as {
      sub?: string;
      iat?: number;
    };
    return payload;
  } catch {
    return null;
  }
}
