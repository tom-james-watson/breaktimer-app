import { useEffect, useState } from "react";
import { HistoryItem } from "../../types/history";
import MetricsCards from "./dashboard/metrics-cards";
import ActivityList from "./dashboard/activity-list";

export default function Dashboard() {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = (await ipcRenderer.invokeGetHistory()) as HistoryItem[];
                setHistory(data);
            } catch (error) {
                console.error("Failed to fetch history:", error);
            } finally {
                setLoading(false);
            }
        };

        // Initial load
        fetchHistory();

        // Listen for updates (LiveData pattern)
        ipcRenderer.onHistoryUpdated(() => {
            console.log("History updated! Refreshing...");
            fetchHistory();
        });
    }, []);

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-background">
                <p className="text-muted-foreground">Loading...</p>
            </div>
        );
    }

    return (
        <div className="h-screen w-full flex flex-col bg-background">
            <div className="border-b px-6 py-4">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                    Track your break history and statistics
                </p>
            </div>

            <div className="flex-1 overflow-auto p-6 space-y-6">
                <MetricsCards history={history} />
                <ActivityList history={history} />
            </div>
        </div>
    );
}
