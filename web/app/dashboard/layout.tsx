"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return <DashboardLayout>{children}</DashboardLayout>;
}