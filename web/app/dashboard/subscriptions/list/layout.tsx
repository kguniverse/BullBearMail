import { Metadata } from "next";

export const metadata: Metadata = {
    title: "My Subscriptions",
    description: "View and manage your active stock subscriptions. Send notifications, add new subscriptions, or delete existing ones.",
};

export default function SubscriptionListLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
