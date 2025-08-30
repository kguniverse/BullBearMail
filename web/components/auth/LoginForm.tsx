"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
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

interface LoginFormProps {
    callbackUrl?: string;
}

export default function LoginForm({ callbackUrl = "/dashboard/subscriptions/list" }: LoginFormProps) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const res = await signIn("credentials", {
            username,
            password,
            callbackUrl,
            redirect: false,
        });

        setLoading(false);

        if (res?.error) {
            setError("Incorrect username or password");
        } else if (res?.ok) {
            router.push(callbackUrl);
        }
    };

    return (
        <Card className="w-full max-w-md shadow-xl">
            <CardHeader>
                <CardTitle className="text-center text-3xl font-bold">Login</CardTitle>
            </CardHeader>
            <Separator />
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                    {error && (
                        <div className="text-red-500 text-center font-medium">{error}</div>
                    )}
                    <Input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        required
                    />
                    <Input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? (
                            <Loader2 className="animate-spin h-5 w-5 mx-auto" />
                        ) : (
                            "Login"
                        )}
                    </Button>
                </CardContent>
            </form>
            <CardFooter className="flex flex-col items-center gap-2">
                <span className="text-sm text-gray-500">
                    Don&apos;t have an account? <a href="/register" className="text-blue-600 underline">Register</a>
                </span>
            </CardFooter>
        </Card>
    );
}
