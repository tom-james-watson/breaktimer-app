import { Settings } from "../../../types/settings";

/**
 * Determines if breaks should start immediately without any countdown delay.
 * Returns true when automatic break start is enabled with zero delay.
 */
export function shouldStartBreakImmediately(settings: Settings): boolean {
  return settings.automaticallyStartBreaks && settings.automaticallyStartBreaksDelaySeconds === 0;
}
