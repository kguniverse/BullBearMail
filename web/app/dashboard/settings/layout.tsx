import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Settings",
    description: "Configure your BullBearMail preferences, notification frequency, and account settings.",
};

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
