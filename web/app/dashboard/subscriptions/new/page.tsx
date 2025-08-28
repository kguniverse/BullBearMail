"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";

function validateStock(stock: string) {
    return /^[A-Za-z0-9]{2,6}$/.test(stock);
}

function validateEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function NewSubscriptionPage() {
    const [stock, setStock] = useState("");
    const [price, setPrice] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        if (!validateStock(stock)) {
            setError("Invalid stock code format");
            return;
        }
        if (!validateEmail(email)) {
            setError("Invalid email format");
            return;
        }
        if (!price || isNaN(Number(price))) {
            setError("Price must be a number");
            return;
        }
        try {
            await axiosInstance.post("subscriptions/", {
                stock,
                email,
                price: Number(price),
            });
            setSuccess("Subscription created successfully");
            setTimeout(() => router.push("/subscriptions"), 1500);
        } catch {
            setError("Failed to create subscription");
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded shadow">
            <h2 className="text-2xl font-bold mb-6 text-center">New Subscription</h2>
            {error && <div className="mb-4 text-red-500">{error}</div>}
            {success && <div className="mb-4 text-green-500">{success}</div>}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Stock Code"
                    className={`w-full mb-4 p-2 border rounded ${stock && !validateStock(stock) ? "border-red-500" : ""}`}
                    value={stock}
                    onChange={e => setStock(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Price"
                    className={`w-full mb-4 p-2 border rounded ${price && isNaN(Number(price)) ? "border-red-500" : ""}`}
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    className={`w-full mb-6 p-2 border rounded ${email && !validateEmail(email) ? "border-red-500" : ""}`}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                />
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                    Create
                </button>
            </form>
            <div className="mt-4 text-center">
                <a href="/subscriptions" className="text-blue-600 underline">Back to Subscription List</a>
            </div>
        </div>
    );
}