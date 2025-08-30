"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";

function LoginCard() {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard/subscriptions/list";

    return <LoginForm callbackUrl={callbackUrl} />;
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AuthLayout>
                <LoginCard />
            </AuthLayout>
        </Suspense>
    );
}
