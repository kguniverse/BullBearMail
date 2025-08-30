"use client";

import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { TableCell } from "@/components/ui/table";
import { Trash2, Send, Loader2 } from "lucide-react";

export interface Subscription {
    id: number;
    user: string;
    stock: string;
    price: string;
    email: string;
}

interface SubscriptionRowProps {
    subscription: Subscription;
    isAdmin: boolean;
    sendingId: number | null;
    onDelete: (id: number) => void;
    onSend: (id: number) => void;
}

export default function SubscriptionRow({
    subscription,
    isAdmin,
    sendingId,
    onDelete,
    onSend
}: SubscriptionRowProps) {
    return (
        <>
            {isAdmin && <TableCell className="px-6 py-4 whitespace-nowrap text-sm">{subscription.user}</TableCell>}
            <TableCell className="px-6 py-4 whitespace-nowrap text-sm">{subscription.stock}</TableCell>
            <TableCell className="px-6 py-4 whitespace-nowrap text-sm">{subscription.price}</TableCell>
            <TableCell className="px-6 py-4 whitespace-nowrap text-sm">{subscription.email}</TableCell>
            <TableCell className="px-6 py-4 whitespace-nowrap text-sm space-x-2 flex">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            type="button"
                            className="p-2 rounded hover:bg-red-100 text-red-600"
                            aria-label="Delete"
                            onClick={() => onDelete(subscription.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent>Delete</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            type="button"
                            className="p-2 rounded hover:bg-blue-100 text-blue-600"
                            aria-label="Send Now"
                            disabled={sendingId === subscription.id}
                            onClick={() => onSend(subscription.id)}
                        >
                            {sendingId === subscription.id ? (
                                <Loader2 className="animate-spin h-4 w-4" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </button>
                    </TooltipTrigger>
                    <TooltipContent>Send Now</TooltipContent>
                </Tooltip>
            </TableCell>
        </>
    );
}
