'use client';

import * as React from "react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Image from "next/image"
import { useTheme } from "next-themes"
import { useRouter, usePathname } from "next/navigation"
import {
    LayoutDashboard,
    CalendarCheck,
    Package2,
    Settings,
    Users,
    UserCircle,
    LogOut,
    CircleDollarSign
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useState, useEffect } from "react";

const navigation = [
    {
        title: "Dashboard",
        icon: <LayoutDashboard className="w-4 h-4 mr-2" />,
        href: "/dashboard"
    },
    {
        title: "Booking",
        icon: <CalendarCheck className="w-4 h-4 mr-2" />,
        href: "/booking"
    },
    {
        title: "Inventory",
        icon: <Package2 className="w-4 h-4 mr-2" />,
        href: "/inventory"
    },
    {
        title: "Members",
        icon: <Users className="w-4 h-4 mr-2" />,
        href: "/members"
    },
    {
        title: "Settings",
        icon: <Settings className="w-4 h-4 mr-2" />,
        href: "/settings"
    }
];

export function AppSidebar(props) {
    const { theme } = useTheme();
    const router = useRouter();
    const pathname = usePathname();
    const { user, isLimitedUser } = useAuth();

    const handleLogout = async () => {
        const result = await logout();
        if (!result.success) {
            console.error(result.error);
        }
    };

    return (
        <Sidebar className="bg-background border-r" {...props}>
            <SidebarHeader className="border-b border-accent">
                <div className="w-full flex items-center space-x-2 px-4 py-[0.23rem]">
                    <Image
                        src={theme === "light" ? "/dark-logo.png" : "/light-logo.png"}
                        alt="GameGround"
                        width={50}
                        height={30}
                    />
                    <span className="text-xl font-bold">Game Ground</span>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarMenu className="px-2 py-2">
                    <div className="space-y-1">
                        {!isLimitedUser() && (
                            <>
                                <SidebarMenuItem key="/dashboard">
                                    <SidebarMenuButton
                                        onClick={() => router.push("/dashboard")}
                                        isActive={pathname === "/dashboard"}
                                        className="w-full flex items-center px-4 py-2"
                                    >
                                        <LayoutDashboard className="w-4 h-4 mr-2" />
                                        Dashboard
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem key="/inventory">
                                    <SidebarMenuButton
                                        onClick={() => router.push("/inventory")}
                                        isActive={pathname === "/inventory"}
                                        className="w-full flex items-center px-4 py-2"
                                    >
                                        <Package2 className="w-4 h-4 mr-2" />
                                        Inventory
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem key="/members">
                                    <SidebarMenuButton
                                        onClick={() => router.push("/members")}
                                        isActive={pathname === "/members"}
                                        className="w-full flex items-center px-4 py-2"
                                    >
                                        <Users className="w-4 h-4 mr-2" />
                                        Members
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem key="/settings">
                                    <SidebarMenuButton
                                        onClick={() => router.push("/settings")}
                                        isActive={pathname === "/settings"}
                                        className="w-full flex items-center px-4 py-2"
                                    >
                                        <Settings className="w-4 h-4 mr-2" />
                                        Settings
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </>
                        )}
                        <SidebarMenuItem key="/booking">
                            <SidebarMenuButton
                                onClick={() => router.push("/booking")}
                                isActive={pathname === "/booking"}
                                className="w-full flex items-center px-4 py-2"
                            >
                                <CalendarCheck className="w-4 h-4 mr-2" />
                                Booking
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </div>
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter className="px-2 py-3 border-t">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex justify-between items-center gap-2">
                            <Avatar className="h-8 w-8">
                                {/* <AvatarImage
                                    src={`${API_URL}api/files/users/${user.id}/${user.avatar}`}
                                    alt={user.username}
                                /> */}
                                <AvatarFallback>{ user.username[0] }</AvatarFallback>
                            </Avatar>
                            {user.username}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
