"use client";

import { useState, useEffect } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PricingForm } from "@/components/settings/PricingForm";
import { fetchPricing } from "@/lib/db_data_helper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Settings() {
    const [pricing, setPricing] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPricing = async () => {
            try {
                const pricingData = await fetchPricing();
                setPricing(pricingData[0]);
            } catch (error) {
                console.error('Error loading pricing:', error);
            } finally {
                setLoading(false);
            }
        };
        loadPricing();
    }, []);

    return (
        <div className="p-4 sm:p-8">
            <div className="flex items-center mb-4 sm:mb-8">
                <div className="w-full h-full flex items-center gap-2 sm:gap-4">
                    <SidebarTrigger className="ml-0 sm:ml-1" />
                    <h2 className="text-base sm:text-lg font-bold tracking-tight">Settings</h2>
                </div>
            </div>

            <Tabs defaultValue="pricing" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="pricing">Pricing</TabsTrigger>
                    <TabsTrigger value="general">General</TabsTrigger>
                </TabsList>

                <TabsContent value="pricing">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pricing Settings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!loading && <PricingForm initialData={pricing} />}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="general">
                    <Card>
                        <CardHeader>
                            <CardTitle>General Settings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>General settings coming soon...</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
