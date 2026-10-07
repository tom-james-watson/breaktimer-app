import log from "electron-log";
import { setBreaksEnabled, setDisableEndTime } from "./store";

export type CliAction = "enable" | "disable";

export function getCliAction(args: string[]): CliAction | null {
  const relevantArgs = args.filter((arg) => !arg.startsWith("-"));

  for (const arg of relevantArgs.slice(1)) {
    if (arg === "enable" || arg === "disable") {
      return arg;
    }
  }

  return null;
}

export function applyCliAction(action: CliAction): void {
  log.info(`Handling cli argument [action=${action}]`);

  if (action === "enable") {
    log.info("Enabling breaks from cli");
    setDisableEndTime(null);
    setBreaksEnabled(true);
  } else {
    log.info("Disabling breaks from cli");
    setBreaksEnabled(false);
  }
}
