"use client";

import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, ReactNode } from "react";
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar";
import Header from "@/components/header";
import SidebarNav from "@/components/SidebarNav";

interface DashboardLayoutProps {
    children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { status } = useSession();
    const hideSidebar = pathname === "/login" || pathname === "/register";

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    // 未登录时不显示内容
    if (status === "unauthenticated") {
        return null;
    }

    if (hideSidebar) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                {children}
            </main>
        );
    }

    return (
        <SidebarProvider defaultOpen={true}>
            <SidebarNav />
            <SidebarInset>
                <Header />
                <div className="p-8">{children}</div>
            </SidebarInset>
        </SidebarProvider>
    );
}
