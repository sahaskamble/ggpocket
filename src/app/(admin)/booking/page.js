"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { OpenStations } from "@/components/booking/OpenStations";
import { OccupiedStations } from "@/components/booking/OccupiedStations";
import { ExtendedSessions } from "@/components/booking/ExtendedSessions";

export default function Booking() {
    const [activeTab, setActiveTab] = useState("open");

    return (
        <div className="p-4 sm:p-8">
            <div className="flex items-center mb-4 sm:mb-8">
                <div className="w-full h-full flex items-center gap-2 sm:gap-4">
                    <SidebarTrigger className="ml-0 sm:ml-1" />
                    <h2 className="text-base sm:text-lg font-bold tracking-tight">Station Booking</h2>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-2 sm:space-y-4">
                <TabsList className="w-full flex justify-between">
                    <TabsTrigger className="flex-1" value="open">Open</TabsTrigger>
                    <TabsTrigger className="flex-1" value="occupied">Active</TabsTrigger>
                    <TabsTrigger className="flex-1" value="extended">Extended</TabsTrigger>
                </TabsList>

                <TabsContent value="open">
                    <OpenStations onSessionCreated={setActiveTab} />
                </TabsContent>

                <TabsContent value="occupied">
                    <OccupiedStations />
                </TabsContent>

                <TabsContent value="extended">
                    <ExtendedSessions />
                </TabsContent>
            </Tabs>
        </div>
    );
}
