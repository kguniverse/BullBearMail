"use client";

import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
} from "@/components/ui/table";
import SubscriptionRow, { Subscription } from "./SubscriptionRow";
import AddSubscriptionRow from "./AddSubscriptionRow";

interface SubscriptionTableProps {
    subscriptions: Subscription[];
    isAdmin: boolean;
    sendingId: number | null;
    onDelete: (id: number) => void;
    onSend: (id: number) => void;
    onAdd: (stock: string, email: string) => Promise<void>;
}

export default function SubscriptionTable({
    subscriptions,
    isAdmin,
    sendingId,
    onDelete,
    onSend,
    onAdd
}: SubscriptionTableProps) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    {isAdmin && <TableHead>User</TableHead>}
                    <TableHead>Stock</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {subscriptions.map(sub => (
                    <TableRow key={sub.id}>
                        <SubscriptionRow
                            subscription={sub}
                            isAdmin={isAdmin}
                            sendingId={sendingId}
                            onDelete={onDelete}
                            onSend={onSend}
                        />
                    </TableRow>
                ))}
                <AddSubscriptionRow isAdmin={isAdmin} onAdd={onAdd} />
            </TableBody>
        </Table>
    );
}
