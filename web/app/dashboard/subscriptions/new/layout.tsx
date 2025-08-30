import { Metadata } from "next";

export const metadata: Metadata = {
    title: "New Subscription",
    description: "Create a new stock price subscription and set up email notifications for your chosen stocks.",
};

export default function NewSubscriptionLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
