"use client";
import { useEffect, useState } from "react";

type Subscription = {
    id: number;
    stock: string;
    price: string;
    email: string;
};

export default function SubscriptionsPage() {
    const [subs, setSubs] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch subscription list
    useEffect(() => {
        const token = localStorage.getItem("token");
        fetch("http://localhost:8000/api/subscriptions/", {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => {
                console.log(data);
                //extract price from data.details
                const extractedData = data.map((item: any) => ({
                    id: item.id,
                    stock: item.stock_ticker,
                    price: parseFloat(item.details.price).toFixed(2).toString() + " " + item.details.currency,
                    email: item.email,
                }));
                setSubs(extractedData);
                setLoading(false);
            });
    }, []);

    // Delete subscription
    const handleDelete = async (id: number) => {
        const token = localStorage.getItem("token");
        await fetch(`http://localhost:8000/api/subscriptions/${id}/`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });
        setSubs(subs.filter(sub => sub.id !== id));
    };

    // Send now
    const handleSend = async (id: number) => {
        const token = localStorage.getItem("token");
        await fetch(`http://localhost:8000/api/subscriptions/${id}/send/`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
        });
        alert("Send successful!");
    };

    return (
        <div className="max-w-3xl mx-auto mt-10">
            <h2 className="text-2xl font-bold mb-6">My Subscriptions</h2>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <table className="w-full border rounded shadow">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2 border">Stock</th>
                            <th className="p-2 border">Price</th>
                            <th className="p-2 border">Email</th>
                            <th className="p-2 border">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subs.map(sub => (
                            <tr key={sub.id} className="text-center">
                                <td className="border p-2">{sub.stock}</td>
                                <td className="border p-2">{sub.price}</td>
                                <td className="border p-2">{sub.email}</td>
                                <td className="border p-2 space-x-2">
                                    <button
                                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                        onClick={() => handleDelete(sub.id)}
                                    >
                                        Delete
                                    </button>
                                    <button
                                        className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                                        onClick={() => handleSend(sub.id)}
                                    >
                                        Send Now
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            <div className="mt-6 text-right">
                <a href="/dashboard/subscriptions/new" className="text-blue-600 underline">Create New Subscription</a>
            </div>
        </div>
    );
}