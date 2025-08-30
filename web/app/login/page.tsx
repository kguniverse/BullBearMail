"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Head from "next/head";
import AuthLayout from "@/components/auth/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";

function LoginCard() {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard/subscriptions/list";

    return <LoginForm callbackUrl={callbackUrl} />;
}

export default function LoginPage() {
    return (
        <>
            <Head>
                <title>Login | BullBearMail</title>
                <meta name="description" content="Login to your BullBearMail account." />
            </Head>
            <Suspense fallback={<div>Loading...</div>}>
                <AuthLayout>
                    <LoginCard />
                </AuthLayout>
            </Suspense>
        </>
    );
}
