"use client";

import { SessionProvider } from "next-auth/react";

interface ClientLayoutProps {
    children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
    return <SessionProvider>{children}</SessionProvider>;
}
