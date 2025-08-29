"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import Link from "next/link";

function validateStock(stock: string) {
    return /^[A-Za-z0-9]{2,6}$/.test(stock);
}

function validateEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function NewSubscriptionPage() {
    const [stock, setStock] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
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
        setLoading(true);
        try {
            await axiosInstance.post("subscriptions/", {
                stock,
                email,
            });
            setSuccess("Subscription created successfully");
            setTimeout(() => router.push("/dashboard/subscriptions"), 1500);
        } catch {
            setError("Failed to create subscription");
        }
        setLoading(false);
    };

    return (
        <div className="flex h-full w-full items-center justify-center bg-background">
            <Card className="w-full max-w-md shadow-xl">
                <CardHeader>
                    <CardTitle className="text-center text-2xl font-bold">
                        New Subscription
                    </CardTitle>
                </CardHeader>
                <Separator />
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6">
                        {error && (
                            <div className="text-red-500 text-center font-medium">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="text-green-500 text-center font-medium">
                                {success}
                            </div>
                        )}
                        <Input
                            type="text"
                            placeholder="Stock Code"
                            value={stock}
                            onChange={(e) => setStock(e.target.value)}
                            required
                            className={
                                stock && !validateStock(stock)
                                    ? "border-red-500"
                                    : ""
                            }
                        />
                        <Input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className={
                                email && !validateEmail(email)
                                    ? "border-red-500"
                                    : ""
                            }
                        />
                        <Button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                        >
                            {loading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Create
                        </Button>
                    </CardContent>
                </form>
                <CardFooter>
                    <div className="mt-4 text-center">
                        <Link
                            href="/dashboard/subscriptions"
                            className="text-blue-600 underline"
                        >
                            Back to Subscription List
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div >
    );
}