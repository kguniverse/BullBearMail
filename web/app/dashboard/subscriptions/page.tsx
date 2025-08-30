"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";

export default function SubscriptionsRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace("/dashboard/subscriptions/list");
    }, [router]);

    return (
        <>
            <Head>
                <title>Subscriptions | BullBearMail</title>
                <meta name="description" content="Manage your stock subscriptions." />
            </Head>
            <div>Redirecting to subscriptions list...</div>
        </>
    );
}

