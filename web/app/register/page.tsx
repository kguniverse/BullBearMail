"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    // const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        try {
            const res = await fetch("http://localhost:8000/api/auth/register/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess("Registration successful, please log in");
                setTimeout(() => router.push("/login"), 1500);
            } else {
                setError(data.message || "Registration failed");
            }
        } catch {
            setError("Network error");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded shadow-md w-full max-w-sm"
            >
                <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
                {error && <div className="mb-4 text-red-500">{error}</div>}
                {success && <div className="mb-4 text-green-500">{success}</div>}
                <input
                    type="text"
                    placeholder="Username"
                    className="w-full mb-4 p-2 border rounded"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                />
                {/* <input
                    type="email"
                    placeholder="Email"
                    className="w-full mb-4 p-2 border rounded"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                /> */}
                <input
                    type="password"
                    placeholder="Password"
                    className="w-full mb-6 p-2 border rounded"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                />
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                    Register
                </button>
                <div className="mt-4 text-center">
                    Already have an account? <a href="/login" className="text-blue-600 underline">Log in</a>
                </div>
            </form>
        </div>
    );
}