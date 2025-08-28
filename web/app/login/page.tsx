"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard/subscriptions/list";

    // 登录表单提交
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        const res = await signIn("credentials", {
            username,
            password,
            callbackUrl,
            redirect: false,
        });
        if (res?.error) {
            console.log(res);
            setError("用户名或密码错误");
        } else if (res?.ok) {
            console.log(res);
            router.push(callbackUrl);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded shadow-md w-full max-w-sm"
            >
                <h2 className="text-2xl font-bold mb-6 text-center">登录</h2>
                {error && <div className="mb-4 text-red-500">{error}</div>}
                <input
                    type="text"
                    placeholder="username"
                    className="w-full mb-4 p-2 border rounded"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="password"
                    className="w-full mb-6 p-2 border rounded"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                />
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                    登录
                </button>
                <div className="mt-4 text-center">
                    没有账号？ <a href="/register" className="text-blue-600 underline">注册</a>
                </div>
            </form>
        </div>
    );
}