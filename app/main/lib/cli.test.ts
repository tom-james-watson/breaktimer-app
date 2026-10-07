import { beforeEach, describe, expect, it, vi } from "vitest";

const harness = vi.hoisted(() => ({
  setBreaksEnabled: vi.fn(),
  setDisableEndTime: vi.fn(),
}));

vi.mock("electron-log", () => ({ default: { info: vi.fn() } }));
vi.mock("./store", () => ({
  setBreaksEnabled: harness.setBreaksEnabled,
  setDisableEndTime: harness.setDisableEndTime,
}));

describe("cli", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  describe("getCliAction", () => {
    const cases: [string[], "enable" | "disable" | null][] = [
      [["/usr/bin/breaktimer", "disable"], "disable"],
      [["/usr/bin/breaktimer", "enable"], "enable"],
      [["C:\\Program Files\\BreakTimer\\BreakTimer.exe", "disable"], "disable"],
      [["C:\\Program Files\\BreakTimer\\BreakTimer.exe", "enable"], "enable"],
      [["/usr/bin/breaktimer"], null],
      [[], null],
      [["/usr/bin/breaktimer", "--no-sandbox"], null],
      [["/usr/bin/breaktimer", "foo"], null],
      [["/usr/bin/breaktimer", "--no-sandbox", "disable"], "disable"],
      [
        [
          "/usr/bin/breaktimer",
          "disable",
          "--user-data-dir=/home/user/.config",
        ],
        "disable",
      ],
    ];

    it.each(cases)("parses %j -> %j", async (args, expected) => {
      const cli = await import("./cli.js");
      expect(cli.getCliAction(args)).toBe(expected);
    });
  });

  describe("applyCliAction", () => {
    it("enables breaks and clears any pending timed disable", async () => {
      const cli = await import("./cli.js");

      cli.applyCliAction("enable");

      expect(harness.setDisableEndTime).toHaveBeenCalledOnce();
      expect(harness.setDisableEndTime).toHaveBeenCalledWith(null);
      expect(harness.setBreaksEnabled).toHaveBeenCalledOnce();
      expect(harness.setBreaksEnabled).toHaveBeenCalledWith(true);
    });

    it("disables breaks without touching the disable end time", async () => {
      const cli = await import("./cli.js");

      cli.applyCliAction("disable");

      expect(harness.setBreaksEnabled).toHaveBeenCalledOnce();
      expect(harness.setBreaksEnabled).toHaveBeenCalledWith(false);
      expect(harness.setDisableEndTime).not.toHaveBeenCalled();
    });
  });
});
