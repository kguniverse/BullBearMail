"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import {
    TableRow,
    TableCell,
} from "@/components/ui/table";

interface AddSubscriptionRowProps {
    isAdmin: boolean;
    onAdd: (stock: string, email: string) => Promise<void>;
}

export default function AddSubscriptionRow({ isAdmin, onAdd }: AddSubscriptionRowProps) {
    const [addMode, setAddMode] = useState(false);
    const [addLoading, setAddLoading] = useState(false);
    const [newStock, setNewStock] = useState("");
    const [newEmail, setNewEmail] = useState("");

    const handleAdd = async () => {
        setAddLoading(true);
        try {
            await onAdd(newStock, newEmail);
            setNewStock("");
            setNewEmail("");
            setAddMode(false);
        } catch {
            // Error handling is done in parent component
        }
        setAddLoading(false);
    };

    if (!addMode) {
        return (
            <TableRow>
                <TableCell colSpan={isAdmin ? 5 : 4} className="text-center">
                    <button
                        type="button"
                        className="p-2 rounded-full bg-blue-100 hover:bg-blue-200"
                        onClick={() => setAddMode(true)}
                    >
                        <Plus className="h-5 w-5 text-blue-600" />
                    </button>
                </TableCell>
            </TableRow>
        );
    }

    return (
        <TableRow>
            {isAdmin && (
                <TableCell>
                    <span className="text-gray-400">Auto</span>
                </TableCell>
            )}
            <TableCell>
                <input
                    type="text"
                    className="border rounded px-2 py-1 w-full"
                    placeholder="Stock"
                    value={newStock}
                    onChange={e => setNewStock(e.target.value)}
                />
            </TableCell>
            <TableCell>
                <span className="text-gray-400">Auto</span>
            </TableCell>
            <TableCell>
                <input
                    type="email"
                    className="border rounded px-2 py-1 w-full"
                    placeholder="Email"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                />
            </TableCell>
            <TableCell>
                <div className="flex gap-2">
                    <button
                        type="button"
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        onClick={handleAdd}
                        disabled={addLoading || !newStock || !newEmail}
                    >
                        {addLoading ? (
                            <Loader2 className="animate-spin h-4 w-4 mx-auto" />
                        ) : (
                            "Add"
                        )}
                    </button>
                    <button
                        type="button"
                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                        onClick={() => setAddMode(false)}
                    >
                        Cancel
                    </button>
                </div>
            </TableCell>
        </TableRow>
    );
}
