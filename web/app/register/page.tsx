"use client";

import Head from "next/head";
import AuthLayout from "@/components/auth/AuthLayout";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
    return (
        <>
            <Head>
                <title>Register | BullBearMail</title>
                <meta name="description" content="Create a new BullBearMail account." />
            </Head>
            <AuthLayout>
                <RegisterForm />
            </AuthLayout>
        </>
    );
}