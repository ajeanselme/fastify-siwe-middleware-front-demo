"use client";

import { forwardRef, useImperativeHandle, useState } from "react";
import {
  LogEntry,
  LogLevel,
  appendLog,
  clearLogsForStep,
  getLogsForStep,
} from "../_stores/logStore";

export type LogWindowHandle = {
  appendLog: (line: string, level?: LogLevel) => void;
  clearLogs: () => void;
};

const LogWindow = forwardRef<LogWindowHandle, { step: number }>(
  function LogWindow({ step }, ref) {
    const [lines, setLines] = useState<LogEntry[]>(getLogsForStep(step));

    useImperativeHandle(
      ref,
      () => ({
        appendLog(line: string, level: LogLevel = "info") {
          appendLog(step, line, level);
          setLines((currentLines) => [
            ...currentLines,
            { time: new Date(), line, level },
          ]);
        },
        clearLogs() {
          clearLogsForStep(step);
          setLines([]);
        },
      }),
      [],
    );

    return (
      <div className="w-full h-full bg-background border rounded p-4 overflow-auto">
        {lines.length > 0 ? (
          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            {lines.map((logEntry, index) => (
              <div
                key={`${index}-${logEntry.line}`}
                className="whitespace-pre-wrap font-mono text-xs lowercase"
              >
                [
                {logEntry.time.getHours() < 10
                  ? `0${logEntry.time.getHours()}`
                  : logEntry.time.getHours()}
                :
                {logEntry.time.getMinutes() < 10
                  ? `0${logEntry.time.getMinutes()}`
                  : logEntry.time.getMinutes()}
                :
                {logEntry.time.getSeconds() < 10
                  ? `0${logEntry.time.getSeconds()}`
                  : logEntry.time.getSeconds()}
                ]{" "}
                <span
                  className={`${logEntry.level === "error" ? "text-red-500" : logEntry.level === "warning" ? "text-yellow-500" : logEntry.level === "success" ? "text-green-500" : "text-blue-500"}`}
                >
                  {logEntry.line}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted">Logs will appear here...</div>
        )}
        <div className="bg-accent/70 w-2 animate-caret-blink h-4" />
      </div>
    );
  },
);

export default LogWindow;
