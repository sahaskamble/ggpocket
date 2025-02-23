"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PricingForm } from "@/components/settings/PricingForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchPricings } from "@/app/lib/api__structure";
import { useSession } from "@/app/context/SessionContext";

export default function Settings() {
	const [pricing, setPricing] = useState(null);
	const [loading, setLoading] = useState(true);
	const { user } = useSession();

	useEffect(() => {
		const loadPricing = async () => {
			try {
				const pricingData = await fetchPricings();
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

