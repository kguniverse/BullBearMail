"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import Head from "next/head";

function validatePassword(password: string) {
    return {
        length: password.length >= 8,
        lowercase: /[a-z]/.test(password),
        uppercase: /[A-Z]/.test(password),
        special: /[^A-Za-z0-9]/.test(password),
    };
}

export default function RegisterPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const passwordValid = validatePassword(password);
    const allValid = Object.values(passwordValid).every(Boolean);
    const passwordsMatch = password === confirmPassword && password.length > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        if (!allValid) {
            setError("Password does not meet requirements.");
            return;
        }
        if (!passwordsMatch) {
            setError("Passwords do not match.");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_DJANGO_API_URL}/auth/register/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();
            setLoading(false);
            if (res.ok) {
                setSuccess("Registration successful, please log in");
                setTimeout(() => router.push("/login"), 1500);
            } else {
                setError(data.message || "Registration failed");
            }
        } catch {
            setLoading(false);
            setError("Network error");
        }
    };

    return (
        <>
            <Head>
                <title>Register | BullBearMail</title>
                <meta name="description" content="Create a new BullBearMail account." />
            </Head>
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200">
                <Card className="w-full max-w-md shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-center text-3xl font-bold">Register</CardTitle>
                    </CardHeader>
                    <Separator />
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-6">
                            {error && (
                                <div className="text-red-500 text-center font-medium">{error}</div>
                            )}
                            {success && (
                                <div className="text-green-500 text-center font-medium">{success}</div>
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
                            <Input
                                type="password"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                required
                            />
                            <div className="text-sm mt-2 mb-4 space-y-1">
                                <div className="flex items-center gap-2">
                                    {passwordValid.length ? (
                                        <CheckCircle2 className="text-green-500 w-4 h-4" />
                                    ) : (
                                        <XCircle className="text-red-500 w-4 h-4" />
                                    )}
                                    <span>At least 8 characters</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {passwordValid.lowercase ? (
                                        <CheckCircle2 className="text-green-500 w-4 h-4" />
                                    ) : (
                                        <XCircle className="text-red-500 w-4 h-4" />
                                    )}
                                    <span>Contains lowercase letter</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {passwordValid.uppercase ? (
                                        <CheckCircle2 className="text-green-500 w-4 h-4" />
                                    ) : (
                                        <XCircle className="text-red-500 w-4 h-4" />
                                    )}
                                    <span>Contains uppercase letter</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {passwordValid.special ? (
                                        <CheckCircle2 className="text-green-500 w-4 h-4" />
                                    ) : (
                                        <XCircle className="text-red-500 w-4 h-4" />
                                    )}
                                    <span>Contains special character</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {passwordsMatch ? (
                                        <CheckCircle2 className="text-green-500 w-4 h-4" />
                                    ) : (
                                        <XCircle className="text-red-500 w-4 h-4" />
                                    )}
                                    <span>Passwords match</span>
                                </div>
                            </div>
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={loading || !allValid || !passwordsMatch}
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin h-5 w-5 mx-auto" />
                                ) : (
                                    "Register"
                                )}
                            </Button>
                        </CardContent>
                    </form>
                    <CardFooter className="flex flex-col items-center gap-2">
                        <span className="text-sm text-gray-500">
                            Already have an account?{" "}
                            <a href="/login" className="text-blue-600 underline">
                                Log in
                            </a>
                        </span>
                    </CardFooter>
                </Card>
            </div>
        </>
    );
}