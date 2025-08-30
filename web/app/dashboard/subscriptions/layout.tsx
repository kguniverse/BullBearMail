import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Subscriptions",
    description: "Manage your stock price subscriptions and email notifications.",
};

export default function SubscriptionsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
