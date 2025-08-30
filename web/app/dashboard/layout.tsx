import { Metadata } from "next";
import DashboardClientLayout from "@/components/dashboard/DashboardClientLayout";

export const metadata: Metadata = {
    title: "Dashboard",
    description: "Manage your stock subscriptions and monitor market updates.",
};

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return <DashboardClientLayout>{children}</DashboardClientLayout>;
}