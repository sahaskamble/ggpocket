"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { AddDeviceDialog } from "@/components/inventory/AddDeviceDialog";
import { AddGameDialog } from "@/components/inventory/AddGameDialog";
import { AddSnackDialog } from "@/components/inventory/AddSnackDialog";
import { DevicesList } from "@/components/inventory/DevicesList";
import { GamesList } from "@/components/inventory/GamesList";
import { SnacksList } from "@/components/inventory/SnacksList";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function Inventory() {
    const [activeTab, setActiveTab] = useState("devices");
    const [openDialog, setOpenDialog] = useState("");

    return (
        <div className="p-8 text-base">
            <div className="flex items-center mb-8">
                <div className="w-full h-full flex items-center gap-4">
                    <SidebarTrigger className="ml-1" />
                    <h2 className="text-lg font-bold tracking-tight">Inventory</h2>
                </div>
                
                <Button onClick={() => setOpenDialog(activeTab)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add {activeTab.slice(0, -1)}
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="devices">Devices</TabsTrigger>
                    <TabsTrigger value="games">Games</TabsTrigger>
                    <TabsTrigger value="snacks">Snacks</TabsTrigger>
                </TabsList>

                <TabsContent value="devices">
                    <DevicesList />
                </TabsContent>

                <TabsContent value="games">
                    <GamesList />
                </TabsContent>

                <TabsContent value="snacks">
                    <SnacksList />
                </TabsContent>
            </Tabs>

            <AddDeviceDialog
                open={openDialog === "devices"}
                onOpenChange={() => setOpenDialog("")}
            />
            <AddGameDialog
                open={openDialog === "games"}
                onOpenChange={() => setOpenDialog("")}
            />
            <AddSnackDialog
                open={openDialog === "snacks"}
                onOpenChange={() => setOpenDialog("")}
            />
        </div>
    );
}