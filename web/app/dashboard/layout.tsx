"use client";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import {
    SidebarInset,
    SidebarProvider,
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton
} from "@/components/ui/sidebar";
import Header from "@/components/header";
import { Plus, List } from "lucide-react";
import Link from "next/link";

const navigation = [
    {
        title: "Subscriptions", items: [
            { title: "All Subscriptions", href: "/dashboard/subscriptions/list", icon: List },
            { title: "New Subscription", href: "/dashboard/subscriptions/new", icon: Plus }
        ]
    }
]


export default function MainLayout({ children }: { children: React.ReactNode }) {
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

    return (hideSidebar ? (
        <main className="min-h-screen flex items-center justify-center">{children}</main>
    ) : (
        <SidebarProvider defaultOpen={false}>
            <Sidebar variant="inset">
                <SidebarHeader>
                    <h1 className="text-2xl font-bold">Navigation</h1>
                </SidebarHeader>
                <SidebarContent>
                    {navigation.map((group) => (
                        <SidebarGroup key={group.title}>
                            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                            <SidebarMenu>
                                {group.items.map((item) => (
                                    <SidebarMenuItem key={item.href}>
                                        <SidebarMenuButton asChild>
                                            <Link href={item.href}>
                                                {item.icon && <item.icon className="mr-2" />}
                                                {item.title}
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroup>
                    ))}
                </SidebarContent>
            </Sidebar>
            <SidebarInset>
                <Header />
                <div className="p-8">{children}</div>
            </SidebarInset>
        </SidebarProvider>
    ));
}