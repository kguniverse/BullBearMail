import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Register",
    description: "Create a new BullBearMail account to start monitoring stock prices and receiving email notifications.",
    robots: {
        index: false,
        follow: false,
    },
};

export default function RegisterLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
