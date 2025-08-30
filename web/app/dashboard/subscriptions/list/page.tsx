"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Head from "next/head";
import SubscriptionHeader from "@/components/subscriptions/SubscriptionHeader";
import SubscriptionTable from "@/components/subscriptions/SubscriptionTable";
import { Subscription } from "@/components/subscriptions/SubscriptionRow";

export default function SubscriptionListPage() {
    const [subs, setSubs] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [sendingId, setSendingId] = useState<number | null>(null);
    const [error, setError] = useState("");
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [sendAllLoading, setSendAllLoading] = useState(false);
    const { data: session, status } = useSession();

    const fetchSubscriptions = () => {
        if (status !== "authenticated") return;
        setLoading(true);
        fetch(`${process.env.NEXT_PUBLIC_DJANGO_API_URL}/subscriptions/`, {
            method: "GET",
            headers: { Authorization: `Bearer ${(session as any).access}` },
        })
            .then(res => res.json())
            .then(data => {
                if (!Array.isArray(data) || !data.length) {
                    setSubs([]);
                    setLastUpdated(new Date());
                    setLoading(false);
                    return;
                }
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

    useEffect(() => {
        fetchSubscriptions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session, status]);

    const handleDelete = async (id: number) => {
        if (status !== "authenticated") return;
        await fetch(`${process.env.NEXT_PUBLIC_DJANGO_API_URL}/subscriptions/${id}/`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${(session as any).access}` },
        });
        setSubs(subs.filter(sub => sub.id !== id));
    };

    const handleSend = async (id: number) => {
        if (status !== "authenticated") return;
        setSendingId(id);
        await fetch(`${process.env.NEXT_PUBLIC_DJANGO_API_URL}/subscriptions/${id}/send/`, {
            method: "POST",
            headers: { Authorization: `Bearer ${(session as any).access}` },
        });
        setSendingId(null);
        alert("Send successful!");
    };

    const handleAdd = async (stock: string, email: string) => {
        if (status !== "authenticated") return;

        const res = await fetch(`${process.env.NEXT_PUBLIC_DJANGO_API_URL}/subscriptions/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${(session as any).access}`,
            },
            body: JSON.stringify({
                stock_ticker: stock,
                email: email,
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
            setError("");
        } else {
            const errorMsg = Object.entries(data)
                .map(([field, messages]) => `${field}: ${(Array.isArray(messages) ? messages.join(", ") : messages)}`)
                .join(" | ");
            setError(errorMsg);
            throw new Error(errorMsg);
        }
    };

    const handleSendAll = async () => {
        if (status !== "authenticated" || subs.length === 0) return;
        setSendAllLoading(true);
        await fetch(`${process.env.NEXT_PUBLIC_DJANGO_API_URL}/subscriptions/sendall/`, {
            method: "POST",
            headers: { Authorization: `Bearer ${(session as any).access}` },
        });
        setSendAllLoading(false);
        alert("All subscriptions sent!");
    };

    const isAdmin = (session as any)?.user?.isadmin;

    return (
        <>
            <Head>
                <title>My Subscriptions</title>
            </Head>
            <div className="max-w-3xl mx-auto mt-10">
                <SubscriptionHeader
                    lastUpdated={lastUpdated}
                    loading={loading}
                    sendAllLoading={sendAllLoading}
                    subsCount={subs.length}
                    onRefresh={fetchSubscriptions}
                    onSendAll={handleSendAll}
                />
                {loading ? (
                    <div>Loading...</div>
                ) : (
                    <SubscriptionTable
                        subscriptions={subs}
                        isAdmin={isAdmin}
                        sendingId={sendingId}
                        onDelete={handleDelete}
                        onSend={handleSend}
                        onAdd={handleAdd}
                    />
                )}
                {error && <div className="mt-4 text-red-500 font-medium">{error}</div>}
            </div>
        </>
    );
}
