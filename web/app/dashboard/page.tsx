import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dashboard",
    description: "Your BullBearMail dashboard. Access all your stock subscriptions and account management tools.",
    openGraph: {
        title: "Dashboard - BullBearMail",
        description: "Manage your stock subscriptions and notifications",
    },
};

export default function DashboardPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        </div>
    );
}