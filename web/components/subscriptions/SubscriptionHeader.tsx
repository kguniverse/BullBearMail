"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2, Send } from "lucide-react";

interface SubscriptionHeaderProps {
    lastUpdated: Date | null;
    loading: boolean;
    sendAllLoading: boolean;
    subsCount: number;
    onRefresh: () => void;
    onSendAll: () => void;
}

export default function SubscriptionHeader({
    lastUpdated,
    loading,
    sendAllLoading,
    subsCount,
    onRefresh,
    onSendAll
}: SubscriptionHeaderProps) {
    return (
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">My Subscriptions</h2>
            <div className="flex items-center gap-4">
                <Button
                    size="sm"
                    variant="outline"
                    onClick={onSendAll}
                    disabled={sendAllLoading || subsCount === 0}
                    className="flex items-center gap-2"
                >
                    {sendAllLoading ? (
                        <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                        <Send className="h-4 w-4" />
                    )}
                    Send All
                </Button>
                <span className="text-sm text-gray-500">
                    Last Updated: {lastUpdated ? lastUpdated.toLocaleString() : "--"}
                </span>
                <Button size="sm" onClick={onRefresh} disabled={loading}>
                    {loading ? (
                        <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                        <RefreshCw className="h-4 w-4" />
                    )}
                </Button>
            </div>
        </div>
    );
}
