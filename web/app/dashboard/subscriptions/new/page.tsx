"use client";

import Head from "next/head";
import NewSubscriptionForm from "@/components/subscriptions/NewSubscriptionForm";

export default function NewSubscriptionPage() {
    return (
        <>
            <Head>
                <title>New Subscription | BullBearMail</title>
                <meta name="description" content="Create a new subscription for BullBearMail." />
            </Head>
            <NewSubscriptionForm />
        </>
    );
}