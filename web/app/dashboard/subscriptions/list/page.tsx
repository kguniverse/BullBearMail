"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2, Plus, Trash2, Send } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

type Subscription = {
    id: number;
    user: string;
    stock: string;
    price: string;
    email: string;
};

export default function SubscriptionList() {
    const [subs, setSubs] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [sendingId, setSendingId] = useState<number | null>(null);
    const [addMode, setAddMode] = useState(false);
    const [addLoading, setAddLoading] = useState(false);
    const [newStock, setNewStock] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [error, setError] = useState("");
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [sendAllLoading, setSendAllLoading] = useState(false);
    const { data: session, status } = useSession();

    const fetchSubscriptions = () => {
        if (status !== "authenticated") return;
        setLoading(true);
        fetch("http://localhost:8000/api/subscriptions/", {
            method: "GET",
            headers: { Authorization: `Bearer ${(session as any).access}` },
        })
            .then(res => res.json())
            .then(data => {
                // 提取价格信息
                const extractedData = data.map((item: any) => ({
                    id: item.id,
                    stock: item.stock_ticker,
                    price: parseFloat(item.details.price).toFixed(2).toString() + " " + item.details.currency,
                    email: item.email,
                    user: item.user,
                }));
                setSubs(extractedData);
                setLastUpdated(new Date());
                setLoading(false);
            });
    };

    // 获取订阅列表
    useEffect(() => {
        fetchSubscriptions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session, status]);

    // 删除订阅
    const handleDelete = async (id: number) => {
        if (status !== "authenticated") return;
        await fetch(`http://localhost:8000/api/subscriptions/${id}/`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${(session as any).access}` },
        });
        setSubs(subs.filter(sub => sub.id !== id));
    };

    // 立即发送
    const handleSend = async (id: number) => {
        if (status !== "authenticated") return;
        setSendingId(id);
        await fetch(`http://localhost:8000/api/subscriptions/${id}/send/`, {
            method: "POST",
            headers: { Authorization: `Bearer ${(session as any).access}` },
        });
        setSendingId(null);
        alert("Send successful!");
    };

    // 添加订阅
    const handleAdd = async () => {
        if (status !== "authenticated") return;
        setAddLoading(true);
        const res = await fetch("http://localhost:8000/api/subscriptions/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${(session as any).access}`,
            },
            body: JSON.stringify({
                stock_ticker: newStock,
                email: newEmail,
            }),
        });
        const data = await res.json();
        if (res.ok) {
            setSubs([
                ...subs,
                {
                    id: data.id,
                    user: data.user,
                    stock: data.stock_ticker,
                    price: parseFloat(data.details.price).toFixed(2).toString() + " " + data.details.currency,
                    email: data.email,
                },
            ]);
            setNewStock("");
            setNewEmail("");
            setAddMode(false);
            setError("");
        } else {
            const errorMsg = Object.entries(data)
                .map(([field, messages]) => `${field}: ${(Array.isArray(messages) ? messages.join(", ") : messages)}`)
                .join(" | ");
            setError(errorMsg);
            // setTimeout(() => setError(""), 2000);
        }
        setAddLoading(false);
    };
    const isAdmin = (session as any)?.user?.isadmin;

    const handleSendAll = async () => {
        if (status !== "authenticated" || subs.length === 0) return;
        setSendAllLoading(true);
        // You can send all in one request if backend supports, or loop through each
        await fetch("http://localhost:8000/api/subscriptions/sendall/", {
            method: "POST",
            headers: { Authorization: `Bearer ${(session as any).access}` },
        });
        setSendAllLoading(false);
        alert("All subscriptions sent!");
    };

    return (
        <div className="max-w-3xl mx-auto mt-10">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">My Subscriptions</h2>
                <div className="flex items-center gap-4">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleSendAll}
                        disabled={sendAllLoading || subs.length === 0}
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
                    <Button size="sm" onClick={fetchSubscriptions} disabled={loading}>
                        {loading ? (
                            <Loader2 className="animate-spin h-4 w-4" />
                        ) : (
                            <RefreshCw className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </div>
            {loading ? (
                <div>Loading...</div>
            ) : (
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
                        {subs.map(sub => (
                            <TableRow key={sub.id}>
                                {isAdmin && <TableCell>{sub.user}</TableCell>}
                                <TableCell>{sub.stock}</TableCell>
                                <TableCell>{sub.price}</TableCell>
                                <TableCell>{sub.email}</TableCell>
                                <TableCell className="space-x-2 flex">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                type="button"
                                                className="p-2 rounded hover:bg-red-100 text-red-600"
                                                aria-label="Delete"
                                                onClick={() => handleDelete(sub.id)}
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
                                                disabled={sendingId === sub.id}
                                                onClick={() => handleSend(sub.id)}
                                            >
                                                {sendingId === sub.id ? (
                                                    <Loader2 className="animate-spin h-4 w-4" />
                                                ) : (
                                                    <Send className="h-4 w-4" />
                                                )}
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent>Send Now</TooltipContent>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                        {/* Quick add row */}
                        {!addMode ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center">
                                    <button
                                        type="button"
                                        className="p-2 rounded-full bg-blue-100 hover:bg-blue-200"
                                        onClick={() => setAddMode(true)}
                                    >
                                        <Plus className="h-5 w-5 text-blue-600" />
                                    </button>
                                </TableCell>
                            </TableRow>
                        ) : (
                            <TableRow>
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
                                            {addLoading ? <Loader2 className="animate-spin h-4 w-4 mx-auto" /> : "Add"}
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
                        )}
                    </TableBody>
                </Table>
            )}
            {error && <div className="mt-4 text-red-500 font-medium">{error}</div>}

        </div>
    );
}



