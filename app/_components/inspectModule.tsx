"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useStore } from "@nanostores/react";
import LogWindow from "./logWindow";
import { setStepProgress, setStepState } from "../_stores/progressStore";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { $jwt, $refreshToken } from "../_stores/jwtStore";
import { useEffect, useState } from "react";

export default function Inspect() {
  const jwt = useStore($jwt);
  const refreshToken = useStore($refreshToken);
  const [decoded, setDecoded] = useState<{
    sub: string;
    exp: number;
    sessionId: string;
    iat: number;
    iss: string;
  } | null>(null);

  useEffect(() => {
    const decoded = jwt ? JSON.parse(atob(jwt.split(".")[1])) : null;
    setDecoded(decoded);
    if (decoded) {
      setStepProgress(4);
    }
  }, [jwt]);

  return (
    <div className="flex flex-col h-full justify-between w-full">
      <div className="flex flex-col gap-4 w-full h-full">
        <h2 className="font-mono text-xs text-muted-foreground">STEP 4</h2>
        <h1 className="text-2xl">
          Inspect your <span className="text-accent">tokens</span>
        </h1>

        <Card>
          <CardHeader>
            <CardTitle>Access token (JWT · RS256 · expires 15 min)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="code-block wrap-anywhere">
              <span className="text-muted uppercase">
                header.payload.signature
              </span>
              <br />
              {jwt ? <>{jwt}</> : <>-</>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Decoded JWT payload</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="code-block wrap-anywhere">
              {decoded ? (
                <>
                  <span className="var">sub</span>
                  {": "}
                  <span className="str">"{decoded.sub}"</span>
                  <br />

                  <span className="var">sessionId</span>
                  {": "}
                  <span className="str">"{decoded.sessionId}"</span>
                  <br />

                  <span className="var">iss</span>
                  {": "}
                  <span className="str">"{decoded.iss}"</span>
                  <br />

                  <span className="var">iat</span>
                  {": "}
                  <span className="param">{decoded.iat}</span>
                  <span className="cmt">
                    {`// ${new Date(decoded.iat * 1000).toLocaleString()}`}
                  </span>
                  <br />

                  <span className="var">exp</span>
                  {": "}
                  <span className="param">{decoded.exp}</span>
                  <span className="cmt">{`// +15 minutes`}</span>
                  <br />
                </>
              ) : (
                <>-</>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Refresh token (opaque · 7 days · stored as hash in Postgres)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="code-block wrap-anywhere">
              {refreshToken ? <>{refreshToken}</> : <>-</>}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-end">
        <Button onClick={() => setStepState(2)}>
          <div className="flex items-center gap-2 text-sm">
            next: inspect tokens
            <ArrowRightIcon />
          </div>
        </Button>
      </div>
    </div>
  );
}
