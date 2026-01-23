import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HistoryItem } from "../../../types/history";

interface MetricsCardsProps {
    history: HistoryItem[];
}

export default function MetricsCards({ history }: MetricsCardsProps) {
    // Calculate metrics
    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

    const thisWeek = history.filter((item) => item.timestamp >= oneWeekAgo);
    const completed = thisWeek.filter((item) => item.type === "completed");
    const total = thisWeek.filter((item) =>
        item.type === "completed" || item.type === "skipped" || item.type === "cancelled"
    );

    const completionRate = total.length > 0
        ? Math.round((completed.length / total.length) * 100)
        : 0;

    const avgDuration = completed.length > 0
        ? Math.round(
            completed.reduce((sum, item) => sum + (item.duration_ms || 0), 0) /
            completed.length / 1000
        )
        : 0;

    // Calculate streak (consecutive days with at least 1 completed break)
    const calculateStreak = () => {
        const completedByDay = new Map<string, number>();

        history
            .filter((item) => item.type === "completed")
            .forEach((item) => {
                const date = new Date(item.timestamp).toDateString();
                completedByDay.set(date, (completedByDay.get(date) || 0) + 1);
            });

        let streak = 0;
        const today = new Date();

        for (let i = 0; i < 365; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - i);
            const dateStr = checkDate.toDateString();

            if (completedByDay.has(dateStr)) {
                streak++;
            } else if (i > 0) {
                // Only break streak if not today (allow current day to not have breaks yet)
                break;
            }
        }

        return streak;
    };

    const streak = calculateStreak();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        This Week
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{thisWeek.length}</div>
                    <p className="text-xs text-muted-foreground">Total events</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Completion Rate
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{completionRate}%</div>
                    <p className="text-xs text-muted-foreground">
                        {completed.length} of {total.length} completed
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Avg Duration
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{avgDuration}s</div>
                    <p className="text-xs text-muted-foreground">Per completed break</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Current Streak
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{streak}</div>
                    <p className="text-xs text-muted-foreground">
                        {streak === 1 ? "day" : "days"}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
