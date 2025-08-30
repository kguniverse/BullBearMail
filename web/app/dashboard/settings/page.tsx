"use client";

import Head from "next/head";
import SettingsForm from "@/components/settings/SettingsForm";

export default function SettingsPage() {
    return (
        <>
            <Head>
                <title>Settings | BullBearMail</title>
                <meta name="description" content="Manage your settings in BullBearMail." />
            </Head>
            <SettingsForm />
        </>
    );
}