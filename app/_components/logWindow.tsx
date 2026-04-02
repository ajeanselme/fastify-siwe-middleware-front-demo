"use client";

import { forwardRef, useImperativeHandle, useState } from "react";

export type LogWindowHandle = {
  appendLog: (line: string) => void;
  clearLogs: () => void;
};

type LogLevel = "info" | "error" | "warning" | "success";
type LogEntry = { time: Date; line: string; level: LogLevel };

type LogWindowProps = {
  initialLines?: LogEntry[];
};

const LogWindow = forwardRef<LogWindowHandle, LogWindowProps>(
  function LogWindow({ initialLines = [] }, ref) {
    const [lines, setLines] = useState<LogEntry[]>(initialLines);

    useImperativeHandle(
      ref,
      () => ({
        appendLog(line: string) {
          setLines((currentLines) => [
            ...currentLines,
            { time: new Date(), line, level: "info" },
          ]);
        },
        clearLogs() {
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
                className="whitespace-pre-wrap font-mono"
              >
                [{logEntry.time.getHours()}:{logEntry.time.getMinutes()}:
                {logEntry.time.getSeconds()}]{" "}
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
      </div>
    );
  },
);

export default LogWindow;
