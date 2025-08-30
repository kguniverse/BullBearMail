"use client";

import DashboardLayout from "./DashboardLayout";

interface DashboardClientLayoutProps {
    children: React.ReactNode;
}

export default function DashboardClientLayout({ children }: DashboardClientLayoutProps) {
    return <DashboardLayout>{children}</DashboardLayout>;
}
