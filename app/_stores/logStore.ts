import { map } from "nanostores";

export type LogLevel = "info" | "error" | "warning" | "success";
export type LogEntry = { time: Date; line: string; level: LogLevel };

const $logStore = map<Record<number, LogEntry[]>>({});

export const getLogsForStep = (step: number): LogEntry[] => {
    return $logStore.get()[step] || [];
};

export const appendLog = (step: number, line: string, level: LogLevel = "info") => {
    $logStore.setKey(step, [...getLogsForStep(step), { time: new Date(), line, level }]);
};

export const clearLogsForStep = (step: number) => {
    $logStore.setKey(step, []);
};

export const clearAllLogs = () => {
    $logStore.set({});
};