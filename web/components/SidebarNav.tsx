"use client";
import {
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarFooter,
} from "@/components/ui/sidebar";
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { User2, ChevronUp, Plus, List } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

const navigation = [
    {
        title: "Subscriptions", items: [
            { title: "All Subscriptions", href: "/dashboard/subscriptions/list", icon: List },
            { title: "New Subscription", href: "/dashboard/subscriptions/new", icon: Plus }
        ]
    }
];

export default function SidebarNav() {
    const { data } = useSession();

    return (
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
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton>
                                    <User2 /> {(data as any)?.user?.name || "No Username"}
                                    <ChevronUp className="ml-auto" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                                <DropdownMenuItem>
                                    <span>Account</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <button
                                        type="button"
                                        className="w-full text-left"
                                        onClick={() => {
                                            signOut();
                                        }}
                                    >
                                        Sign Out
                                    </button>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}