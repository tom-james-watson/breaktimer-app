import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useMemo, useState } from "react";
import { BreakEvent, statsRetentionDayOptions } from "../../../types/stats";
import { toast } from "../../toaster";
import SettingsCard from "../settings/settings-card";
import {
  BreakCounts,
  countBreakEvents,
  getCompletionRate,
  getDailyBreakCounts,
  startOfPeriod,
} from "./statistics-utils";

const categories: {
  key: keyof BreakCounts;
  label: string;
  color: string;
}[] = [
  { key: "completed", label: "Taken", color: "bg-emerald-500" },
  { key: "endedEarly", label: "Cut short", color: "bg-amber-400" },
  { key: "skipped", label: "Skipped", color: "bg-rose-500" },
  { key: "snoozed", label: "Snoozed", color: "bg-sky-500" },
  { key: "away", label: "Away", color: "bg-violet-500" },
];

const CHART_DAYS = 7;

export default function Statistics() {
  const [events, setEvents] = useState<BreakEvent[] | null>(null);
  const [retentionDays, setRetentionDays] = useState<number | null>(null);
  const [period, setPeriod] = useState("7");
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    (async () => {
      setEvents((await ipcRenderer.invokeGetStats()) as BreakEvent[]);
      setRetentionDays(await ipcRenderer.invokeGetStatsRetention());
    })();
  }, []);

  const counts = useMemo(
    () =>
      countBreakEvents(
        events ?? [],
        // Stored events are already limited to the retention period
        period === "all" ? new Date(0) : startOfPeriod(Number(period)),
      ),
    [events, period],
  );

  const daily = useMemo(
    () => getDailyBreakCounts(events ?? [], CHART_DAYS),
    [events],
  );

  if (events === null || retentionDays === null) {
    return null;
  }

  const completionRate = getCompletionRate(counts);
  const maxDailyTotal = Math.max(
    1,
    ...daily.map(({ counts }) =>
      categories.reduce((sum, { key }) => sum + counts[key], 0),
    ),
  );

  const handleClear = async () => {
    await ipcRenderer.invokeClearStats();
    setEvents([]);
    setConfirmClear(false);
    toast("Statistics cleared");
  };

  const handleRetentionDaysChange = async (value: string) => {
    const days = Number(value);
    await ipcRenderer.invokeSetStatsRetention(days);
    setRetentionDays(days);
    // Changing the retention period can delete older events
    setEvents((await ipcRenderer.invokeGetStats()) as BreakEvent[]);
  };

  return (
    <div className="h-screen w-full flex flex-col bg-background">
      <div className="border-b border-border bg-background">
        <nav className="flex items-center p-4 h-16 min-h-16">
          <h1 className="text-2xl font-bold text-foreground">Statistics</h1>
        </nav>
      </div>
      <div className="flex-1 overflow-auto p-6 min-h-0 space-y-8">
        <SettingsCard title="Overview">
          <div className="space-y-4">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Today</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="all">All recorded</SelectItem>
              </SelectContent>
            </Select>

            <div className="grid grid-cols-5 gap-2">
              {categories.map(({ key, label, color }) => (
                <div
                  key={key}
                  className="rounded-md border border-border px-2.5 py-3"
                >
                  <div className="flex items-center gap-1.5 whitespace-nowrap text-sm text-muted-foreground">
                    <span className={`size-2 shrink-0 rounded-full ${color}`} />
                    {label}
                  </div>
                  <div className="text-2xl font-semibold tabular-nums">
                    {counts[key]}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-sm text-muted-foreground">
              {completionRate === null
                ? "No breaks recorded in this period yet."
                : `You took ${Math.round(completionRate * 100)}% of the breaks you were prompted for.`}
            </p>
          </div>
        </SettingsCard>

        <SettingsCard title="Last 7 days">
          <div className="space-y-2">
            {daily.map(({ date, counts }) => {
              const total = categories.reduce(
                (sum, { key }) => sum + counts[key],
                0,
              );
              return (
                <div
                  key={date.toISOString()}
                  className="flex items-center gap-3 text-sm"
                >
                  <span className="w-10 text-muted-foreground">
                    {date.toLocaleDateString(undefined, { weekday: "short" })}
                  </span>
                  <div className="flex h-4 flex-1 overflow-hidden rounded-sm bg-muted">
                    {categories.map(({ key, label, color }) =>
                      counts[key] > 0 ? (
                        <div
                          key={key}
                          className={color}
                          style={{
                            width: `${(counts[key] / maxDailyTotal) * 100}%`,
                          }}
                          title={`${label}: ${counts[key]}`}
                        />
                      ) : null,
                    )}
                  </div>
                  <span className="w-6 text-right tabular-nums">{total}</span>
                </div>
              );
            })}
          </div>
        </SettingsCard>

        <SettingsCard
          title="Data"
          helperText="Statistics are stored only on this device and deleted automatically after the retention period."
        >
          <div className="flex items-end justify-between gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Keep statistics for</Label>
              <Select
                value={retentionDays.toString()}
                onValueChange={handleRetentionDaysChange}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statsRetentionDayOptions.map((days) => (
                    <SelectItem key={days} value={days.toString()}>
                      {days} days
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              onClick={() => setConfirmClear(true)}
              disabled={events.length === 0}
            >
              Clear statistics
            </Button>
          </div>
        </SettingsCard>
      </div>

      <Dialog open={confirmClear} onOpenChange={setConfirmClear}>
        <DialogContent className="max-w-[400px] w-[400px]">
          <DialogHeader className="text-left">
            <DialogTitle>Clear statistics?</DialogTitle>
            <DialogDescription>
              All recorded breaks will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmClear(false)}>
              Cancel
            </Button>
            <Button onClick={handleClear}>Clear</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
