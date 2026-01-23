import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HistoryItem } from "../../../types/history";

interface ActivityListProps {
    history: HistoryItem[];
}

const getEventBadgeVariant = (type: string) => {
    switch (type) {
        case "completed":
            return "default";
        case "skipped":
            return "destructive";
        case "snoozed":
            return "secondary";
        case "cancelled":
            return "outline";
        case "idle-reset":
            return "secondary";
        default:
            return "outline";
    }
};

const formatRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 7) {
        return new Date(timestamp).toLocaleDateString();
    } else if (days > 0) {
        return `${days} day${days > 1 ? "s" : ""} ago`;
    } else if (hours > 0) {
        return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else if (minutes > 0) {
        return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else {
        return "Just now";
    }
};

const formatDuration = (ms: number | undefined) => {
    if (!ms) return "-";
    const seconds = Math.round(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
};

export default function ActivityList({ history }: ActivityListProps) {
    const recent = history.slice(0, 10);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                {recent.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                        No activity yet. Take a break to see your history here!
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left pb-2 font-medium text-sm">Time</th>
                                    <th className="text-left pb-2 font-medium text-sm">Event</th>
                                    <th className="text-left pb-2 font-medium text-sm">Duration</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recent.map((item) => (
                                    <tr key={item.id} className="border-b last:border-0">
                                        <td className="py-3 text-sm text-muted-foreground">
                                            {formatRelativeTime(item.timestamp)}
                                        </td>
                                        <td className="py-3">
                                            <Badge variant={getEventBadgeVariant(item.type)}>
                                                {item.type}
                                            </Badge>
                                        </td>
                                        <td className="py-3 text-sm">
                                            {formatDuration(item.duration_ms)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
